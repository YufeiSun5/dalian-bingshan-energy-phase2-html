/**
 * 甘特图模块 - 独立可移植
 * 用于显示空压机房运行时间甘特图
 */
window.GanttModule = {
    // ==================== 配置区域 - 移植时修改这里 ====================
    config: {
        // 单元选择配置
        units: [
            { value: 'lowPressure', label: '低压' },
            { value: 'unitController', label: '台控' },
            { value: 'highPressure', label: '高压' }
        ],
        defaultUnit: 'lowPressure',  // 默认选中的单元
        
        // DOM元素ID配置
        elementIds: {
            unitSelect: 'gantt-unit-select',
            timeMode: 'gantt-time-mode',
            startDate: 'gantt-start-date',
            endDate: 'gantt-end-date',
            searchBtn: 'gantt-search-btn',
            chartContainer: 'gantt-chart'
        },
        
        // 不同单元的甘特图配置
        unitConfigs: {
            lowPressure: {
                title: '低压空压机运行时间甘特图',
                yAxisLabel: '空压机编号',
                devices: [
                    { id: 1, name: '1#空压机' },
                    { id: 2, name: '2#空压机' },
                    { id: 3, name: '3#空压机' },
                    { id: 4, name: '4#空压机' },
                    { id: 5, name: '5#空压机' },
                    { id: 6, name: '6#空压机' },
                    { id: 7, name: '7#空压机' }
                ],
                tableName: 'low_pressure_runtime',
                deviceField: 'device_id',
                startTimeField: 'start_time',
                endTimeField: 'end_time'
            },
            unitController: {
                title: '台数控制器运行时间甘特图',
                yAxisLabel: '空压机编号',
                devices: [
                    { id: 1, name: '神钢4#' },
                    { id: 2, name: '神钢3#' },
                    { id: 3, name: '寿力4#' },
                    { id: 4, name: '神钢1#' },
                    { id: 5, name: '寿力1#' },
                    { id: 6, name: '神钢2#' },
                    { id: 7, name: '寿力2#' },
                    { id: 8, name: '寿力3#' }
                ],
                tableName: 'unit_controller_runtime',
                deviceField: 'unit_id',
                startTimeField: 'start_time',
                endTimeField: 'end_time'
            },
            highPressure: {
                title: '高压活塞机运行时间甘特图',
                yAxisLabel: '活塞机编号',
                devices: [
                    { id: 1, name: '1#活塞机' },
                    { id: 2, name: '2#活塞机' },
                    { id: 3, name: '3#活塞机' },
                    { id: 4, name: '4#活塞机' }
                ],
                tableName: 'high_pressure_runtime',
                deviceField: 'piston_id',
                startTimeField: 'start_time',
                endTimeField: 'end_time'
            }
        }
    },
    // ==================== 配置区域结束 ====================
    
    // 初始化标记
    isInitialized: false,
    
    // 图表实例
    chartInstance: null,
    
    // 当前查询参数
    currentQuery: {
        timeMode: 'day',
        singleDate: '',
        rangeStartDate: '',
        rangeEndDate: '',
        unit: ''  // 将从config.defaultUnit初始化
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
        
        // 初始化默认单元
        this.currentQuery.unit = this.config.defaultUnit;
        
        // 初始化LayUI日期选择器
        this.initDatePickers();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化图表
        this.initChart();
        
        this.isInitialized = true;
        console.log('✓ 甘特图模块初始化完成');
    },
    
    /**
     * 初始化LayUI日期选择器 - 与曲线模块完全一致
     */
    initDatePickers: function() {
        const self = this;
        
        // 确保LayUI已加载
        if (typeof layui === 'undefined') {
            console.error('LayUI未加载');
            return;
        }
        
        layui.use(['laydate', 'form'], function() {
            const laydate = layui.laydate;
            const form = layui.form;
            const $ = layui.$;
            
            // 渲染表单
            form.render('select');
            
            // 监听时间模式切换
            form.on('select(gantt-time-mode)', function(data) {
                self.switchTimeMode(data.value, laydate, $);
            });
            
            // 初始化为单日模式
            self.switchTimeMode('day', laydate, $);
        });
    },
    
    /**
     * 切换时间模式 - 与曲线模块完全一致
     */
    switchTimeMode: function(mode, laydate, $) {
        const self = this;
        self.currentQuery.timeMode = mode;
        console.log('切换到时间模式：', mode);
        
        // 保存当前值
        const currentStartDate = $('#gantt-start-date').val();
        const currentEndDate = $('#gantt-end-date').val();
        
        if (mode === 'day') {
            // 单日模式
            $("#gantt-date-rangeLinked .layui-form-mid").hide();
            $("#gantt-end-date").parent().hide();
            
            // 清理并重新渲染
            $('.layui-laydate').remove();
            
            laydate.render({
                type: "date",
                elem: '#gantt-start-date',
                value: currentStartDate || new Date(),
                done: function(value, date, endDate) {
                    console.log('单日模式选择：', value);
                    $('#gantt-start-date').val(value);
                    self.currentQuery.singleDate = value;
                }
            });
            
        } else if (mode === 'range') {
            // 范围模式
            $("#gantt-date-rangeLinked .layui-form-mid").show();
            $("#gantt-end-date").parent().show();
            
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 6);
            
            const startDateStr = self.formatDate(sevenDaysAgo);
            const endDateStr = self.formatDate(now);
            
            // 清理并重新渲染
            $('.layui-laydate').remove();
            
            // 设置默认范围值
            $('#gantt-start-date').val(currentStartDate || startDateStr);
            $('#gantt-end-date').val(currentEndDate || endDateStr);
            
            laydate.render({
                type: "date",
                elem: '#gantt-date-rangeLinked',
                range: ['#gantt-start-date', '#gantt-end-date'],
                rangeLinked: true,
                value: (currentStartDate && currentEndDate) ? 
                    (currentStartDate + ' - ' + currentEndDate) : 
                    (startDateStr + ' - ' + endDateStr),
                done: function(value, date) {
                    console.log('范围选择完成：', value);
                    const dates = value.split(' - ');
                    if (dates.length === 2) {
                        const startDate = new Date(dates[0]);
                        const endDate = new Date(dates[1]);
                        const millisecondsPerDay = 24 * 60 * 60 * 1000;
                        const diffInMilliseconds = Math.abs(endDate.getTime() - startDate.getTime());
                        const diffInDays = diffInMilliseconds / millisecondsPerDay;
                        
                        if (diffInDays > 30) {
                            if (typeof layui !== 'undefined' && layui.layer) {
                                layui.layer.msg("开始时间和结束时间最多相差30天");
                            } else {
                                alert("开始时间和结束时间最多相差30天");
                            }
                            // 重置为默认范围
                            const resetStart = new Date(now);
                            resetStart.setDate(now.getDate() - 6);
                            const resetStartStr = self.formatDate(resetStart);
                            const resetEndStr = self.formatDate(now);
                            
                            $('#gantt-start-date').val(resetStartStr);
                            $('#gantt-end-date').val(resetEndStr);
                            self.currentQuery.rangeStartDate = resetStartStr;
                            self.currentQuery.rangeEndDate = resetEndStr;
                        } else {
                            self.currentQuery.rangeStartDate = dates[0];
                            self.currentQuery.rangeEndDate = dates[1];
                        }
                    }
                }
            });
        }
        
        console.log('模式', mode, '切换完成');
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
        // 查询按钮
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
        // 获取单元选择
        const unitSelect = document.getElementById(this.config.elementIds.unitSelect);
        if (unitSelect) {
            this.currentQuery.unit = unitSelect.value;
        }
        
        let startDate, endDate;
        
        if (this.currentQuery.timeMode === 'day') {
            // 单日模式
            startDate = document.getElementById('gantt-start-date').value;
            if (!startDate) {
                if (typeof layui !== 'undefined' && layui.layer) {
                    layui.layer.msg('请选择日期');
                } else {
                    alert('请选择日期');
                }
                return;
            }
            endDate = startDate;
        } else {
            // 范围模式
            startDate = document.getElementById('gantt-start-date').value;
            endDate = document.getElementById('gantt-end-date').value;
            
            if (!startDate || !endDate) {
                if (typeof layui !== 'undefined' && layui.layer) {
                    layui.layer.msg('请选择日期范围');
                } else {
                    alert('请选择日期范围');
                }
                return;
            }
            
            // 验证日期范围
            const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
            if (daysDiff > 30) {
                if (typeof layui !== 'undefined' && layui.layer) {
                    layui.layer.msg('日期范围不能超过30天');
                } else {
                    alert('日期范围不能超过30天');
                }
                return;
            }
        }
        
        console.log('查询日期:', startDate, '到', endDate);
        
        // 执行查询
        await this.fetchData(startDate, endDate);
    },
    
    /**
     * 获取数据
     */
    fetchData: async function(startDate, endDate) {
        try {
            console.log('开始获取数据...');
            
            // 检查图表实例
            if (!this.chartInstance) {
                console.error('图表实例未初始化，重新初始化...');
                this.initChart();
            }
            
            // 显示加载状态
            this.showLoading();
            
            let data;
            
            if (this.currentQuery.unit === 'highPressure') {
                // 高压系统使用真实SQL查询
                const sql = this.buildSQL(startDate, endDate);
                console.log('执行SQL:', sql);
                
                const sqlData = await this.sendSQL(sql);
                console.log('SQL返回数据:', sqlData);
                
                // 处理高压数据
                data = this.processHighPressureData(sqlData);
                console.log('处理后的数据:', data);
            } else {
                // 其他单元使用模拟数据
                console.log('生成模拟数据...');
                data = this.getMockData();
                console.log('模拟数据生成完成:', data);
            }
            
            // 隐藏加载状态
            this.hideLoading();
            
            // 渲染图表
            console.log('开始渲染图表...');
            this.renderChart(data);
            console.log('图表渲染完成');
            
        } catch (error) {
            console.error('查询出错:', error);
            console.error('错误堆栈:', error.stack);
            this.hideLoading();
            this.showError('查询失败，请重试: ' + error.message);
        }
    },
    
    /**
     * 构建SQL语句
     */
    buildSQL: function(startDate, endDate) {
        let sql = '';
        
        if (this.currentQuery.unit === 'highPressure') {
            // 高压系统SQL
            if (this.currentQuery.timeMode === 'day') {
                // 单日查询：从7:00到次日7:00
                sql = `SELECT (no - 1) as sort, name, status, start_date, ` +
                      `CASE WHEN end_date IS NULL THEN NOW() ELSE end_date END as end_date, ` +
                      `CASE WHEN seconds IS NULL THEN ROUND(TIMESTAMPDIFF(SECOND, start_date, NOW())/60, 2) ` +
                      `ELSE ROUND(seconds/60, 2) END as min ` +
                      `FROM operation_status ` +
                      `WHERE type = '空压机' ` +
                      `AND start_date >= DATE_FORMAT('${startDate}', '%Y-%m-%d 07:00:00') ` +
                      `AND start_date < DATE_ADD(DATE_FORMAT('${startDate}', '%Y-%m-%d 07:00:00'), INTERVAL 1 DAY) ` +
                      `ORDER BY no, start_date`;
            } else {
                // 范围查询
                sql = `SELECT (no - 1) as sort, name, status, start_date, ` +
                      `CASE WHEN end_date IS NULL THEN NOW() ELSE end_date END as end_date, ` +
                      `CASE WHEN seconds IS NULL THEN ROUND(TIMESTAMPDIFF(SECOND, start_date, NOW())/60, 2) ` +
                      `ELSE ROUND(seconds/60, 2) END as min ` +
                      `FROM operation_status ` +
                      `WHERE type = '空压机' ` +
                      `AND start_date >= DATE_FORMAT('${startDate}', '%Y-%m-%d 00:00:00') ` +
                      `AND start_date <= DATE_ADD(DATE_FORMAT('${endDate}', '%Y-%m-%d 00:00:00'), INTERVAL 1 DAY) ` +
                      `ORDER BY no, start_date`;
            }
        } else {
            // 其他单元的SQL（预留）
            sql = "SELECT compressor_id, start_time, end_time, status " +
                  "FROM compressor_runtime " +
                  `WHERE start_time >= '${startDate}' ` +
                  `AND end_time <= '${endDate}' ` +
                  `ORDER BY compressor_id, start_time`;
        }
        
        return sql;
    },
    
    /**
     * 发送SQL请求
     */
    sendSQL: async function(sql) {
        const res = await fetch('http://192.168.7.229:8004/api/sql/run-sql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ sql })
        });
        
        const data = await res.json();
        return data.data || [];
    },
    
    /**
     * 处理高压系统数据
     */
    processHighPressureData: function(sqlData) {
        // 定义状态颜色映射
        const statusColorMap = {
            '运行': '#67C23A',    // 绿色
            '空闲': '#E6A23C',    // 黄色
            '故障': '#F56C6C'     // 红色
        };
        
        // 设备列表
        const devices = [
            '高压1#活塞机',
            '高压2#活塞机',
            '高压3#活塞机',
            '高压4#活塞机'
        ];
        
        // 设备名称到索引的映射
        const deviceNameMap = {
            '高压1#活塞机': 0,
            '高压2#活塞机': 1,
            '高压3#活塞机': 2,
            '高压4#活塞机': 3
        };
        
        // 转换为甘特图数据
        const dataItems = sqlData.map(row => {
            return {
                name: row.name + ' - ' + row.status,
                value: [
                    deviceNameMap[row.name] !== undefined ? deviceNameMap[row.name] : row.sort,
                    new Date(row.start_date).getTime(),
                    new Date(row.end_date).getTime(),
                    row.min
                ],
                itemStyle: {
                    color: statusColorMap[row.status] || '#909399'  // 默认灰色
                },
                status: row.status
            };
        });
        
        // 构建 series 数组（ECharts甘特图格式）
        const series = dataItems.map(item => {
            return {
                name: item.status,  // 添加状态名称用于图例
                type: 'custom',
                renderItem: function(params, api) {
                    const categoryIndex = api.value(0);
                    const start = api.coord([api.value(1), categoryIndex]);
                    const end = api.coord([api.value(2), categoryIndex]);
                    const height = api.size([0, 1])[1] * 0.6;
                    
                    const rectShape = echarts.graphic.clipRectByRect({
                        x: start[0],
                        y: start[1] - height / 2,
                        width: end[0] - start[0],
                        height: height
                    }, {
                        x: params.coordSys.x,
                        y: params.coordSys.y,
                        width: params.coordSys.width,
                        height: params.coordSys.height
                    });
                    
                    return rectShape && {
                        type: 'rect',
                        transition: ['shape'],
                        shape: rectShape,
                        style: api.style()
                    };
                },
                encode: {
                    x: [1, 2],
                    y: 0
                },
                data: [item]
            };
        });
        
        // 返回符合 renderChart 要求的格式
        return {
            categories: devices,
            series: series
        };
    },
    
    /**
     * 初始化图表
     */
    initChart: function() {
        console.log('初始化甘特图图表...');
        const chartDom = document.getElementById(this.config.elementIds.chartContainer);
        if (!chartDom) {
            console.error('找不到图表容器 #' + this.config.elementIds.chartContainer);
            return;
        }
        
        console.log('图表容器找到，尺寸:', chartDom.offsetWidth, 'x', chartDom.offsetHeight);
        
        // 如果已经有实例，先销毁
        if (this.chartInstance) {
            this.chartInstance.dispose();
        }
        
        this.chartInstance = echarts.init(chartDom);
        console.log('ECharts实例创建成功');
        
        // 初始显示空状态
        const option = {
            title: {
                text: '请选择日期后点击查询',
                left: 'center',
                top: 'middle',
                textStyle: {
                    color: '#fff',
                    fontSize: 16
                }
            }
        };
        
        this.chartInstance.setOption(option);
        console.log('初始选项设置完成');
    },
    
    /**
     * 渲染图表
     */
    renderChart: function(data) {
        console.log('renderChart 被调用，数据:', data);
        
        if (!this.chartInstance) {
            console.error('图表实例未初始化');
            return;
        }
        
        if (!data || !data.categories || !data.series) {
            console.error('数据格式错误:', data);
            this.showError('数据格式错误');
            return;
        }
        
        const unitConfig = this.config.unitConfigs[this.currentQuery.unit];
        if (!unitConfig) {
            console.error('未找到单元配置');
            return;
        }
        
        console.log('分类数量:', data.categories.length);
        console.log('系列数量:', data.series.length);
        
        // 计算X轴的固定时间范围：从查询日期的7:00到次日7:00
        let startDate, endDate;
        if (this.currentQuery.timeMode === 'day') {
            startDate = this.currentQuery.singleDate || document.getElementById('gantt-start-date').value;
        } else {
            startDate = this.currentQuery.rangeStartDate || document.getElementById('gantt-start-date').value;
        }
        
        // 构建固定时间范围
        const xAxisMin = new Date(startDate + ' 07:00:00').getTime();
        const xAxisMax = new Date(startDate + ' 07:00:00').getTime() + 24 * 60 * 60 * 1000; // +24小时
        
        // 状态颜色映射
        const statusColorMap = {
            '运行': '#67C23A',    // 绿色
            '空闲': '#E6A23C',    // 黄色
            '故障': '#F56C6C'     // 红色
        };
        
        // 固定显示所有三种状态
        const statuses = ['运行', '空闲', '故障'];
        
        const option = {
            title: {
                text: unitConfig.title,
                left: 'center',
                top: '2%',
                textStyle: {
                    color: '#fff',
                    fontSize: 18
                }
            },
            color: statuses.map(status => statusColorMap[status] || '#909399'),
            tooltip: {
                formatter: function(params) {
                    const start = new Date(params.value[1]).toLocaleString('zh-CN');
                    const end = new Date(params.value[2]).toLocaleString('zh-CN');
                    const duration = ((params.value[2] - params.value[1]) / 1000 / 60).toFixed(1);
                    return `${params.name}<br/>开始: ${start}<br/>结束: ${end}<br/>运行时长: ${duration}分钟`;
                }
            },
            dataZoom: [
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    filterMode: 'none',
                    height: 20,
                    bottom: 20,
                    start: 0,
                    end: 100,
                    handleIcon: 'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z',
                    handleSize: '100%',
                    textStyle: {
                        color: '#fff'
                    },
                    borderColor: '#2a6dc8',
                    fillerColor: 'rgba(42, 109, 200, 0.3)',
                    handleStyle: {
                        color: '#409eff'
                    }
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    filterMode: 'none',
                    zoomOnMouseWheel: true,
                    moveOnMouseMove: true
                }
            ],
            grid: {
                left: '10%',
                right: '15%',
                top: '15%',
                bottom: '15%'
            },
            xAxis: {
                type: 'time',
                min: xAxisMin,
                max: xAxisMax,
                axisLabel: {
                    color: '#fff',
                    formatter: function(value) {
                        const date = new Date(value);
                        return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#fff'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#2a6dc8'
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: data.categories,
                name: unitConfig.yAxisLabel,
                nameTextStyle: {
                    color: '#fff'
                },
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                        color: '#fff'
                    }
                },
                splitLine: {
                    show: false
                }
            },
            series: data.series
        };
        
        // 检查哪些状态在实际数据中存在
        const existingStatuses = new Set(data.series.map(s => s.name));
        
        // 为不存在的状态添加空的占位 series
        statuses.forEach(status => {
            if (!existingStatuses.has(status)) {
                option.series.push({
                    name: status,
                    type: 'custom',
                    renderItem: function() { return null; },  // 不渲染任何内容
                    data: []
                });
            }
        });
        
        option.legend = {
            data: statuses,
            right: '5%',
            top: '8%',
            orient: 'vertical',
            textStyle: {
                color: '#fff',
                fontSize: 12
            },
            itemWidth: 25,
            itemHeight: 14,
            selectedMode: false
        };
        
        this.chartInstance.setOption(option, true);
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
                    textStyle: {
                        color: '#ff5252',
                        fontSize: 16
                    }
                }
            };
            this.chartInstance.setOption(option, true);
        }
    },
    
    /**
     * 获取模拟数据
     */
    getMockData: function() {
        const unitConfig = this.config.unitConfigs[this.currentQuery.unit];
        if (!unitConfig) return { categories: [], series: [] };
        
        const now = new Date();
        const baseTime = new Date(now);
        baseTime.setHours(7, 0, 0, 0);
        
        const categories = [];
        const series = [];
        
        // 根据单元配置获取设备列表
        const devices = unitConfig.devices;
        devices.forEach((device, index) => {
            categories.push(device.name);
            
            // 生成运行时间段
            const runningPeriods = [];
            let currentTime = baseTime.getTime();
            const endTime = baseTime.getTime() + 16 * 60 * 60 * 1000; // 16小时
            
            while (currentTime < endTime) {
                // 随机运行时长（30分钟到2小时）
                const runDuration = (30 + Math.random() * 90) * 60 * 1000;
                const runEnd = Math.min(currentTime + runDuration, endTime);
                
                runningPeriods.push({
                    name: device.name,
                    value: [
                        index,
                        currentTime,
                        runEnd
                    ],
                    itemStyle: {
                        color: '#009688'
                    }
                });
                
                // 随机停机时长（10分钟到1小时）
                const stopDuration = (10 + Math.random() * 50) * 60 * 1000;
                currentTime = runEnd + stopDuration;
            }
            
            runningPeriods.forEach(period => {
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
                    encode: {
                        x: [1, 2],
                        y: 0
                    },
                    data: [period]
                });
            });
        });
        
        return {
            categories: categories,
            series: series
        };
    }
};

