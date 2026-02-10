/**
 * 报表模块 - 独立可移植模板
 * 
 * ========== 使用指南 ==========
 * 这是一个空白模板，可以根据需要添加具体功能
 * 
 * 1. 配置模块
 *    - 修改 config 对象中的单元配置、DOM元素ID等
 *    - 为不同单元类型添加相应的表格列配置
 * 
 * 2. 实现数据查询
 *    - 修改 buildSQL() 方法构建你的SQL语句
 *    - 或通过 sendSQL() 方法调用后端API
 * 
 * 3. 渲染报表
 *    - 实现 renderTable() 方法来渲染数据表格
 *    - 可选：实现 exportToCSV() 方法用于导出功能
 * 
 * 4. 在HTML中调用
 *    - 确保在 PageManager.initPageModule() 中调用 ReportModule.init()
 *    - 或手动调用 window.ReportModule.init()
 * ==============================
 */
window.ReportModule = {
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
        
        // DOM元素ID配置
        elementIds: {
            stationSelect: 'report-station-select',
            transformerSelect: 'report-transformer-select',
            dateType: 'report-date-type',
            startDate: 'report-start-date',
            endDate: 'report-end-date',
            searchBtn: 'report-search-btn',
            exportBtn: 'report-export-btn',
            tableBody: 'report-table-body',
            table: 'report-table'
        },
        
        // 数据表配置
        tableName: 'data_temp',
        timeField: 'date'
    },
    // ==================== 配置区域结束 ====================
    
    isInitialized: false,
    
    currentQuery: {
        dateType: 'day',
        singleDate: '',
        rangeStartDate: '',
        rangeEndDate: '',
        station: 'all',
        transformer: 'all'
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
        
        this.currentQuery.station = 'all';
        this.currentQuery.transformer = 'all';
        this.initDatePickers();
        this.bindEvents();
        
        // 初始化变压器下拉框（显示所有变压器）
        this.updateTransformerSelect('all');
        
        this.isInitialized = true;
        console.log('✓ 报表模块初始化完成');
    },
    
    /**
     * 初始化LayUI日期选择器
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
            
            form.on('select(report-date-type)', function(data) {
                self.switchDateMode(data.value, laydate, $);
            });
            
            self.switchDateMode('day', laydate, $);
        });
    },
    
    /**
     * 切换日期模式
     */
    switchDateMode: function(mode, laydate, $) {
        const self = this;
        self.currentQuery.dateType = mode;
        console.log('切换到日期模式：', mode);
        
        if (mode === 'day') {
            $("#report-date-rangeLinked .layui-form-mid").hide();
            $("#report-end-date").parent().hide();
            
            $('.layui-laydate').remove();
            laydate.render({
                type: "date",
                elem: '#report-start-date',
                value: new Date(),
                done: function(value, date, endDate) {
                    $('#report-start-date').val(value);
                    self.currentQuery.singleDate = value;
                }
            });
            
        } else if (mode === 'range') {
            $("#report-date-rangeLinked .layui-form-mid").show();
            $("#report-end-date").parent().show();
            
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 6);
            
            const startDateStr = self.formatDate(sevenDaysAgo);
            const endDateStr = self.formatDate(now);
            
            $('.layui-laydate').remove();
            
            $('#report-start-date').val(startDateStr);
            $('#report-end-date').val(endDateStr);
            
            laydate.render({
                type: "date",
                elem: '#report-date-rangeLinked',
                range: ['#report-start-date', '#report-end-date'],
                rangeLinked: true,
                value: startDateStr + ' - ' + endDateStr,
                done: function(value, date) {
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
        layui.form.on('select(report-station-select)', function(data) {
            self.updateTransformerSelect(data.value);
            self.currentQuery.station = data.value;
        });
        
        // 变压器下拉框变化事件
        layui.form.on('select(report-transformer-select)', function(data) {
            self.currentQuery.transformer = data.value;
        });
        
        const searchBtn = document.getElementById('report-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.onSearch();
            });
        }
        
        const exportBtn = document.getElementById('report-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.onExport();
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
        // 获取变电所和变压器选择
        const stationSelect = document.getElementById(this.config.elementIds.stationSelect);
        const transformerSelect = document.getElementById(this.config.elementIds.transformerSelect);
        
        if (stationSelect) {
            this.currentQuery.station = stationSelect.value;
        }
        if (transformerSelect) {
            this.currentQuery.transformer = transformerSelect.value;
        }
        
        let startDate, endDate;
        
        if (this.currentQuery.dateType === 'day') {
            startDate = document.getElementById('report-start-date').value;
            if (!startDate) {
                alert('请选择日期');
                return;
            }
            endDate = startDate;
        } else {
            startDate = document.getElementById('report-start-date').value;
            endDate = document.getElementById('report-end-date').value;
            
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
        const tbody = document.getElementById('report-table-body');
        if (!tbody) return;
        
        // 显示加载状态
        tbody.innerHTML = `<tr><td colspan="7" class="report-loading">正在加载数据...</td></tr>`;
        
        try {
            // 构建SQL语句
            const sql = this.buildSQL(startDate, endDate);
            
            console.log('执行SQL:', sql);
            
            // 调用后端API获取数据
            const result = await this.sendSQL(sql);
            
            // 处理返回的数据
            let data = [];
            if (result && result.data && Array.isArray(result.data)) {
                data = result.data;
            }
            
            console.log('查询到的数据条数:', data.length);
            
            // 渲染表格
            this.renderTable(data);
            
        } catch (error) {
            console.error('查询出错:', error);
            tbody.innerHTML = `<tr><td colspan="7" class="report-empty">查询失败，请重试</td></tr>`;
        }
    },
    
    /**
     * 构建SQL查询语句
     */
    buildSQL: function(startDate, endDate) {
        const { tableName, timeField } = this.config;
        
        // 获取需要查询的变压器编号列表
        const transformerNos = this.getTransformerNos();
        
        let sql = `SELECT ${timeField} as date, No, A_Temp, B_Temp, C_Temp FROM ${tableName} `;
        sql += `WHERE ${timeField} >= '${startDate} 00:00:00' `;
        sql += `AND ${timeField} <= '${endDate} 23:59:59' `;
        
        // 如果选择了特定的变压器，添加No条件
        if (transformerNos.length > 0) {
            sql += `AND No IN (${transformerNos.join(',')}) `;
        }
        
        sql += `ORDER BY ${timeField} DESC, No ASC LIMIT 10000`;
        
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
     * 格式化风机状态
     */
    formatFanStatus: function(tempA, tempB, tempC) {
        // 根据温度判断风机状态（这里可以根据实际业务规则调整）
        // 假设：任一相温度超过80度时风机运行
        const maxTemp = Math.max(tempA || 0, tempB || 0, tempC || 0);
        return maxTemp > 80 ? '运行' : '停止';
    },
    
    /**
     * 渲染表格
     */
    renderTable: function(data) {
        const tbody = document.getElementById(this.config.elementIds.tableBody);
        if (!tbody) return;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="report-empty">暂无数据</td></tr>`;
            return;
        }
        
        let html = '';
        data.forEach(row => {
            // 获取变电所和变压器名称
            const info = this.getTransformerInfo(row.No);
            
            // 格式化日期时间
            let dateStr = row.date;
            if (dateStr) {
                // 如果是Date对象，格式化为字符串
                if (dateStr instanceof Date) {
                    dateStr = dateStr.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                } else if (typeof dateStr === 'string') {
                    // 如果已经是字符串，尝试格式化
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) {
                        dateStr = d.toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });
                    }
                }
            }
            
            // 格式化温度值（保留1位小数）
            const tempA = row.A_Temp !== null && row.A_Temp !== undefined ? Number(row.A_Temp).toFixed(1) : '-';
            const tempB = row.B_Temp !== null && row.B_Temp !== undefined ? Number(row.B_Temp).toFixed(1) : '-';
            const tempC = row.C_Temp !== null && row.C_Temp !== undefined ? Number(row.C_Temp).toFixed(1) : '-';
            
            // 判断风机状态
            const fanStatus = this.formatFanStatus(row.A_Temp, row.B_Temp, row.C_Temp);
            
            html += '<tr>';
            html += `<td>${dateStr || '-'}</td>`;
            html += `<td>${info.stationName}</td>`;
            html += `<td>${info.transformerName}</td>`;
            html += `<td>${tempA}</td>`;
            html += `<td>${tempB}</td>`;
            html += `<td>${tempC}</td>`;
            html += `<td>${fanStatus}</td>`;
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
        const filename = `报表_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.csv`;
        
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
