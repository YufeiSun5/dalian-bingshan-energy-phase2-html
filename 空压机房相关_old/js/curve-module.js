/**
 * 曲线模块 - 独立可移植
 * 用于显示空压机房压力曲线
 */
window.CurveModule = {
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
        rangeEndDate: ''     // 范围模式结束日期
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
        
        // 初始化LayUI日期选择器
        this.initDatePickers();
        
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
                elem: '#curve-date-rangeLinked',
                range: false  // 关键：明确设置range:false
            });
            
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
            
            // 构建SQL（预留接口）
            const sql = this.buildSQL(startDate, endDate);
            console.log('执行SQL:', sql);
            
            // 使用模拟数据
            const data = this.getMockData();
            
            // 隐藏加载状态
            this.hideLoading();
            
            // 渲染图表
            this.renderChart(data);
            
        } catch (error) {
            console.error('查询出错:', error);
            this.hideLoading();
            this.showError('查询失败，请重试');
        }
    },
    
    /**
     * 构建SQL语句（预留接口）
     */
    buildSQL: function(startDate, endDate) {
        let sql = "SELECT DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') as datetime, " +
                  "tank_front_pressure, tank_pressure, outlet_pressure " +
                  "FROM compressor_data ";
        
        if (this.currentQuery.timeMode === 'day') {
            // 单日查询：从7:00到次日7:00
            sql += `WHERE date >= DATE_FORMAT('${startDate}', '%Y-%m-%d 07:00:00') ` +
                   `AND date < DATE_FORMAT(DATE_ADD('${startDate}', INTERVAL 24 HOUR), '%Y-%m-%d 07:00:00') `;
        } else {
            // 范围查询
            sql += `WHERE date >= '${startDate}' ` +
                   `AND date <= '${endDate}' `;
        }
        
        sql += `ORDER BY date ASC ` +
               `LIMIT 10000`;
        
        return sql;
    },
    
    /**
     * 发送SQL请求（预留接口）
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
     * 获取模拟数据
     */
    getMockData: function() {
        const data = {
            xAxisData: [],
            tankFrontPressure: [],
            tankPressure: [],
            outletPressure: []
        };
        
        const now = new Date();
        const baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
        
        // 生成24小时的数据，每5分钟一个点
        for (let i = 0; i < 288; i++) { // 24小时 * 12个点/小时
            const time = new Date(baseTime.getTime() + i * 5 * 60 * 1000);
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            data.xAxisData.push(`${hours}:${minutes}`);
            
            // 模拟压力数据（带波动）
            const baseValue = 8.0;
            const variation = Math.sin(i / 20) * 0.5 + Math.random() * 0.3;
            
            data.tankFrontPressure.push((baseValue + variation - 0.2).toFixed(2));
            data.tankPressure.push((baseValue + variation).toFixed(2));
            data.outletPressure.push((baseValue + variation - 0.5).toFixed(2));
        }
        
        return data;
    },
    
    /**
     * 初始化图表
     */
    initChart: function() {
        const chartDom = document.getElementById('curve-chart');
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
        
        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: '#2a6dc8',
                textStyle: {
                    color: '#fff'
                }
            },
            legend: {
                data: ['大罐前压力', '大罐压力', '出口压力'],
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
                data: data.xAxisData,
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
                name: '压力 (bar)',
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
            series: [
                {
                    name: '大罐前压力',
                    type: 'line',
                    data: data.tankFrontPressure,
                    smooth: 0.3,
                    symbol: 'none',
                    lineStyle: {
                        color: '#5470c6',
                        width: 2
                    },
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    }
                },
                {
                    name: '大罐压力',
                    type: 'line',
                    data: data.tankPressure,
                    smooth: 0.3,
                    symbol: 'none',
                    lineStyle: {
                        color: '#91cc75',
                        width: 2
                    },
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    }
                },
                {
                    name: '出口压力',
                    type: 'line',
                    data: data.outletPressure,
                    smooth: 0.3,
                    symbol: 'none',
                    lineStyle: {
                        color: '#fac858',
                        width: 2
                    },
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    }
                }
            ]
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

