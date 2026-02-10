/**
 * 报表模块 - 独立可移植
 * 可轻松移植到其他项目
 */
window.ReportModule = {
    // ==================== 配置区域 - 移植时修改这里 ====================
    config: {
        // 污水处理系统配置 - 无多单元
        
        // DOM元素ID配置
        elementIds: {
            dateType: 'report-date-type',
            startDate: 'report-start-date',
            endDate: 'report-end-date',
            searchBtn: 'report-search-btn',
            tableBody: 'report-table-body',
            table: 'report-table'
        },
        
        // 污水处理表格配置
        reportConfig: {
            title: '污水处理统计明细报表',
            cols: [[
                { field: 'time', title: '时间', width: 180, align: "center" },
                { field: 'instant_flow', title: '处理水量瞬时流量(m³/h)', width: 160, align: "center" },
                { field: 'daily_total_flow', title: '处理水量今日累计(m³)', width: 160, align: "center" },
                { field: 'daily_electricity', title: '今日用电(KWh)', width: 140, align: "center" },
                { field: 'cod', title: 'COD(mg/L)', width: 130, align: "center" },
                { field: 'tp', title: '总磷(mg/L)', width: 130, align: "center" },
                { field: 'tn', title: '总氮(mg/L)', width: 130, align: "center" }
            ]],
            data: [],
            even: true,
            elem: '#report-table',
            
            //tableName: 'sewage_treatment_data',
            //timeField: 'record_time'
        }
    },
    // ==================== 配置区域结束 ====================
    
    // 初始化标记
    isInitialized: false,
    
    // 当前查询参数
    currentQuery: {
        dateType: 'day',
        singleDate: '',
        rangeStartDate: '',
        rangeEndDate: ''
    },
    
    /**
     * 初始化模块
     */
    init: function() {
        if (this.isInitialized) {
            console.log('报表模块已初始化，跳过重复初始化');
            return;
        }
        
        console.log('正在初始化报表模块...');
        
        // 污水处理系统无需单元选择
        
        // 初始化LayUI日期选择器
        this.initDatePickers();
        
        // 绑定事件
        this.bindEvents();
        
        this.isInitialized = true;
        console.log('✓ 报表模块初始化完成');
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
            
            // 监听日期类型切换
            form.on('select(report-date-type)', function(data) {
                self.switchDateMode(data.value, laydate, $);
            });
            
            // 初始化为单日模式
            self.switchDateMode('day', laydate, $);
        });
    },
    
    /**
     * 切换日期模式 - 与曲线模块完全一致
     */
    switchDateMode: function(mode, laydate, $) {
        const self = this;
        self.currentQuery.dateType = mode;
        console.log('切换到日期模式：', mode);
        
        // 保存当前值
        const currentStartDate = $('#report-start-date').val();
        const currentEndDate = $('#report-end-date').val();
        
        if (mode === 'day') {
            // 单日模式
            $("#report-date-rangeLinked .layui-form-mid").hide();
            $("#report-end-date").parent().hide();
            
            // 清理并重新渲染
            $('.layui-laydate').remove();
            
            laydate.render({
                type: "date",
                elem: '#report-start-date',
                value: currentStartDate || new Date(),
                done: function(value, date, endDate) {
                    console.log('单日模式选择：', value);
                    $('#report-start-date').val(value);
                    self.currentQuery.singleDate = value;
                }
            });
            
        } else if (mode === 'range') {
            // 范围模式
            $("#report-date-rangeLinked .layui-form-mid").show();
            $("#report-end-date").parent().show();
            
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 6);
            
            const startDateStr = self.formatDate(sevenDaysAgo);
            const endDateStr = self.formatDate(now);
            
            // 清理并重新渲染
            $('.layui-laydate').remove();
            
            // 设置默认范围值
            $('#report-start-date').val(currentStartDate || startDateStr);
            $('#report-end-date').val(currentEndDate || endDateStr);
            
            laydate.render({
                type: "date",
                elem: '#report-date-rangeLinked',
                range: ['#report-start-date', '#report-end-date'],
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
                        
                        if (diffInDays > 7) {
                            if (typeof layui !== 'undefined' && layui.layer) {
                                layui.layer.msg("开始时间和结束时间最多相差7天");
                            } else {
                                alert("开始时间和结束时间最多相差7天");
                            }
                            // 重置为默认范围
                            const resetStart = new Date(now);
                            resetStart.setDate(now.getDate() - 6);
                            const resetStartStr = self.formatDate(resetStart);
                            const resetEndStr = self.formatDate(now);
                            
                            $('#report-start-date').val(resetStartStr);
                            $('#report-end-date').val(resetEndStr);
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
        const searchBtn = document.getElementById('report-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.onSearch();
            });
        }
        
        // 导出按钮
        const exportBtn = document.getElementById('report-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.onExport();
            });
        }
    },
    
    /**
     * 查询按钮点击事件
     */
    onSearch: async function() {
        // 污水处理系统无需单元选择
        let startDate, endDate;
        
        if (this.currentQuery.dateType === 'day') {
            // 单日模式
            startDate = document.getElementById('report-start-date').value;
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
            startDate = document.getElementById('report-start-date').value;
            endDate = document.getElementById('report-end-date').value;
            
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
            if (daysDiff > 7) {
                if (typeof layui !== 'undefined' && layui.layer) {
                    layui.layer.msg('日期范围不能超过7天');
                } else {
                    alert('日期范围不能超过7天');
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
            // 使用真实的SQL查询 - 基于现有的data_all表结构
            let sql;
            if (this.currentQuery.dateType === 'day') {
                // 单日查询 - 使用现有表结构，映射到污水处理字段
                sql = `SELECT DATE_FORMAT(date,'%Y-%m-%d %H:%i:%s') as time, ` +
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
                sql = `SELECT DATE_FORMAT(date,'%Y-%m-%d %H:%i:%s') as time, ` +
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
            
            const data = await this.sendSQL(sql);
            
            // 渲染表格
            this.renderTable(data);
            
        } catch (error) {
            console.error('查询出错:', error);
            if (typeof layui !== 'undefined' && layui.layer) {
                layui.layer.msg('查询失败，请重试');
            } else {
                alert('查询失败，请重试');
            }
        }
    },
    
    
    /**
     * 发送SQL请求（需要根据实际API修改）
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
     * 格式化日期时间
     */
    formatDateTime: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    
    
    /**
     * 渲染表格
     */
    renderTable: function(data) {
        const reportConfig = this.config.reportConfig;
        reportConfig.data = data;
        layui.use(['form', 'laydate', 'util','excel'], function() {
            var table = layui.table;
            var $ = layui.$;
            
            //reportConfig.height = $("#table_form").height()-1;
            table.render(reportConfig);
        });
    },
    
    /**
     * 导出按钮点击事件
     */
    onExport: function() {
        // 使用layui excel插件导出
        this.exportToExcel();
    },
    
    /**
     * 导出为Excel - 使用layui excel插件
     */
    exportToExcel: function() {
        const self = this;
        
        layui.use(['excel', 'table'], function() {
            const excel = layui.excel;
            const table = layui.table;
            
            try {
                // 从layui table获取数据
                const data = table.getData('report-table');
                
                if (!data || data.length === 0) {
                    if (typeof layui !== 'undefined' && layui.layer) {
                        layui.layer.msg('没有数据可导出，请先查询');
                    } else {
                        alert('没有数据可导出，请先查询');
                    }
                    return;
                }
                
                // 获取报表配置
                const reportConfig = self.config.reportConfig;
                if (!reportConfig) return;
                
                // 构建导出数据数组
                const dataArr = [];
                
                // 添加表头
                const headerObj = {};
                reportConfig.cols[0].forEach((col, index) => {
                    if (col.field) {
                        headerObj[col.field] = col.title;
                    }
                });
                dataArr.push(headerObj);
                
                // 添加数据行 - 需要提取.v属性的值
                data.forEach((row, rowIndex) => {
                    // layui table返回的数据可能包含元数据对象 {v: 值, s: 样式...}
                    // 需要提取实际值
                    const cleanRow = {};
                    reportConfig.cols[0].forEach(col => {
                        if (col.field) {
                            const cellData = row[col.field];
                            // 如果是对象且有v属性，提取v；否则直接使用原值
                            if (cellData && typeof cellData === 'object' && 'v' in cellData) {
                                cleanRow[col.field] = cellData.v;
                            } else {
                                cleanRow[col.field] = cellData;
                            }
                        }
                    });
                    dataArr.push(cleanRow);
                });
                
                // 生成时间戳
                const now = new Date();
                const timestamp = now.getFullYear() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + 
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0') + 
                    String(now.getSeconds()).padStart(2, '0');
                
                // 配置列宽 - 根据字段数量动态生成
                const colConf = {};
                const colCount = reportConfig.cols[0].length;
                for (let i = 0; i < colCount; i++) {
                    const letter = self.convertNumberToLetter(i);
                    colConf[letter] = i === 0 ? 180 : 120; // 第一列（时间）宽一些
                }
                const colConfig = excel.makeColConfig(colConf, 100);
                
                // 设置单元格样式
                excel.setExportCellStyle(dataArr, '', {
                    s: {
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center'
                        }
                    }
                }, function (cell, newCell, row, config, currentRow, currentCol, fieldKey) {
					if(Object.prototype.toString.call(cell).slice(8,-1) == "Number"){
						return {
							v:cell,
							t:'n',
							s:newCell.s
						};
					}
                    return newCell;
                });
                
                // 导出Excel
                const filename = `${reportConfig.title}_${timestamp}.xlsx`;
                excel.exportExcel({
                    sheet1: dataArr
                }, filename, 'xlsx', {
                    extend: {
                        sheet1: {
                            '!cols': colConfig
                        }
                    }
                });
                
            } catch (error) {
                console.error('导出出错:', error);
                if (typeof layui !== 'undefined' && layui.layer) {
                    layui.layer.msg('导出失败: ' + error.message);
                } else {
                    alert('导出失败: ' + error.message);
                }
            }
        });
    },
    
    /**
     * 将数字转换为Excel列字母
     */
    convertNumberToLetter: function(num) {
        if (num <= 25) {
            return String.fromCharCode(65 + num); // 将数字转换为大写字母
        } else {
            const quotient = Math.floor(num / 26) - 1;
            const remainder = num % 26;
            return this.convertNumberToLetter(quotient) + String.fromCharCode(65 + remainder);
        }
    },
    
    /**
     * 重置模块
     */
    reset: function() {
        this.isInitialized = false;
        console.log('报表模块已重置');
    }
};

