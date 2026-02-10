/**
 * 曲线模块 - 独立可移植模板
 * 
 * ========== 使用指南 ==========
 * 这是一个空白模板，用于绘制设备参数随时间变化的曲线
 * 
 * 1. 配置模块
 *    - 修改 config 中的单元配置
 *    - 添加你需要显示的数据系列（series）
 *    - 配置DOM元素ID
 * 
 * 2. 实现数据查询
 *    - 修改 buildSQL() 构建你的SQL语句
 *    - 通过 sendSQL() 调用后端API
 *    - 在 getMockData() 中生成模拟数据（用于测试）
 * 
 * 3. 自定义曲线样式
 *    - 在 getMockData() 中修改数据生成逻辑
 *    - 在 renderChart() 中调整图表配置
 *    - 修改series中的颜色（color字段）
 * 
 * 4. 在HTML中调用
 *    - 确保PageManager.initPageModule()中调用了CurveModule.init()
 * ==============================
 */
window.CurveModule = {
    // ==================== 配置区域 ====================
    config: {
        // 变电所-变压器配置（含仪表编号No映射）
        substationMap: {
            station1: {
                name: '一号变电所',
                transformers: [
                    { id: 'station1_trans1', name: '1#主变压器', no: 51 },
                    { id: 'station1_trans2', name: '2#主变压器', no: 52 }
                ]
            },
            station2: {
                name: '二号变电所',
                transformers: [
                    { id: 'station2_trans1', name: '1#主变压器', no: 12 },
                    { id: 'station2_trans2', name: '2#主变压器', no: 16 },
                    { id: 'station2_trans3', name: '3#主变压器', no: 17 },
                    { id: 'station2_trans4', name: '4#主变压器', no: 20 }
                ]
            },
            station3: {
                name: '三号变电所',
                transformers: [
                    { id: 'station3_trans1', name: '1#主变压器', no: 1 },
                    { id: 'station3_trans2', name: '2#主变压器', no: 26 }
                ]
            }
        },
        
        elementIds: {
            stationSelect: 'curve-station-select',
            transformerSelect: 'curve-transformer-select',
            phaseSelect: 'curve-phase-select',
            timeMode: 'curve-time-mode',
            startDate: 'curve-start-date',
            endDate: 'curve-end-date',
            searchBtn: 'curve-search-btn',
            chartContainer: 'curve-chart'
        },
        
        // 数据表配置
        tableName: 'data_temp',
        timeField: 'date',
        
        // 曲线颜色配置
        colors: {
            A: '#5470c6',  // 蓝色 - A相
            B: '#91cc75',  // 绿色 - B相
            C: '#fac858'   // 黄色 - C相
        }
    },
    // ==================== 配置区域结束 ====================
    
    isInitialized: false,
    chartInstance: null,
    
    currentQuery: {
        timeMode: 'day',
        singleDate: '',
        rangeStartDate: '',
        rangeEndDate: '',
        station: 'all',
        transformer: 'all',
        phase: 'all'
    },
    
    /**
     * 初始化模块
     */
    init: function() {
        if (this.isInitialized) {
            console.log('曲线模块已初始化，跳过重复初始化');
            return;
        }
        
        console.log('正在初始化曲线模块...');
        
        this.currentQuery.station = 'all';
        this.currentQuery.transformer = 'all';
        this.currentQuery.phase = 'all';
        this.initDatePickers();
        this.bindEvents();
        this.initChart();
        
        // 初始化变压器下拉框（显示所有变压器）
        this.updateTransformerSelect('all');
        
        this.isInitialized = true;
        console.log('✓ 曲线模块初始化完成');
    },
    
    /**
     * 初始化日期选择器
     */
    initDatePickers: function() {
        const self = this;
        
        if (typeof layui === 'undefined') {
            console.error('LayUI未加载');
            return;
        }
        
        layui.use(['laydate', 'form'], function() {
            const laydate = layui.laydate;
            const form = layui.form;
            const $ = layui.$;
            
            form.render('select');
            
            form.on('select(curve-time-mode)', function(data) {
                self.switchTimeMode(data.value, laydate, $);
            });
            
            self.switchTimeMode('day', laydate, $);
        });
    },
    
    /**
     * 切换时间选择模式
     */
    switchTimeMode: function(mode, laydate, $) {
        const self = this;
        self.currentQuery.timeMode = mode;
        console.log('切换到时间模式：', mode);
        
        if (mode === 'day') {
            $("#curve-date-rangeLinked .layui-form-mid").hide();
            $("#curve-end-date").parent().hide();
            
            $('.layui-laydate').remove();
            laydate.render({
                type: "date",
                elem: '#curve-start-date',
                value: new Date(),
                done: function(value) {
                    $('#curve-start-date').val(value);
                    self.currentQuery.singleDate = value;
                }
            });
            
        } else if (mode === 'range') {
            $("#curve-date-rangeLinked .layui-form-mid").show();
            $("#curve-end-date").parent().show();
            
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 6);
            
            const startDateStr = self.formatDate(sevenDaysAgo);
            const endDateStr = self.formatDate(now);
            
            $('.layui-laydate').remove();
            
            $('#curve-start-date').val(startDateStr);
            $('#curve-end-date').val(endDateStr);
            
            laydate.render({
                type: "date",
                elem: '#curve-date-rangeLinked',
                range: ['#curve-start-date', '#curve-end-date'],
                rangeLinked: true,
                value: startDateStr + ' - ' + endDateStr,
                done: function(value) {
                    const dates = value.split(' - ');
                    if (dates.length === 2) {
                        self.currentQuery.rangeStartDate = dates[0];
                        self.currentQuery.rangeEndDate = dates[1];
                    }
                }
            });
        }
    },
    
    /**
     * 格式化日期
     */
    formatDate: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    /**
     * 绑定事件
     */
    bindEvents: function() {
        const self = this;
        
        // 变电所下拉框变化事件 - 联动更新变压器下拉框
        layui.form.on('select(curve-station-select)', function(data) {
            self.updateTransformerSelect(data.value);
            self.currentQuery.station = data.value;
        });
        
        // 变压器下拉框变化事件
        layui.form.on('select(curve-transformer-select)', function(data) {
            self.currentQuery.transformer = data.value;
        });
        
        // 相位下拉框变化事件
        layui.form.on('select(curve-phase-select)', function(data) {
            self.currentQuery.phase = data.value;
        });
        
        const searchBtn = document.getElementById('curve-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.onSearch();
            });
        }
    },
    
    /**
     * 更新变压器下拉框选项（联动）
     */
    updateTransformerSelect: function(stationValue) {
        const transformerSelect = document.getElementById(this.config.elementIds.transformerSelect);
        if (!transformerSelect) return;
        
        // 清空现有选项
        transformerSelect.innerHTML = '<option value="all">全部</option>';
        
        // 如果选择了"全部"变电所，显示所有变压器
        if (stationValue === 'all') {
            for (let station in this.config.substationMap) {
                const stationData = this.config.substationMap[station];
                stationData.transformers.forEach(trans => {
                    const option = document.createElement('option');
                    option.value = trans.id;
                    option.textContent = stationData.name + trans.name;
                    transformerSelect.appendChild(option);
                });
            }
        } else {
            // 显示选中变电所的变压器
            const stationData = this.config.substationMap[stationValue];
            if (stationData) {
                stationData.transformers.forEach(trans => {
                    const option = document.createElement('option');
                    option.value = trans.id;
                    option.textContent = trans.name;
                    transformerSelect.appendChild(option);
                });
            }
        }
        
        // 重置变压器选择为"全部"
        this.currentQuery.transformer = 'all';
        
        // 刷新layui表单渲染
        layui.form.render('select');
    },
    
    /**
     * 查询按钮点击事件
     */
    onSearch: async function() {
        // 获取变电所、变压器、相位选择
        const stationSelect = document.getElementById(this.config.elementIds.stationSelect);
        const transformerSelect = document.getElementById(this.config.elementIds.transformerSelect);
        const phaseSelect = document.getElementById(this.config.elementIds.phaseSelect);
        
        if (stationSelect) {
            this.currentQuery.station = stationSelect.value;
        }
        if (transformerSelect) {
            this.currentQuery.transformer = transformerSelect.value;
        }
        if (phaseSelect) {
            this.currentQuery.phase = phaseSelect.value;
        }
        
        console.log('查询条件:', this.currentQuery);
        
        let startDate, endDate;
        
        if (this.currentQuery.timeMode === 'day') {
            startDate = document.getElementById('curve-start-date').value;
            if (!startDate) {
                alert('请选择日期');
                return;
            }
            endDate = startDate;
        } else {
            startDate = document.getElementById('curve-start-date').value;
            endDate = document.getElementById('curve-end-date').value;
            
            if (!startDate || !endDate) {
                alert('请选择日期范围');
                return;
            }
        }
        
        console.log('查询日期:', startDate, '到', endDate);
        await this.fetchData(startDate, endDate);
    },
    
    /**
     * 获取数据
     */
    fetchData: async function(startDate, endDate) {
        try {
            this.showLoading();
            
            // 构建SQL语句
            const sql = this.buildSQL(startDate, endDate);
            
            console.log('执行SQL:', sql);
            
            // 调用后端API获取数据
            const result = await this.sendSQL(sql);
            
            // 处理返回的数据
            let rawData = [];
            if (result && result.data && Array.isArray(result.data)) {
                rawData = result.data;
            }
            
            console.log('查询到的数据条数:', rawData.length);
            
            // 转换为图表数据格式
            const chartData = this.transformDataForChart(rawData);
            
            this.hideLoading();
            this.renderChart(chartData);
            
        } catch (error) {
            console.error('查询出错:', error);
            this.hideLoading();
            this.showError('查询失败，请重试');
        }
    },
    
    /**
     * 构建SQL语句
     */
    buildSQL: function(startDate, endDate) {
        const { tableName, timeField } = this.config;
        
        // 获取需要查询的变压器编号列表
        const transformerNos = this.getTransformerNos();
        
        let sql = `SELECT ${timeField} as date, No, A_Temp, B_Temp, C_Temp FROM ${tableName} `;
        
        if (this.currentQuery.timeMode === 'day') {
            sql += `WHERE ${timeField} >= '${startDate} 00:00:00' `;
            sql += `AND ${timeField} <= '${startDate} 23:59:59' `;
        } else {
            sql += `WHERE ${timeField} >= '${startDate} 00:00:00' `;
            sql += `AND ${timeField} <= '${endDate} 23:59:59' `;
        }
        
        // 如果选择了特定的变压器，添加No条件
        if (transformerNos.length > 0) {
            sql += `AND No IN (${transformerNos.join(',')}) `;
        }
        
        sql += `ORDER BY ${timeField} ASC, No ASC LIMIT 50000`;
        
        return sql;
    },
    
    /**
     * 获取需要查询的变压器编号列表
     */
    getTransformerNos: function() {
        const nos = [];
        
        // 如果选择了特定变压器
        if (this.currentQuery.transformer !== 'all') {
            const no = this.getTransformerNo(this.currentQuery.transformer);
            if (no) nos.push(no);
            return nos;
        }
        
        // 如果选择了特定变电所，返回该变电所所有变压器编号
        if (this.currentQuery.station !== 'all') {
            const stationData = this.config.substationMap[this.currentQuery.station];
            if (stationData) {
                stationData.transformers.forEach(trans => {
                    nos.push(trans.no);
                });
            }
            return nos;
        }
        
        // 返回所有变压器编号
        for (let station in this.config.substationMap) {
            const stationData = this.config.substationMap[station];
            stationData.transformers.forEach(trans => {
                nos.push(trans.no);
            });
        }
        
        return nos;
    },
    
    /**
     * 根据变压器ID获取对应的No
     */
    getTransformerNo: function(transformerId) {
        for (let station in this.config.substationMap) {
            const stationData = this.config.substationMap[station];
            const transformer = stationData.transformers.find(t => t.id === transformerId);
            if (transformer) {
                return transformer.no;
            }
        }
        return null;
    },
    
    /**
     * 根据No获取变电所和变压器名称
     */
    getTransformerInfo: function(no) {
        for (let station in this.config.substationMap) {
            const stationData = this.config.substationMap[station];
            const transformer = stationData.transformers.find(t => t.no === no);
            if (transformer) {
                return {
                    stationName: stationData.name,
                    transformerName: transformer.name
                };
            }
        }
        return {
            stationName: '未知变电所',
            transformerName: '未知变压器'
        };
    },
    
    /**
     * 转换原始数据为图表格式
     */
    transformDataForChart: function(rawData) {
        if (!rawData || rawData.length === 0) {
            return { xAxisData: [], series: [] };
        }
        
        // 按变压器No分组数据
        const groupedByTransformer = {};
        
        rawData.forEach(row => {
            const no = row.No;
            if (!groupedByTransformer[no]) {
                groupedByTransformer[no] = [];
            }
            groupedByTransformer[no].push(row);
        });
        
        // 构建时间轴（使用第一个变压器的时间数据）
        const firstTransformerNo = Object.keys(groupedByTransformer)[0];
        const xAxisData = groupedByTransformer[firstTransformerNo].map(row => {
            const d = new Date(row.date);
            return d.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace(/\//g, '-');
        });
        
        // 构建系列数据
        const series = [];
        
        for (let no in groupedByTransformer) {
            const info = this.getTransformerInfo(parseInt(no));
            const transformerLabel = `${info.stationName}${info.transformerName}`;
            const data = groupedByTransformer[no];
            
            // 根据相位选择，决定显示哪些曲线
            if (this.currentQuery.phase === 'all' || this.currentQuery.phase === 'A') {
                series.push({
                    name: `${transformerLabel}-A相`,
                    data: data.map(row => row.A_Temp !== null ? Number(row.A_Temp).toFixed(1) : null),
                    color: this.config.colors.A
                });
            }
            
            if (this.currentQuery.phase === 'all' || this.currentQuery.phase === 'B') {
                series.push({
                    name: `${transformerLabel}-B相`,
                    data: data.map(row => row.B_Temp !== null ? Number(row.B_Temp).toFixed(1) : null),
                    color: this.config.colors.B
                });
            }
            
            if (this.currentQuery.phase === 'all' || this.currentQuery.phase === 'C') {
                series.push({
                    name: `${transformerLabel}-C相`,
                    data: data.map(row => row.C_Temp !== null ? Number(row.C_Temp).toFixed(1) : null),
                    color: this.config.colors.C
                });
            }
        }
        
        return { xAxisData, series };
    },
    
    /**
     * 发送SQL请求
     */
    sendSQL: async function(sql) {
        const response = await fetch('http://192.168.7.229:8004/api/sql/run-sql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ sql })
        });
        
        const data = await response.json();
        return data;
    },
    
    /**
     * 初始化图表
     */
    initChart: function() {
        const chartDom = document.getElementById(this.config.elementIds.chartContainer);
        if (!chartDom) {
            console.error('图表容器未找到');
            return;
        }
        
        if (this.chartInstance) {
            this.chartInstance.dispose();
        }
        
        this.chartInstance = echarts.init(chartDom);
        this.showEmpty();
    },
    
    /**
     * 渲染图表
     */
    renderChart: function(chartData) {
        if (!this.chartInstance) {
            console.error('图表实例不存在');
            return;
        }
        
        if (!chartData || !chartData.series || chartData.series.length === 0) {
            this.showEmpty();
            return;
        }
        
        // 构建图例数据
        const legendData = chartData.series.map(s => s.name);
        
        // 构建系列数据
        const series = chartData.series.map(seriesConfig => {
            return {
                name: seriesConfig.name,
                type: 'line',
                data: seriesConfig.data,
                smooth: 0.3,
                symbol: 'circle',
                symbolSize: 4,
                lineStyle: {
                    color: seriesConfig.color,
                    width: 2
                },
                itemStyle: {
                    color: seriesConfig.color
                }
            };
        });
        
        // 计算X轴标签显示间隔
        const dataLength = chartData.xAxisData.length;
        let interval = 0;
        if (dataLength > 200) {
            interval = Math.floor(dataLength / 20);
        } else if (dataLength > 100) {
            interval = Math.floor(dataLength / 15);
        } else if (dataLength > 50) {
            interval = Math.floor(dataLength / 10);
        }
        
        const option = {
            title: {
                text: '变压器温度曲线',
                left: 'center',
                top: '2%',
                textStyle: { color: '#fff', fontSize: 18 }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: '#2a6dc8',
                textStyle: { color: '#fff' },
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#2a6dc8'
                    }
                },
                formatter: function(params) {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach(item => {
                        if (item.value !== null) {
                            result += `${item.marker} ${item.seriesName}: ${item.value}℃<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: legendData,
                right: '3%',
                top: '5%',
                orient: 'vertical',
                textStyle: { color: '#fff', fontSize: 12 },
                type: 'scroll',
                pageIconColor: '#fff',
                pageIconInactiveColor: '#666',
                pageTextStyle: { color: '#fff' }
            },
            grid: {
                left: '3%',
                right: legendData.length > 6 ? '15%' : '12%',
                top: '15%',
                bottom: '8%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: chartData.xAxisData,
                axisLine: { lineStyle: { color: '#fff' } },
                axisLabel: { 
                    color: '#fff',
                    interval: interval,
                    rotate: 30
                }
            },
            yAxis: {
                type: 'value',
                name: '温度(℃)',
                nameTextStyle: { color: '#fff' },
                axisLine: { show: false, lineStyle: { color: '#fff' } },
                axisLabel: { color: '#fff' },
                splitLine: { show: true, lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
                scale: true
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    start: 0,
                    end: 100,
                    textStyle: { color: '#fff' }
                }
            ],
            series: series
        };
        
        this.chartInstance.setOption(option, true);
    },
    
    
    /**
     * 显示加载状态
     */
    showLoading: function() {
        if (this.chartInstance) {
            this.chartInstance.showLoading({
                text: '正在加载数据...',
                color: '#409eff',
                textColor: '#fff',
                maskColor: 'rgba(15, 38, 108, 0.8)'
            });
        }
    },
    
    /**
     * 隐藏加载状态
     */
    hideLoading: function() {
        if (this.chartInstance) {
            this.chartInstance.hideLoading();
        }
    },
    
    /**
     * 显示空数据
     */
    showEmpty: function() {
        if (this.chartInstance) {
            this.chartInstance.hideLoading();
            this.chartInstance.setOption({
                title: {
                    text: '请点击查询按钮获取数据',
                    left: 'center',
                    top: 'center',
                    textStyle: { color: '#b9d3f4', fontSize: 16 }
                }
            });
        }
    },
    
    /**
     * 显示错误
     */
    showError: function(message) {
        if (this.chartInstance) {
            this.chartInstance.hideLoading();
            this.chartInstance.setOption({
                title: {
                    text: message,
                    left: 'center',
                    top: 'center',
                    textStyle: { color: '#ff4d4f', fontSize: 16 }
                }
            });
        }
    },
    
    /**
     * 重置模块
     */
    reset: function() {
        if (this.chartInstance) {
            this.chartInstance.dispose();
            this.chartInstance = null;
        }
        this.isInitialized = false;
        console.log('曲线模块已重置');
    }
};
