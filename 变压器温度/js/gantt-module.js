/**
 * 甘特图模块 - 独立可移植模板
 * 
 * ========== 使用指南 ==========
 * 这是一个空白模板，用于显示设备运行时间的甘特图
 * 
 * 1. 配置模块
 *    - 修改 config 中的单元配置和设备列表
 *    - 配置DOM元素ID和图表容器
 * 
 * 2. 实现数据查询
 *    - 修改 buildSQL() 构建你的SQL语句
 *    - 通过 sendSQL() 调用后端API
 * 
 * 3. 自定义甘特图样式
 *    - 在 getMockData() 中修改颜色和样式
 *    - 在 renderChart() 中调整图表配置
 * 
 * 4. 在HTML中调用
 *    - 确保PageManager.initPageModule()中调用了GanttModule.init()
 * ==============================
 */
window.GanttModule = {
    // ==================== 配置区域 ====================
    config: {
        title: '变压器风机运行状态甘特图',
        yAxisLabel: '变压器',
        
        // 变电所-变压器配置（所有变压器列表）
        transformers: [
            { id: 'station3_trans2', name: '三号变电所2#变压器' },
            { id: 'station3_trans1', name: '三号变电所1#变压器' },
            { id: 'station2_trans4', name: '二号变电所4#变压器' },
            { id: 'station2_trans3', name: '二号变电所3#变压器' },
            { id: 'station2_trans2', name: '二号变电所2#变压器' },
            { id: 'station2_trans1', name: '二号变电所1#变压器' },
            { id: 'station1_trans2', name: '一号变电所2#变压器' },
            { id: 'station1_trans1', name: '一号变电所1#变压器' }
        ],
        
        elementIds: {
            timeMode: 'gantt-time-mode',
            startDate: 'gantt-start-date',
            endDate: 'gantt-end-date',
            searchBtn: 'gantt-search-btn',
            chartContainer: 'gantt-chart'
        },
        
        tableName: 'transformer_status',
        transformerField: 'transformer_id',
        startTimeField: 'start_time',
        endTimeField: 'end_time',
        statusField: 'fan_status'
    },
    // ==================== 配置区域结束 ====================
    
    isInitialized: false,
    chartInstance: null,
    
    currentQuery: {
        timeMode: 'day',
        singleDate: '',
        rangeStartDate: '',
        rangeEndDate: ''
    },
    
    /**
     * 初始化模块
     */
    init: function() {
        if (this.isInitialized) {
            console.log('甘特图模块已初始化，跳过重复初始化');
            return;
        }
        
        console.log('正在初始化甘特图模块...');
        
        this.initDatePickers();
        this.bindEvents();
        this.initChart();
        
        this.isInitialized = true;
        console.log('✓ 甘特图模块初始化完成');
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
            
            form.on('select(gantt-time-mode)', function(data) {
                self.switchTimeMode(data.value, laydate, $);
            });
            
            self.switchTimeMode('day', laydate, $);
        });
    },
    
    /**
     * 切换时间模式
     */
    switchTimeMode: function(mode, laydate, $) {
        const self = this;
        self.currentQuery.timeMode = mode;
        console.log('切换到时间模式：', mode);
        
        if (mode === 'day') {
            $("#gantt-date-rangeLinked .layui-form-mid").hide();
            $("#gantt-end-date").parent().hide();
            
            $('.layui-laydate').remove();
            laydate.render({
                type: "date",
                elem: '#gantt-start-date',
                value: new Date(),
                done: function(value) {
                    $('#gantt-start-date').val(value);
                    self.currentQuery.singleDate = value;
                }
            });
            
        } else if (mode === 'range') {
            $("#gantt-date-rangeLinked .layui-form-mid").show();
            $("#gantt-end-date").parent().show();
            
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 6);
            
            const startDateStr = self.formatDate(sevenDaysAgo);
            const endDateStr = self.formatDate(now);
            
            $('.layui-laydate').remove();
            
            $('#gantt-start-date').val(startDateStr);
            $('#gantt-end-date').val(endDateStr);
            
            laydate.render({
                type: "date",
                elem: '#gantt-date-rangeLinked',
                range: ['#gantt-start-date', '#gantt-end-date'],
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
        const searchBtn = document.getElementById('gantt-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.onSearch();
            });
        }
    },
    
    /**
     * 查询按钮点击事件
     */
    onSearch: async function() {
        const unitSelect = document.getElementById(this.config.elementIds.unitSelect);
        if (unitSelect) {
            this.currentQuery.unit = unitSelect.value;
        }
        
        let startDate, endDate;
        
        if (this.currentQuery.timeMode === 'day') {
            startDate = document.getElementById('gantt-start-date').value;
            if (!startDate) {
                alert('请选择日期');
                return;
            }
            endDate = startDate;
        } else {
            startDate = document.getElementById('gantt-start-date').value;
            endDate = document.getElementById('gantt-end-date').value;
            
            if (!startDate || !endDate) {
                alert('请选择日期范围');
                return;
            }
        }
        
        console.log('查询日期:', startDate, '到', endDate);
        await this.fetchData(startDate, endDate);
    },
    
    /**
     * 获取数据 - 查询所有变压器的风机状态
     */
    fetchData: async function(startDate, endDate) {
        try {
            this.showLoading();
            
            // ========== SQL查询示例 ==========
            // 查询所有变压器在指定时间范围内的风机运行状态
            const sql = `SELECT 
                            ${this.config.transformerField} as transformer_id,
                            ${this.config.startTimeField} as start_time,
                            ${this.config.endTimeField} as end_time,
                            ${this.config.statusField} as fan_status
                        FROM ${this.config.tableName} 
                        WHERE ${this.config.startTimeField} >= '${startDate}' 
                        AND ${this.config.endTimeField} <= '${endDate}' 
                        ORDER BY ${this.config.transformerField} ASC, ${this.config.startTimeField} ASC`;
            
            console.log('执行SQL:', sql);
            console.log('查询所有变压器风机运行状态');
            
            // ========== 真实SQL调用方式 ==========
            // 1. 调用后端API获取数据
            // const sqlData = await this.sendSQL(sql);
            // 
            // 2. 转换数据格式
            // const chartData = this.transformDataForChart(sqlData.data);
            // 
            // 3. 渲染图表
            // this.hideLoading();
            // this.renderChart(chartData);
            
            // ========== 使用模拟数据（仅用于测试） ==========
            const data = this.getMockData();
            
            this.hideLoading();
            this.renderChart(data);
            
        } catch (error) {
            console.error('查询出错:', error);
            this.hideLoading();
            this.showError('查询失败：' + error.message);
        }
    },
    
    /**
     * 发送SQL请求
     */
    sendSQL: async function(sql) {
        // ========== 修改这里为你的后端API地址 ==========
        const response = await fetch('http://your-api-address:port/api/sql/run-sql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ sql })
        });
        
        const data = await response.json();
        return data.data || [];
    },
    
    /**
     * 初始化图表
     */
    initChart: function() {
        const chartDom = document.getElementById(this.config.elementIds.chartContainer);
        if (!chartDom) {
            console.error('找不到图表容器');
            return;
        }
        
        if (this.chartInstance) {
            this.chartInstance.dispose();
        }
        
        this.chartInstance = echarts.init(chartDom);
        
        const option = {
            title: {
                text: '请点击查询按钮获取数据',
                left: 'center',
                top: 'middle',
                textStyle: { color: '#fff', fontSize: 16 }
            }
        };
        
        this.chartInstance.setOption(option);
    },
    
    /**
     * 渲染甘特图 - 显示所有变压器的风机状态
     */
    renderChart: function(data) {
        if (!this.chartInstance) {
            console.error('图表实例不存在');
            return;
        }
        
        if (!data || !data.categories || !data.series) {
            this.showError('数据格式错误');
            return;
        }
        
        const option = {
            title: {
                text: this.config.title,
                left: 'center',
                top: '2%',
                textStyle: { color: '#fff', fontSize: 18 }
            },
            tooltip: {
                formatter: function(params) {
                    const start = new Date(params.value[1]).toLocaleString('zh-CN');
                    const end = new Date(params.value[2]).toLocaleString('zh-CN');
                    const duration = ((params.value[2] - params.value[1]) / 1000 / 60).toFixed(1);
                    return `${params.name}<br/>开始: ${start}<br/>结束: ${end}<br/>时长: ${duration}分钟`;
                }
            },
            grid: { left: '15%', right: '5%', top: '15%', bottom: '10%' },
            xAxis: {
                type: 'time',
                axisLabel: { color: '#fff' },
                axisLine: { lineStyle: { color: '#fff' } },
                splitLine: { show: true, lineStyle: { color: '#2a6dc8' } }
            },
            yAxis: {
                type: 'category',
                data: data.categories,
                name: this.config.yAxisLabel,
                nameTextStyle: { color: '#fff' },
                axisLabel: { color: '#fff' },
                axisLine: { lineStyle: { color: '#fff' } }
            },
            series: data.series
        };
        
        this.chartInstance.setOption(option, true);
    },
    
    /**
     * 获取模拟数据（仅用于测试）
     * 真实数据应该从SQL查询返回，格式参考下面的注释
     */
    getMockData: function() {
        // ========== 真实SQL返回的数据格式应该是: ==========
        // [
        //   {
        //     transformer_id: 'station1_trans1',
        //     start_time: '2024-11-18 08:00:00',
        //     end_time: '2024-11-18 10:30:00',
        //     fan_status: '运行'  // 或 '停止'
        //   },
        //   ...
        // ]
        
        // 转换SQL数据为图表数据的方法：
        // return this.transformDataForChart(sqlData);
        
        // 以下是模拟数据，用于测试
        const categories = this.config.transformers.map(t => t.name);
        const series = [];
        
        const now = new Date();
        const baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
        
        // 为每个变压器生成示例数据
        this.config.transformers.forEach((transformer, index) => {
            let currentTime = baseTime.getTime();
            const endTime = baseTime.getTime() + 16 * 60 * 60 * 1000;
            
            while (currentTime < endTime) {
                const duration = (30 + Math.random() * 90) * 60 * 1000;
                const runEnd = Math.min(currentTime + duration, endTime);
                
                series.push({
                    type: 'custom',
                    renderItem: function(params, api) {
                        const categoryIndex = api.value(0);
                        const start = api.coord([api.value(1), categoryIndex]);
                        const end = api.coord([api.value(2), categoryIndex]);
                        const height = api.size([0, 1])[1] * 0.6;
                        
                        return {
                            type: 'rect',
                            shape: { x: start[0], y: start[1] - height / 2, width: end[0] - start[0], height: height },
                            style: api.style()
                        };
                    },
                    encode: { x: [1, 2], y: 0 },
                    data: [{
                        name: transformer.name,
                        value: [index, currentTime, runEnd],
                        itemStyle: { color: '#52c41a' }  // 运行=绿色
                    }]
                });
                
                const stopDuration = (10 + Math.random() * 50) * 60 * 1000;
                currentTime = runEnd + stopDuration;
            }
        });
        
        return { categories, series };
    },
    
    /**
     * 将SQL数据转换为图表数据格式
     * @param {Array} sqlData - SQL查询返回的数据数组
     * @returns {Object} { categories, series } - 图表所需的数据格式
     */
    transformDataForChart: function(sqlData) {
        // 获取所有变压器名称作为Y轴分类
        const categories = this.config.transformers.map(t => t.name);
        
        // 创建变压器ID到索引的映射
        const transformerIndexMap = {};
        this.config.transformers.forEach((t, index) => {
            transformerIndexMap[t.id] = index;
        });
        
        // 按变压器分组数据
        const groupedData = {};
        sqlData.forEach(record => {
            const transformerId = record[this.config.transformerField] || record.transformer_id;
            if (!groupedData[transformerId]) {
                groupedData[transformerId] = [];
            }
            groupedData[transformerId].push(record);
        });
        
        // 生成series数据
        const series = [];
        
        Object.keys(groupedData).forEach(transformerId => {
            const records = groupedData[transformerId];
            const transformerIndex = transformerIndexMap[transformerId];
            const transformer = this.config.transformers.find(t => t.id === transformerId);
            
            if (transformerIndex === undefined) return;
            
            records.forEach(record => {
                const startTime = new Date(record[this.config.startTimeField] || record.start_time).getTime();
                const endTime = new Date(record[this.config.endTimeField] || record.end_time).getTime();
                const status = record[this.config.statusField] || record.fan_status;
                
                // 根据状态设置颜色
                const color = status === '运行' ? '#52c41a' : '#ff4d4f';  // 运行=绿色, 停止=红色
                
                series.push({
                    type: 'custom',
                    renderItem: function(params, api) {
                        const categoryIndex = api.value(0);
                        const start = api.coord([api.value(1), categoryIndex]);
                        const end = api.coord([api.value(2), categoryIndex]);
                        const height = api.size([0, 1])[1] * 0.6;
                        
                        return {
                            type: 'rect',
                            shape: { 
                                x: start[0], 
                                y: start[1] - height / 2, 
                                width: end[0] - start[0], 
                                height: height 
                            },
                            style: api.style()
                        };
                    },
                    encode: { x: [1, 2], y: 0 },
                    data: [{
                        name: transformer.name,
                        value: [transformerIndex, startTime, endTime],
                        itemStyle: { color: color }
                    }]
                });
            });
        });
        
        return { categories, series };
    },
    
    /**
     * 显示加载状态
     */
    showLoading: function() {
        if (this.chartInstance) {
            this.chartInstance.showLoading({
                text: '加载中...',
                color: '#009688',
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
     * 显示错误
     */
    showError: function(message) {
        if (this.chartInstance) {
            this.chartInstance.hideLoading();
            const option = {
                title: {
                    text: message,
                    left: 'center',
                    top: 'middle',
                    textStyle: { color: '#ff5252', fontSize: 16 }
                }
            };
            this.chartInstance.setOption(option, true);
        }
    }
};
