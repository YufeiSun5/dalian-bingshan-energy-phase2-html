/**
 * 全局模块集合 - 保留必要的全局工具和数据更新接口
 * 
 * 该文件包含：
 * - 全局工具函数
 * - 统一数据管理器（CompressorDataManager）
 * - 全局数据更新接口（CompressorSystemUpdate）
 * 
 * 各模块的具体实现已移到独立文件：
 * - report-module.js: 报表模块
 * - gantt-module.js: 甘特图模块
 * - curve-module.js: 曲线模块
 */

/* ===========================================
   全局工具函数
   =========================================== */

/**
 * 格式化数值 - 支持字符串和数字两种输入格式
 * @param {String|Number} value - 输入值（字符串或数字）
 * @param {Number} decimals - 保留小数位数，默认为2
 * @returns {String} 格式化后的字符串
 */
window.formatNumericValue = function(value, decimals = 2) {
    // 如果已经是字符串，直接返回
    if (typeof value === 'string') {
        return value;
    }
    
    // 如果是数字，格式化后返回
    if (typeof value === 'number') {
        // 使用toFixed限制小数位数
        return value.toFixed(decimals);
    }
    
    // 其他情况返回原值的字符串形式
    return String(value);
};

/* ===========================================
   统一数据管理器（CompressorDataManager）
   功能：统一管理低压和高压系统的数据更新
   支持分别更新、一次性更新两个系统的所有数据
   =========================================== */
window.CompressorDataManager = {
    /**
     * 一次性更新低压和高压系统的所有数据
     * @param {Object} lowPressureData - 低压系统数据 { compressorData, dataPoints, chartData, usage }
     * @param {Object} highPressureData - 高压系统数据 { pistons, systemParams }
     */
    updateAllSystems: function(lowPressureData, highPressureData) {
        console.log('%c========== 一次性更新所有系统数据 ==========', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        
        // 更新低压系统
        if (lowPressureData) {
            console.log('%c>> 更新低压系统', 'color: #00ffff; font-size: 13px; font-weight: bold;');
            
            // 更新空压机数据
            if (lowPressureData.compressorData && Array.isArray(lowPressureData.compressorData)) {
                if (window.RealtimeModule) {
                    window.RealtimeModule.updateDisplay(lowPressureData.compressorData);
                    console.log('✓ 低压空压机数据已更新');
                }
            }
            
            // 更新数据浮窗
            if (lowPressureData.dataPoints && typeof lowPressureData.dataPoints === 'object') {
                const module = window.RealtimeModule;
                const dp = lowPressureData.dataPoints;
                if (module) {
                    if (dp.tankFrontPressure) {
                        const elem = document.getElementById('tank-front-pressure');
                        if (elem) elem.textContent = dp.tankFrontPressure;
                        module.dataPointsConfig.tankFrontPressure.value = dp.tankFrontPressure;
                    }
                    if (dp.tankPressure) {
                        const elem = document.getElementById('tank-pressure');
                        if (elem) elem.textContent = dp.tankPressure;
                        module.dataPointsConfig.tankPressure.value = dp.tankPressure;
                    }
                    if (dp.outletPressure) {
                        const elem = document.getElementById('outlet-pressure');
                        if (elem) elem.textContent = dp.outletPressure;
                        module.dataPointsConfig.outletPressure.value = dp.outletPressure;
                    }
                    if (dp.outletDewpoint) {
                        const elem = document.getElementById('outlet-dewpoint');
                        if (elem) elem.textContent = dp.outletDewpoint;
                        module.dataPointsConfig.outletDewpoint.value = dp.outletDewpoint;
                    }
                    if (dp.outletFlow) {
                        const elem = document.getElementById('outlet-flow');
                        if (elem) elem.textContent = dp.outletFlow;
                        module.dataPointsConfig.outletFlow.value = dp.outletFlow;
                    }
                    console.log('✓ 低压数据浮窗已更新');
                }
            }
            
            // 更新柱形图
            if (lowPressureData.chartData && Array.isArray(lowPressureData.chartData)) {
                const module = window.RealtimeModule;
                if (module && module.chartInstance) {
                    const option = module.chartInstance.getOption();
                    option.series[0].data = lowPressureData.chartData;
                    module.chartInstance.setOption(option);
                    console.log('✓ 低压柱形图数据已更新');
                }
            }
            
            // 更新用量数据
            if (lowPressureData.usage && typeof lowPressureData.usage === 'object') {
                const module = window.RealtimeModule;
                if (module) {
                    if (lowPressureData.usage.todayUsage !== undefined) {
                        module.setTodayUsage(lowPressureData.usage.todayUsage);
                        console.log('✓ 低压今日用量已更新: ' + lowPressureData.usage.todayUsage + ' KWh');
                    }
                    if (lowPressureData.usage.yesterdayUsage !== undefined) {
                        module.setYesterdayUsage(lowPressureData.usage.yesterdayUsage);
                        console.log('✓ 低压昨日用量已更新: ' + lowPressureData.usage.yesterdayUsage + ' KWh');
                    }
                }
            }
        }
        
        // 更新高压系统
        if (highPressureData) {
            console.log('%c>> 更新高压系统', 'color: #ff6600; font-size: 13px; font-weight: bold;');
            
            const module = window.HighPressureModule;
            if (module && module.updateAllData) {
                module.updateAllData(highPressureData);
                console.log('✓ 高压系统所有数据已更新');
            }
        }
        
        console.log('%c========== 更新完成 ==========', 'color: #00ff00; font-size: 16px; font-weight: bold;');
    }
};

// ============================================
// 全局统一数据更新接口
// ============================================
/**
 * 空压机房完整数据更新接口
 * 一次性更新低压、台数控制器、高压所有数据
 */
window.CompressorSystemUpdate = {
    /**
     * 状态映射：1=运行/正常, 2=故障, 3=停机
     */
    statusMap: {
        1: '运行',
        2: '故障', 
        3: '停机'
    },
    
    /**
     * 数据缓存对象 - 存储最新的系统数据
     * 用于页面切换时自动恢复数据
     */
    cachedData: {
        lowPressure: null,
        unitController: null,
        highPressure: null
    },
    
    /**
     * 格式化数值 - 支持字符串和数字两种输入格式
     * @param {String|Number} value - 输入值（字符串或数字）
     * @param {Number} decimals - 保留小数位数，默认为2
     * @returns {String} 格式化后的字符串
     */
    formatValue: function(value, decimals = 2) {
        // 如果已经是字符串，直接返回
        if (typeof value === 'string') {
            return value;
        }
        
        // 如果是数字，格式化后返回
        if (typeof value === 'number') {
            // 使用toFixed限制小数位数
            return value.toFixed(decimals);
        }
        
        // 其他情况返回原值的字符串形式
        return String(value);
    },
    
    /**
     * 从缓存中恢复数据到当前页面
     * @param {String} pageType - 页面类型：'lowPressure', 'unitController', 'highPressure'
     */
    restoreFromCache: function(pageType) {
        const data = this.cachedData[pageType];
        if (!data) {
            console.log(`%c没有缓存数据可恢复：${pageType}`, 'color: #ffaa00;');
            return false;
        }
        
        console.log(`%c正在从缓存恢复数据：${pageType}`, 'color: #00ffff;');
        
        switch(pageType) {
            case 'lowPressure':
                this.updateLowPressure(data);
                break;
            case 'unitController':
                this.updateUnitController(data);
                break;
            case 'highPressure':
                this.updateHighPressure(data);
                break;
        }
        
        console.log(`%c✓ 数据恢复完成：${pageType}`, 'color: #00ff00;');
        return true;
    },
    
    /**
     * 更新所有系统数据
     * @param {Object} data - 完整数据对象
     */
    updateAll: function(data) {
        console.log('%c╔═══════════════════════════════════════════╗', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        console.log('%c║   空压机房系统 - 数据更新开始           ║', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        console.log('%c╚═══════════════════════════════════════════╝', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        
        // 1. 更新低压系统
        if (data.lowPressure) {
            console.log('\n%c【1/3】更新低压系统', 'color: #00ffff; font-size: 14px; font-weight: bold;');
            this.cachedData.lowPressure = data.lowPressure;  // 保存到缓存
            this.updateLowPressure(data.lowPressure);
        }
        
        // 2. 更新台数控制器
        if (data.unitController) {
            console.log('\n%c【2/3】更新台数控制器', 'color: #00ffff; font-size: 14px; font-weight: bold;');
            this.cachedData.unitController = data.unitController;  // 保存到缓存
            this.updateUnitController(data.unitController);
        }
        
        // 3. 更新高压系统
        if (data.highPressure) {
            console.log('\n%c【3/3】更新高压系统', 'color: #00ffff; font-size: 14px; font-weight: bold;');
            this.cachedData.highPressure = data.highPressure;  // 保存到缓存
            this.updateHighPressure(data.highPressure);
        }
        
        console.log('\n%c╔═══════════════════════════════════════════╗', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        console.log('%c║   数据更新完成！数据已缓存到内存         ║', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        console.log('%c╚═══════════════════════════════════════════╝', 'color: #00ff00; font-size: 16px; font-weight: bold;');
    },
    
    /**
     * 更新低压系统
     */
    updateLowPressure: function(data) {
        // 更新7台空压机数据
        if (data.compressors && Array.isArray(data.compressors)) {
            if (window.RealtimeModule && window.RealtimeModule.compressorConfig) {
                const compressorData = window.RealtimeModule.compressorConfig.data;
                
                data.compressors.forEach((comp, index) => {
                    const currentData = compressorData[index] || {};
                    
                    const pressure = comp.pressure !== undefined ? comp.pressure : currentData.pressure;
                    const current = comp.current !== undefined ? comp.current : currentData.current;
                    
                    let status = currentData.status;
                    if (comp.status !== undefined) {
                        status = this.statusMap[comp.status] || '停机';
                    }
                    
                    compressorData[index] = { pressure, current, status };
                    window.RealtimeModule.updateDisplay(compressorData[index], index);
                });
                console.log(`  ✓ 已更新 ${data.compressors.length} 台空压机数据`);
            } else {
                console.warn('  ⚠ RealtimeModule 未找到，跳过空压机数据更新');
            }
        }
        
        // 更新数据浮窗
        if (data.dataPoints) {
            if (window.CompressorControl) {
                const dp = data.dataPoints;
                if (dp.tankFrontPressure !== undefined) {
                    window.CompressorControl.setTankFrontPressure(dp.tankFrontPressure);
                }
                if (dp.tankPressure !== undefined) {
                    window.CompressorControl.setTankPressure(dp.tankPressure);
                }
                if (dp.outletPressure !== undefined) {
                    window.CompressorControl.setOutletPressure(dp.outletPressure);
                }
                if (dp.outletDewpoint !== undefined) {
                    window.CompressorControl.setOutletDewpoint(dp.outletDewpoint);
                }
                if (dp.outletFlow !== undefined) {
                    window.CompressorControl.setOutletFlow(dp.outletFlow);
                }
                console.log('  ✓ 已更新数据浮窗');
            } else {
                console.warn('  ⚠ CompressorControl 未找到，跳过数据浮窗更新');
            }
        }
        
        // 更新柱形图
        if (data.chartData && Array.isArray(data.chartData)) {
            if (window.CompressorControl) {
                window.CompressorControl.setChartData(data.chartData);
            } else {
                console.warn('  ⚠ CompressorControl 未找到，跳过柱形图更新');
            }
        }
        
        // 更新用量数据
        if (data.usage) {
            if (window.CompressorControl) {
                if (data.usage.today !== undefined) {
                    window.CompressorControl.setTodayUsage(data.usage.today);
                }
                if (data.usage.yesterday !== undefined) {
                    window.CompressorControl.setYesterdayUsage(data.usage.yesterday);
                }
            } else {
                console.warn('  ⚠ CompressorControl 未找到，跳过用量数据更新');
            }
        }
        
        // 更新冷干机数据
        if (data.dryer) {
            if (window.CompressorControl) {
                if (data.dryer.power !== undefined) {
                    window.CompressorControl.setDryerPower(data.dryer.power);
                }
                if (data.dryer.status !== undefined) {
                    const statusText = this.statusMap[data.dryer.status] || '停机';
                    window.CompressorControl.setDryerStatus(statusText);
                }
            } else {
                console.warn('  ⚠ CompressorControl 未找到，跳过冷干机数据更新');
            }
        }
    },
    
    /**
     * 更新台数控制器
     */
    updateUnitController: function(data) {
        // 更新8台设备状态
        if (data.units && Array.isArray(data.units)) {
            data.units.forEach((unit, index) => {
                const unitIndex = index + 1;
                
                if (window.UnitControllerControl) {
                    // 更新指示灯（自动、运行、加载）
                    if (unit.auto !== undefined) {
                        window.UnitControllerControl.setIndicator(unitIndex, 'auto', unit.auto === 1);
                    }
                    if (unit.run !== undefined) {
                        window.UnitControllerControl.setIndicator(unitIndex, 'run', unit.run === 1);
                    }
                    if (unit.load !== undefined) {
                        window.UnitControllerControl.setIndicator(unitIndex, 'load', unit.load === 1);
                    }
                    
                    // 更新故障状态（1=正常, 2=故障, 3=停机）
                    if (unit.fault !== undefined) {
                        const faultText = this.statusMap[unit.fault] || '正常';
                        window.UnitControllerControl.setText(unitIndex, 'unload', faultText);
                    }
                    
                    // 更新先发选择状态（1=OFF, 2=ON）
                    if (unit.firstStart !== undefined) {
                        const firstStartText = unit.firstStart === 2 ? 'ON' : 'OFF';
                        window.UnitControllerControl.setText(unitIndex, 'fault', firstStartText, unit.firstStart === 2);
                    }
                }
            });
            console.log(`  ✓ 已更新 ${data.units.length} 台设备状态`);
        }
        
        // 更新系统压力
        if (data.systemPressure !== undefined && window.UnitControllerControl) {
            const formattedPressure = typeof data.systemPressure === 'number' 
                ? data.systemPressure 
                : parseFloat(data.systemPressure);
            window.UnitControllerControl.setSystemPressure(formattedPressure);
        }
        
        // 更新压力条
        if (data.pressure !== undefined && window.UnitControllerControl) {
            const formattedPressure = typeof data.pressure === 'number' 
                ? data.pressure 
                : parseFloat(data.pressure);
            window.UnitControllerControl.setPressure(formattedPressure, data.maxPressure || 1.6);
        }
        
        // 更新压力参数
        if (data.pressureParams && window.UnitControllerControl) {
            const formattedParams = {};
            if (data.pressureParams.pih !== undefined) {
                formattedParams.pih = data.pressureParams.pih;
            }
            if (data.pressureParams.ph !== undefined) {
                formattedParams.ph = data.pressureParams.ph;
            }
            if (data.pressureParams.pl !== undefined) {
                formattedParams.pl = data.pressureParams.pl;
            }
            if (data.pressureParams.pll !== undefined) {
                formattedParams.pll = data.pressureParams.pll;
            }
            window.UnitControllerControl.setPressureParams(formattedParams);
        }
    },
    
    /**
     * 更新高压系统
     */
    updateHighPressure: function(data) {
        if (window.HighPressureModule && window.HighPressureModule.updateAllData) {
            window.HighPressureModule.updateAllData(data);
            console.log('  ✓ 已更新高压系统所有数据');
        }
    },
    
    /**
     * 显示使用帮助
     */
    help: function() {
    // 帮助信息已注释，如需查看请参考TEMPLATE_GUIDE.md或各模块文件中的注释
}
};

/* ===========================================
   实时温度监控模块（RealtimeTemperatureModule）
   功能：显示变压器实时温度数据，支持多级选择器
   =========================================== */
window.RealtimeTemperatureModule = {
    isInitialized: false,
    currentPage: 'realtime',
    tableInstance: null,
    
    // 大区-变压器对应关系
    substationMap: {
        station1: {
            name: '一号变电所',
            transformers: [
                { id: 'station1_trans1', name: '1#变压器' },
                { id: 'station1_trans2', name: '2#变压器' }
            ]
        },
        station2: {
            name: '二号变电所',
            transformers: [
                { id: 'station2_trans1', name: '1#变压器' },
                { id: 'station2_trans2', name: '2#变压器' },
                { id: 'station2_trans3', name: '3#变压器' },
                { id: 'station2_trans4', name: '4#变压器' }
            ]
        },
        station3: {
            name: '三号变电所',
            transformers: [
                { id: 'station3_trans1', name: '1#变压器' },
                { id: 'station3_trans2', name: '2#变压器' }
            ]
        }
    },
    
    // 温度数据存储
    temperatureData: {},
    
    /**
     * 初始化空数据结构
     */
    initEmptyData: function() {
        const self = this;
        for (let station in this.substationMap) {
            const transformers = this.substationMap[station].transformers;
            transformers.forEach((trans, index) => {
                // 第一个变压器显示完整名称，后续变压器使用空格缩进
                let displayName;
                if (index === 0) {
                    displayName = this.substationMap[station].name + trans.name;
                } else {
                    // 使用两个全角空格缩进
                    displayName = '　　　　　' + trans.name;
                }
                
                self.temperatureData[trans.id] = {
                    name: displayName,
                    tempA: '--',
                    tempB: '--',
                    tempC: '--',
                    fanStatus: '未知'
                };
            });
        }
    },
    
    /**
     * 模块初始化
     */
    init: function() {
        console.log('初始化实时温度监控模块');
        
        if (this.isInitialized) {
            console.log('实时温度模块已初始化');
            return;
        }
        
        const self = this;
        
        // 初始化空数据结构
        this.initEmptyData();
        
        // 初始化表格
        this.initTable();
        
        this.isInitialized = true;
    },
    
    /**
     * 初始化表格 - 与开发本部完全一致的方式
     */
    initTable: function() {
        const self = this;
        layui.use(['table', 'form'], function() {
            const table = layui.table;
            const form = layui.form;
            const $ = layui.$;
            
            self.tableInstance = table;
            
            // 列定义 - 与开发本部完全一致，不设置固定宽度
            const cols = [[
                { field: 'name', title: '变压器名称', align: 'left', width: 220 },
                { field: 'tempA', title: 'A相温度', align: 'center' },
                { field: 'tempB', title: 'B相温度', align: 'center' },
                { field: 'tempC', title: 'C相温度', align: 'center' },
                { 
                    field: 'fanStatus', 
                    title: '风机状态', 
                    align: 'center',
                    templet: function(d) {
                        // 根据状态显示不同颜色的按钮
                        const statusClass = d.fanStatus === '运行' ? 'status-running' : 
                                          d.fanStatus === '停止' ? 'status-stopped' : 'status-unknown';
                        return '<div class="status-btn ' + statusClass + '">' + d.fanStatus + '</div>';
                    }
                }
            ]];
            
            // 获取初始数据
            const initialData = self.getAllData();
            console.log('📊 初始化表格，数据行数:', initialData.length);
            
            // 使用延迟确保容器高度计算正确（与开发本部一致）
            setTimeout(function() {
                const containerHeight = $("#table_form").height();
                console.log('📊 表格容器高度:', containerHeight);
                
                // 渲染表格 - 与开发本部完全一致的方式
                table.render({
                    elem: '#temperature-table',
                    cols: cols,
                    data: initialData,
                    height: containerHeight - 1,
                    even: true,
                    page: false,
                    limit: 1000
                });
                
                console.log('✓ 表格初始化完成');
            }, 200);
            
            // 启动定时刷新（与开发本部一致，每1秒刷新一次）
            setInterval(function() {
                const data = self.getAllData();
                table.reloadData('temperature-table', {
                    data: data,
                    scrollPos: 'fixed'
                });
            }, 1000);
        });
    },
    
    /**
     * 刷新表格数据 - 与开发本部实时数据完全一致的刷新方式
     */
    refreshTable: function() {
        if (!this.tableInstance) {
            console.warn('⚠️ 表格实例未初始化');
            return;
        }
        
        const self = this;
        const table = this.tableInstance;
        const data = this.getAllData();
        
        console.log('🔄 刷新表格，数据行数:', data.length);
        console.log('🔄 表格数据示例:', data.length > 0 ? data[0] : 'empty');
        
        // 使用 reloadData 方法重新加载表格数据（与开发本部完全一致）
        // 注意：第一个参数是表格的 id 属性值（不带#号）
        table.reloadData('temperature-table', {
            data: data,
            scrollPos: 'fixed'
        });
        
        console.log('✓ 表格数据已更新');
    },
    
    /**
     * 获取所有变压器数据（无过滤）
     */
    getAllData: function() {
        const data = [];
        // 显示所有变压器
        for (let station in this.substationMap) {
            const transformers = this.substationMap[station].transformers;
            transformers.forEach(trans => {
                if (this.temperatureData[trans.id]) {
                    data.push(this.temperatureData[trans.id]);
                }
            });
        }
        return data;
    },
    
    
    /**
     * 格式化温度数据（处理字符串和数字）
     * @param {string|number} value - 温度值
     * @returns {string} 格式化后的温度字符串
     */
    formatTemperature: function(value) {
        if (value === undefined || value === null || value === '') {
            return '--';
        }
        
        // 如果是字符串，尝试转换为数字
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                return value; // 如果不是数字，返回原字符串
            }
            return num.toFixed(1);
        }
        
        // 如果是数字，格式化为1位小数
        if (typeof value === 'number') {
            return value.toFixed(1);
        }
        
        return String(value);
    },
    
    /**
     * 格式化风机状态（处理数字和字符串）
     * @param {string|number} status - 风机状态 (1=运行, 2=停止, 或字符串)
     * @returns {string} 格式化后的状态字符串
     */
    formatFanStatus: function(status) {
        if (status === undefined || status === null || status === '') {
            return '未知';
        }
        
        // 数字格式：1=运行, 2=停止
        if (typeof status === 'number' || !isNaN(Number(status))) {
            const num = Number(status);
            switch (num) {
                case 1: return '运行';
                case 2: return '停止';
                default: return '未知';
            }
        }
        
        // 字符串格式：直接返回
        return String(status);
    },
    
    /**
     * 更新单个变压器数据
     * @param {string} transformerId - 变压器ID
     * @param {object} data - 温度数据 {tempA, tempB, tempC, fanStatus}
     */
    updateTransformerData: function(transformerId, data) {
        if (this.temperatureData[transformerId]) {
            if (data.tempA !== undefined) {
                this.temperatureData[transformerId].tempA = this.formatTemperature(data.tempA);
            }
            if (data.tempB !== undefined) {
                this.temperatureData[transformerId].tempB = this.formatTemperature(data.tempB);
            }
            if (data.tempC !== undefined) {
                this.temperatureData[transformerId].tempC = this.formatTemperature(data.tempC);
            }
            if (data.fanStatus !== undefined) {
                this.temperatureData[transformerId].fanStatus = this.formatFanStatus(data.fanStatus);
            }
            
            // 刷新表格显示
            this.refreshTable();
            console.log(`✓ 已更新变压器 ${transformerId} 数据:`, {
                原始数据: data,
                格式化后: this.temperatureData[transformerId]
            });
        } else {
            console.error(`❌ 变压器ID ${transformerId} 不存在`);
        }
    },
    
    /**
     * 批量更新所有变压器数据
     * @param {object} allData - 所有变压器数据对象
     */
    updateAllData: function(allData) {
        let updateCount = 0;
        for (let transformerId in allData) {
            if (this.temperatureData[transformerId]) {
                const data = allData[transformerId];
                if (data.tempA !== undefined) {
                    this.temperatureData[transformerId].tempA = this.formatTemperature(data.tempA);
                }
                if (data.tempB !== undefined) {
                    this.temperatureData[transformerId].tempB = this.formatTemperature(data.tempB);
                }
                if (data.tempC !== undefined) {
                    this.temperatureData[transformerId].tempC = this.formatTemperature(data.tempC);
                }
                if (data.fanStatus !== undefined) {
                    this.temperatureData[transformerId].fanStatus = this.formatFanStatus(data.fanStatus);
                }
                updateCount++;
            }
        }
        
        // 刷新表格显示
        this.refreshTable();
        console.log(`✓ 批量更新完成，共更新 ${updateCount} 个变压器数据`);
    },
    
    /**
     * 获取所有变压器ID列表（用于调试）
     */
    getTransformerIds: function() {
        const ids = Object.keys(this.temperatureData);
        console.log('📋 可用的变压器ID列表:');
        ids.forEach(id => {
            console.log(`  - ${id}: ${this.temperatureData[id].name}`);
        });
        return ids;
    },
    
    /**
     * 销毁模块
     */
    destroy: function() {
        // 清理资源
        this.temperatureData = {};
        this.isInitialized = false;
    }
};
