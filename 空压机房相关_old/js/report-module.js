/**
 * 报表模块 - 独立可移植
 * 可轻松移植到其他项目
 */
window.ReportModule = {
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
                elem: '#report-date-rangeLinked',
                range: false
            });
            
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
        const tbody = document.getElementById('report-table-body');
        if (!tbody) return;
        
        // 显示加载状态
        tbody.innerHTML = '<tr><td colspan="15" class="report-loading">正在加载数据</td></tr>';
        
        try {
            // 构建SQL
            const sql = this.buildSQL();
            console.log('执行SQL:', sql);
            
            // 调用API（这里需要根据实际情况修改）
            // const data = await this.sendSQL(sql);
            
            // 模拟数据（实际使用时删除这部分，使用上面的API调用）
            const data = this.getMockData();
            
            // 渲染表格
            this.renderTable(data);
            
        } catch (error) {
            console.error('查询出错:', error);
            tbody.innerHTML = '<tr><td colspan="15" class="report-empty">查询失败，请重试</td></tr>';
        }
    },
    
    /**
     * 构建SQL语句
     */
    buildSQL: function() {
        let sql = "SELECT DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') as date, " +
                  "V_A, V_B, V_C, A_A, A_B, A_C, " +
                  "V_AB, V_BC, V_AC, Q_ABC, P_ABC, S_ABC, COS, Hz " +
                  "FROM data_all ";
        
        if (this.currentQuery.dateType === 'day') {
            // 单日查询：从7:00到次日7:00
            sql += `WHERE date >= DATE_FORMAT('${this.currentQuery.startDate}', '%Y-%m-%d 07:00:00') ` +
                   `AND date < DATE_FORMAT(DATE_ADD('${this.currentQuery.startDate}', INTERVAL 24 HOUR), '%Y-%m-%d 07:00:00') `;
        } else {
            // 自定义范围查询
            sql += `WHERE date >= '${this.currentQuery.startDate}' ` +
                   `AND date < '${this.currentQuery.endDate}' `;
        }
        
        sql += `ORDER BY id DESC ` +
               `LIMIT 1000`;
        
        return sql;
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
     * 获取模拟数据
     */
    getMockData: function() {
        const data = [];
        const now = new Date();
        
        for (let i = 0; i < 10; i++) {
            const time = new Date(now - i * 3600000); // 每小时一条
            data.push({
                date: this.formatDateTime(time),
                V_A: (220 + Math.random() * 10).toFixed(2),
                V_B: (220 + Math.random() * 10).toFixed(2),
                V_C: (220 + Math.random() * 10).toFixed(2),
                A_A: (50 + Math.random() * 20).toFixed(2),
                A_B: (50 + Math.random() * 20).toFixed(2),
                A_C: (50 + Math.random() * 20).toFixed(2),
                V_AB: (380 + Math.random() * 10).toFixed(2),
                V_BC: (380 + Math.random() * 10).toFixed(2),
                V_AC: (380 + Math.random() * 10).toFixed(2),
                Q_ABC: (100 + Math.random() * 50).toFixed(2),
                P_ABC: (150 + Math.random() * 50).toFixed(2),
                S_ABC: (180 + Math.random() * 50).toFixed(2),
                COS: (0.85 + Math.random() * 0.1).toFixed(3),
                Hz: (50 + Math.random() * 0.1).toFixed(2)
            });
        }
        
        return data;
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
        const tbody = document.getElementById('report-table-body');
        if (!tbody) return;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="15" class="report-empty">暂无数据</td></tr>';
            return;
        }
        
        let html = '';
        data.forEach(row => {
            html += '<tr>';
            html += `<td>${row.date}</td>`;
            html += `<td>${row.V_A}</td>`;
            html += `<td>${row.V_B}</td>`;
            html += `<td>${row.V_C}</td>`;
            html += `<td>${row.A_A}</td>`;
            html += `<td>${row.A_B}</td>`;
            html += `<td>${row.A_C}</td>`;
            html += `<td>${row.V_AB}</td>`;
            html += `<td>${row.V_BC}</td>`;
            html += `<td>${row.V_AC}</td>`;
            html += `<td>${row.Q_ABC}</td>`;
            html += `<td>${row.P_ABC}</td>`;
            html += `<td>${row.S_ABC}</td>`;
            html += `<td>${row.COS}</td>`;
            html += `<td>${row.Hz}</td>`;
            html += '</tr>';
        });
        
        tbody.innerHTML = html;
    },
    
    /**
     * 导出按钮点击事件
     */
    onExport: function() {
        const tbody = document.getElementById('report-table-body');
        if (!tbody || tbody.children.length === 0) {
            alert('没有数据可导出');
            return;
        }
        
        // 简单的CSV导出
        this.exportToCSV();
    },
    
    /**
     * 导出为CSV
     */
    exportToCSV: function() {
        const table = document.getElementById('report-table');
        if (!table) return;
        
        let csv = [];
        
        // 表头
        const headers = [];
        table.querySelectorAll('thead th').forEach(th => {
            headers.push(th.textContent);
        });
        csv.push(headers.join(','));
        
        // 数据行
        table.querySelectorAll('tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.textContent);
            });
            if (row.length > 0) {
                csv.push(row.join(','));
            }
        });
        
        // 下载
        const csvContent = csv.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const now = new Date();
        const filename = `电量统计报表_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    /**
     * 重置模块
     */
    reset: function() {
        this.isInitialized = false;
        console.log('报表模块已重置');
    }
};

