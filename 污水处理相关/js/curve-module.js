/**
 * 曲线模块 - 独立可移植
 * 用于显示空压机房压力曲线
 */
window.CurveModule = {
    // ==================== 配置区域 - 移植时修改这里 ====================
    config: {
        // 污水处理系统参数配置
        params: [
            { value: 'all', label: '全部' },
            { value: 'instant-flow', label: '处理水量瞬时流量 (m³/h)' },
            { value: 'daily-total-flow', label: '处理水量今日累计 (m³)' },
            { value: 'daily-electricity', label: '今日用电 (KWh)' },
            { value: 'cod', label: 'COD (mg/L)' },
            { value: 'tp', label: '总磷 (mg/L)' },
            { value: 'tn', label: '总氮 (mg/L)' }
        ],
        defaultParam: 'all',  // 默认选中参数
        
        // DOM元素ID配置
        elementIds: {
            paramSelect: 'curve-param-select',
            timeMode: 'curve-time-mode',
            startDate: 'curve-start-date',
            endDate: 'curve-end-date',
            searchBtn: 'curve-search-btn',
            chartContainer: 'curve-chart'
        },
        
        // 污水处理曲线配置
        paramConfigs: {
            all: {
                title: '污水处理参数曲线',
                unit: '单位: 混合',
                series: [
                    { name: '处理水量瞬时流量(m³/h)', field: 'instant_flow', color: '#5470c6' },
                    { name: '处理水量今日累计(m³)', field: 'daily_total_flow', color: '#91cc75' },
                    { name: '今日用电(KWh)', field: 'daily_electricity', color: '#fac858' },
                    { name: 'COD(mg/L)', field: 'cod', color: '#ee6666' },
                    { name: '总磷(mg/L)', field: 'tp', color: '#73c0de' },
                    { name: '总氮(mg/L)', field: 'tn', color: '#3ba272' }
                ],
                tableName: 'sewage_treatment_data',
                timeField: 'record_time'
            },
            'instant-flow': {
                title: '处理水量瞬时流量曲线',
                unit: '单位: m³/h',
                series: [
                    { name: '处理水量瞬时流量', field: 'instant_flow', color: '#5470c6' }
                ],
                tableName: 'sewage_treatment_data',
                timeField: 'record_time'
            },
            'daily-total-flow': {
                title: '处理水量今日累计曲线',
                unit: '单位: m³',
                series: [
                    { name: '处理水量今日累计', field: 'daily_total_flow', color: '#91cc75' }
                ],
                tableName: 'sewage_treatment_data',
                timeField: 'record_time'
            },
            'daily-electricity': {
                title: '今日用电曲线',
                unit: '单位: KWh',
                series: [
                    { name: '今日用电', field: 'daily_electricity', color: '#fac858' }
                ],
                tableName: 'sewage_treatment_data',
                timeField: 'record_time'
            },
            'cod': {
                title: 'COD曲线',
                unit: '单位: mg/L',
                series: [
                    { name: 'COD', field: 'cod', color: '#ee6666' }
                ],
                tableName: 'sewage_treatment_data',
                timeField: 'record_time'
            },
            'tp': {
                title: '总磷曲线',
                unit: '单位: mg/L',
                series: [
                    { name: '总磷', field: 'tp', color: '#73c0de' }
                ],
                tableName: 'sewage_treatment_data',
                timeField: 'record_time'
            },
            'tn': {
                title: '总氮曲线',
                unit: '单位: mg/L',
                series: [
                    { name: '总氮', field: 'tn', color: '#3ba272' }
                ],
                tableName: 'sewage_treatment_data',
                timeField: 'record_time'
            }
        }
    },
    // ==================== 配置区域结束 ====================
    
    // 初始化标记
    isInitialized: false,
    
    // 图表实例
    chartInstance: null,
    
    // LayUI日期选择器实例
    singleDatePicker: null,
    rangeDatePicker: null,
    
    // 当前查询参数
    currentQuery: {
        timeMode: 'day',
        singleDate: '',      // 单日模式日期
        rangeStartDate: '',  // 范围模式开始日期
        rangeEndDate: '',    // 范围模式结束日期
        unit: '',            // 将从config.defaultUnit初始化
        seriesFilter: 'all'  // 曲线过滤："all"表示全部，或具体的曲线field
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
        
        // 初始化默认参数
        this.currentQuery.seriesFilter = this.config.defaultParam;
        
        // 初始化LayUI日期选择器
        this.initDatePickers();
        
        // 初始化曲线选择器
        this.initSeriesSelector();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化图表
        this.initChart();
        
        this.isInitialized = true;
        console.log('✓ 曲线模块初始化完成');
    },
    
    /**
     * 初始化LayUI日期选择器 - 完全按照模板逻辑
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
            
            // 渲染表单（让LayUI识别select元素）
            form.render('select');
            
            // 监听时间模式切换
            form.on('select(curve-time-mode)', function(data) {
                self.switchTimeMode(data.value, laydate, $);
            });
            
            // 初始化为单日模式
            self.switchTimeMode('day', laydate, $);
        });
    },
    
    /**
     * 切换时间选择模式 - 完全按照模板逻辑
     */
    switchTimeMode: function(mode, laydate, $) {
        const self = this;
        self.currentQuery.timeMode = mode;
        console.log('切换到时间模式：', mode);
        
        // 保存当前值（如果有的话）
        const currentStartDate = $('#curve-start-date').val();
        const currentEndDate = $('#curve-end-date').val();
        
        if (mode === 'day') {
            // 单日模式：显示单个输入框
            $("#curve-date-rangeLinked .layui-form-mid").hide();
            $("#curve-end-date").parent().hide();
            
            // 清理并重新渲染
            $('.layui-laydate').remove();
            
            laydate.render({
                type: "date",
                elem: '#curve-start-date',
                value: currentStartDate || new Date(),
                done: function(value, date, endDate) {
                    console.log('单日模式选择：', value);
                    $('#curve-start-date').val(value);
                    self.currentQuery.singleDate = value;
                }
            });
            
        } else if (mode === 'range') {
            // 范围模式：显示两个输入框
            $("#curve-date-rangeLinked .layui-form-mid").show();
            $("#curve-end-date").parent().show();
            
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 6);
            
            // 格式化日期字符串
            const startDateStr = self.formatDate(sevenDaysAgo);
            const endDateStr = self.formatDate(now);
            
            // 清理并重新渲染
            $('.layui-laydate').remove();
            
            // 设置默认范围值
            $('#curve-start-date').val(currentStartDate || startDateStr);
            $('#curve-end-date').val(currentEndDate || endDateStr);
            
            laydate.render({
                type: "date",
                elem: '#curve-date-rangeLinked',
                range: ['#curve-start-date', '#curve-end-date'],
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
                                layui.layer.msg("开始时间和结束时间最多相差三十天");
                            } else {
                                alert("开始时间和结束时间最多相差三十天");
                            }
                            // 重置为默认范围（7天）
                            const resetStart = new Date(now);
                            resetStart.setDate(now.getDate() - 6);
                            const resetStartStr = self.formatDate(resetStart);
                            const resetEndStr = self.formatDate(now);
                            
                            $('#curve-start-date').val(resetStartStr);
                            $('#curve-end-date').val(resetEndStr);
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
     * 初始化曲线选择器（二级下拉框）
     */
    initSeriesSelector: function() {
        const self = this;
        
        if (typeof layui === 'undefined') {
            console.error('LayUI未加载');
            return;
        }
        
        layui.use(['form'], function() {
            const form = layui.form;
            const $ = layui.$;
            
            // 初始化参数选择的change事件
            form.on('select(curve-param-select)', function(data) {
                self.currentQuery.seriesFilter = data.value;
                console.log('选择参数:', data.value);
            });
            
            // 重新渲染表单
            form.render('select');
        });
    },
    
    /**
     * 绑定事件
     */
    bindEvents: function() {
        // 查询按钮
        const searchBtn = document.getElementById('curve-search-btn');
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
            startDate = document.getElementById('curve-start-date').value;
            if (!startDate) {
                if (typeof layui !== 'undefined' && layui.layer) {
                    layui.layer.msg('请选择日期');
                } else {
                    alert('请选择日期');
                }
                return;
            }
            endDate = startDate; // 单日模式，结束日期等于开始日期
        } else {
            // 范围模式
            startDate = document.getElementById('curve-start-date').value;
            endDate = document.getElementById('curve-end-date').value;
            
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
            // 显示加载状态
            this.showLoading();
            
            // 污水处理系统使用真实SQL查询
            const sql = this.buildSQL(startDate, endDate);
            console.log('执行SQL:', sql);
            
            const sqlData = await this.sendSQL(sql);
            
            // 处理数据为图表格式
            const data = this.processSewageData(sqlData);
            
            // 隐藏加载状态
            this.hideLoading();
            
            // 渲染图表
            this.renderChart(data);
            
        } catch (error) {
            console.error('查询出错:', error);
            this.hideLoading();
            this.showError('查询失败，请重试: ' + error.message);
        }
    },
    
    /**
     * 构建SQL语句
     */
    buildSQL: function(startDate, endDate) {
        // 使用真实的SQL查询 - 基于现有的data_all表结构
        let sql = '';
        
        if (this.currentQuery.timeMode === 'day') {
            // 单日查询 - 使用现有表结构，映射到污水处理字段
            sql = `SELECT DATE_FORMAT(date,'%Y-%m-%d %H:%i:%s') as datetime, ` +
                  `KWH as instant_flow, ` +           // 瞬时流量 (借用KWH字段)
                  `V_AB as daily_total_flow, ` +      // 今日累计 (借用V_AB字段)
                  `V_BC as daily_electricity, ` +     // 今日用电 (借用V_BC字段)
                  `V_AC as cod, ` +                   // COD (借用V_AC字段)
                  `A_A as tp, ` +                     // 总磷 (借用A_A字段)
                  `A_B as tn ` +                      // 总氮 (借用A_B字段)
                  `FROM data_all ` +
                  `WHERE no = 410005 ` +
                  `AND date >= DATE_FORMAT('${startDate}','%Y-%m-%d 07:00:00') ` +
                  `AND date < DATE_ADD(DATE_FORMAT('${startDate}','%Y-%m-%d 07:00:00'), INTERVAL 1 DAY) ` +
                  `ORDER BY date ASC ` +
                  `LIMIT 10000`;
        } else {
            // 范围查询
            sql = `SELECT DATE_FORMAT(date,'%Y-%m-%d %H:%i:%s') as datetime, ` +
                  `KWH as instant_flow, ` +           // 瞬时流量 (借用KWH字段)
                  `V_AB as daily_total_flow, ` +      // 今日累计 (借用V_AB字段)
                  `V_BC as daily_electricity, ` +     // 今日用电 (借用V_BC字段)
                  `V_AC as cod, ` +                   // COD (借用V_AC字段)
                  `A_A as tp, ` +                     // 总磷 (借用A_A字段)
                  `A_B as tn ` +                      // 总氮 (借用A_B字段)
                  `FROM data_all ` +
                  `WHERE no = 410005 ` +
                  `AND date >= DATE_FORMAT('${startDate}','%Y-%m-%d 00:00:00') ` +
                  `AND date <= DATE_ADD(DATE_FORMAT('${endDate}','%Y-%m-%d 00:00:00'), INTERVAL 1 DAY) ` +
                  `ORDER BY date ASC ` +
                  `LIMIT 10000`;
        }
        
        return sql;
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
        return data.data || [];
    },
    
    /**
     * 处理高压系统数据
     */
    processHighPressureData: function(sqlData, gasData, pressureData) {
        const data = {
            xAxisData: [],
            // 能耗数据
            KWH: [],           // 有功电能
            // 压力和流量数据
            pressure: [],      // 系统压力（来自air_compressor_pressure）
            flow: [],          // 瞬时流量（来自data_gas）
            FLOW_TOTAL: [],    // 累计流量（来自data_gas）
            // 电压数据（来自data_all）
            V_AB: [],          // Uab线电压
            V_BC: [],          // Ubc线电压
            V_AC: [],          // Uca线电压
            // 电流数据（来自data_all）
            A_A: [],           // Ia线电流
            A_B: [],           // Ib线电流
            A_C: []            // Ic线电流
        };
        
        // 创建气表数据的时间映射
        const gasMap = {};
        gasData.forEach(row => {
            gasMap[row.datetime] = row;
        });
        
        // 创建压力数据的时间映射
        const pressureMap = {};
        pressureData.forEach(row => {
            pressureMap[row.datetime] = row;
        });
        
        // 处理主表数据
        sqlData.forEach(row => {
            // 时间轴（只显示时:分）
            const datetime = row.datetime || '';
            const timePart = datetime.split(' ')[1] || '';
            const timeDisplay = timePart.substring(0, 5); // HH:MM
            data.xAxisData.push(timeDisplay);
            
            // 能耗数据 - null表示无数据，会在图表中断开
            data.KWH.push(row.KWH || row.KWH === 0 ? row.KWH : null);
            
            // 电压数据 - null表示无数据
            data.V_AB.push(row.V_AB || row.V_AB === 0 ? row.V_AB : null);
            data.V_BC.push(row.V_BC || row.V_BC === 0 ? row.V_BC : null);
            data.V_AC.push(row.V_AC || row.V_AC === 0 ? row.V_AC : null);
            
            // 电流数据 - null表示无数据
            data.A_A.push(row.A_A || row.A_A === 0 ? row.A_A : null);
            data.A_B.push(row.A_B || row.A_B === 0 ? row.A_B : null);
            data.A_C.push(row.A_C || row.A_C === 0 ? row.A_C : null);
            
            // 从气表数据中获取流量 - null表示无数据
            const gasRow = gasMap[datetime];
            if (gasRow) {
                data.flow.push(gasRow.flow || gasRow.flow === 0 ? gasRow.flow : null);
                data.FLOW_TOTAL.push(gasRow.FLOW_TOTAL || gasRow.FLOW_TOTAL === 0 ? gasRow.FLOW_TOTAL : null);
            } else {
                data.flow.push(null);
                data.FLOW_TOTAL.push(null);
            }
            
            // 从压力表中获取系统压力 - null表示无数据
            const pressureRow = pressureMap[datetime];
            if (pressureRow) {
                data.pressure.push(pressureRow.pressure || pressureRow.pressure === 0 ? pressureRow.pressure : null);
            } else {
                data.pressure.push(null);
            }
        });
        
        return data;
    },
    
    /**
     * 处理污水处理系统数据
     */
    processSewageData: function(sqlData) {
        const data = {
            xAxisData: [],
            instant_flow: [],
            daily_total_flow: [],
            daily_electricity: [],
            cod: [],
            tp: [],
            tn: []
        };
        
        // 处理SQL查询结果
        sqlData.forEach(row => {
            // 时间轴（只显示时:分）
            const datetime = row.datetime || '';
            const timePart = datetime.split(' ')[1] || '';
            const timeDisplay = timePart.substring(0, 5); // HH:MM
            data.xAxisData.push(timeDisplay);
            
            // 各个参数数据 - null表示无数据，会在图表中断开
            data.instant_flow.push(row.instant_flow || row.instant_flow === 0 ? parseFloat(row.instant_flow) : null);
            data.daily_total_flow.push(row.daily_total_flow || row.daily_total_flow === 0 ? parseFloat(row.daily_total_flow) : null);
            data.daily_electricity.push(row.daily_electricity || row.daily_electricity === 0 ? parseFloat(row.daily_electricity) : null);
            data.cod.push(row.cod || row.cod === 0 ? parseFloat(row.cod) : null);
            data.tp.push(row.tp || row.tp === 0 ? parseFloat(row.tp) : null);
            data.tn.push(row.tn || row.tn === 0 ? parseFloat(row.tn) : null);
        });
        
        return data;
    },

    /**
     * 获取模拟数据（保留作为备用）
     */
    getMockData: function() {
        const paramConfig = this.config.paramConfigs[this.currentQuery.seriesFilter];
        if (!paramConfig) return { xAxisData: [] };
        
        const data = { xAxisData: [] };
        
        // 初始化所有系列的数据数组
        paramConfig.series.forEach(s => {
            data[s.field] = [];
        });
        
        const now = new Date();
        const baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
        
        // 生成24小时的数据，每5分钟一个点
        for (let i = 0; i < 288; i++) { // 24小时 * 12个点/小时
            const time = new Date(baseTime.getTime() + i * 5 * 60 * 1000);
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            data.xAxisData.push(`${hours}:${minutes}`);
            
            // 根据参数类型生成不同的模拟数据
            // 处理水量瞬时流量 - 在80-120 m³/h之间波动
            const instantFlowBase = 100;
            const instantFlowVariation = Math.sin(i / 20) * 15 + Math.random() * 5;
            data.instant_flow && data.instant_flow.push((instantFlowBase + instantFlowVariation).toFixed(1));
            
            // 处理水量今日累计 - 递增
            const dailyTotalBase = 500 + i * 0.8;
            data.daily_total_flow && data.daily_total_flow.push(dailyTotalBase.toFixed(1));
            
            // 今日用电 - 递增
            const electricityBase = 200 + i * 0.3;
            data.daily_electricity && data.daily_electricity.push(electricityBase.toFixed(1));
            
            // COD - 在20-40 mg/L之间波动
            const codBase = 30;
            const codVariation = Math.sin(i / 25) * 8 + Math.random() * 2;
            data.cod && data.cod.push((codBase + codVariation).toFixed(1));
            
            // 总磷 - 在0.3-0.8 mg/L之间波动
            const tpBase = 0.5;
            const tpVariation = Math.sin(i / 30) * 0.2 + Math.random() * 0.1;
            data.tp && data.tp.push((tpBase + tpVariation).toFixed(2));
            
            // 总氮 - 在8-15 mg/L之间波动
            const tnBase = 12;
            const tnVariation = Math.sin(i / 22) * 3 + Math.random() * 1;
            data.tn && data.tn.push((tnBase + tnVariation).toFixed(1));
        }
        
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
        
        // 如果已存在实例，先销毁
        if (this.chartInstance) {
            this.chartInstance.dispose();
        }
        
        // 创建图表实例
        this.chartInstance = echarts.init(chartDom);
        
        // 设置初始空状态
        this.showEmpty();
    },
    
    /**
     * 渲染图表
     */
    renderChart: function(data) {
        if (!this.chartInstance) {
            console.error('图表实例不存在');
            return;
        }
        
        const paramConfig = this.config.paramConfigs[this.currentQuery.seriesFilter];
        if (!paramConfig) {
            console.error('未找到参数配置');
            return;
        }
        
        // 使用参数配置中的series
        const seriesList = paramConfig.series;
        
        // 构建图例数据
        const legendData = seriesList.map(s => s.name);
        
        // 提取当前参数的单位
        const currentUnit = paramConfig.unit;
        
        // 构建系列数据
        const series = seriesList.map(seriesConfig => {
            return {
                name: seriesConfig.name,
                type: 'line',
                data: data[seriesConfig.field] || [],
                smooth: 0.3,
                symbol: 'none',
                connectNulls: false, // 不连接空数据点，遇到null时会断开线段
                lineStyle: {
                    color: seriesConfig.color,
                    width: 2
                },
                markPoint: {
                    data: [
                        { type: 'max', name: '最大值' },
                        { type: 'min', name: '最小值' }
                    ]
                }
            };
        });
        
        const option = {
            title: {
                text: paramConfig.title,
                left: 'center',
                top: '2%',
                textStyle: {
                    color: '#fff',
                    fontSize: 18
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: '#2a6dc8',
                textStyle: {
                    color: '#fff'
                }
            },
            legend: {
                data: legendData,
                right: '10%',
                top: '5%',
                orient: 'vertical',
                textStyle: {
                    color: '#fff',
                    fontSize: 14
                }
            },
            grid: {
                left: '3%',
                right: '3%',
                top: '15%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.xAxisData || [],
                axisLine: {
                    lineStyle: {
                        color: '#fff'
                    }
                },
                axisLabel: {
                    color: '#fff',
                    interval: 35 // 每隔35个点显示一个标签（约3小时）
                }
            },
            yAxis: {
                type: 'value',
                name: currentUnit,
                nameTextStyle: {
                    color: '#fff'
                },
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: '#fff'
                    }
                },
                axisLabel: {
                    color: '#fff'
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                scale: true
            },
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
                    textStyle: {
                        color: '#b9d3f4',
                        fontSize: 16
                    }
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
                    textStyle: {
                        color: '#ff4d4f',
                        fontSize: 16
                    }
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

