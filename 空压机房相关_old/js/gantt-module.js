/**
 * 甘特图模块 - 独立可移植
 * 用于显示空压机房运行时间甘特图
 */
window.GanttModule = {
    // 初始化标记
    isInitialized: false,
    
    // 图表实例
    chartInstance: null,
    
    // 当前查询参数
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
                elem: '#gantt-date-rangeLinked',
                range: false
            });
            
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
            
            // 构建SQL（预留接口）
            const sql = this.buildSQL(startDate, endDate);
            console.log('执行SQL:', sql);
            
            // 使用模拟数据
            console.log('生成模拟数据...');
            const data = this.getMockData();
            console.log('模拟数据生成完成:', data);
            
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
     * 构建SQL语句（预留接口）
     */
    buildSQL: function(startDate, endDate) {
        let sql = "SELECT compressor_id, start_time, end_time, status " +
                  "FROM compressor_runtime " +
                  `WHERE start_time >= '${startDate}' ` +
                  `AND end_time <= '${endDate}' ` +
                  `ORDER BY compressor_id, start_time`;
        
        return sql;
    },
    
    /**
     * 发送SQL请求（预留接口）
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
        return data;
    },
    
    /**
     * 初始化图表
     */
    initChart: function() {
        console.log('初始化甘特图图表...');
        const chartDom = document.getElementById('gantt-chart');
        if (!chartDom) {
            console.error('找不到图表容器 #gantt-chart');
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
        
        console.log('分类数量:', data.categories.length);
        console.log('系列数量:', data.series.length);
        
        const option = {
            title: {
                text: ''
            },
            tooltip: {
                formatter: function(params) {
                    const start = new Date(params.value[1]).toLocaleString('zh-CN');
                    const end = new Date(params.value[2]).toLocaleString('zh-CN');
                    const duration = ((params.value[2] - params.value[1]) / 1000 / 60).toFixed(1);
                    return `${params.name}<br/>开始: ${start}<br/>结束: ${end}<br/>运行时长: ${duration}分钟`;
                }
            },
            grid: {
                left: '10%',
                right: '5%',
                top: '10%',
                bottom: '10%'
            },
            xAxis: {
                type: 'time',
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
        
        console.log('设置图表选项...');
        this.chartInstance.setOption(option, true);
        console.log('图表选项设置完成');
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
        const now = new Date();
        const baseTime = new Date(now);
        baseTime.setHours(7, 0, 0, 0);
        
        const categories = [];
        const series = [];
        
        // 为所有7台空压机生成数据
        const compressors = ['1', '2', '3', '4', '5', '6', '7'];
        compressors.forEach((compressorId, index) => {
            const compressorName = `${compressorId}#空压机`;
            categories.push(compressorName);
            
            // 生成运行时间段
            const runningPeriods = [];
            let currentTime = baseTime.getTime();
            const endTime = baseTime.getTime() + 16 * 60 * 60 * 1000; // 16小时
            
            while (currentTime < endTime) {
                // 随机运行时长（30分钟到2小时）
                const runDuration = (30 + Math.random() * 90) * 60 * 1000;
                const runEnd = Math.min(currentTime + runDuration, endTime);
                
                runningPeriods.push({
                    name: compressorName,
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

