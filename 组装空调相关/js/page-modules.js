/**
 * 组装空调管理系统 - 页面模块集合
 * 
 * 该文件包含了系统中所有功能页面的业务逻辑模块
 * 每个模块负责特定页面的初始化、事件绑定和数据处理
 * 
 * 模块列表：
 * - DeviceDistributionModule: 设备分布概图模块
 * - PowerReportModule: 电量报表模块
 * - PowerCurveModule: 电量曲线模块
 * - OperationTimeGanttModule: 运行时间甘特图模块
 */

/* ===========================================
   设备分布概图模块（DeviceDistributionModule）
   功能：展示设备分布和状态概览
   =========================================== */
window.DeviceDistributionModule = {
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化设备分布概图模块');
        this.initUI();
        this.loadDeviceData();
    },
    
    /**
     * 初始化用户界面
     * 设置页面布局和组件
     */
    initUI: function() {
        layui.use(['form', 'table'], function() {
            // TODO: 初始化设备分布概图界面
            // 可以配置图表、表格等组件
        });
    },
    
    /**
     * 加载设备数据
     * 从后端API获取设备分布和状态信息
     */
    loadDeviceData: function() {
        // TODO: 实现设备数据加载逻辑
        console.log('加载设备分布数据');
        // 这里可以调用API获取设备分布数据
        // 并在界面上展示
    }
};

/* ===========================================
   电量报表模块（PowerReportModule）
   功能：展示和分析电量报表数据
   =========================================== */
window.PowerReportModule = {
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化电量报表模块');
        this.initUI();
        this.loadPowerReportData();
    },
    
    /**
     * 初始化用户界面
     * 设置查询条件和数据表格
     */
    initUI: function() {
        layui.use(['form', 'laydate', 'table'], function() {
            // TODO: 初始化电量报表界面
            // 包括日期选择器、查询条件、数据表格等
        });
    },
    
    /**
     * 加载电量报表数据
     * 从后端API获取电量相关数据
     */
    loadPowerReportData: function() {
        // TODO: 实现电量报表数据加载逻辑
        console.log('加载电量报表数据');
        // 这里可以调用API获取电量报表数据
        // 并生成相应的报表和统计信息
    }
};

/* ===========================================
   电量曲线模块（PowerCurveModule）
   功能：绘制和分析电量变化曲线
   =========================================== */
window.PowerCurveModule = {
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化电量曲线模块');
        this.initUI();
        this.renderPowerCurve();
    },
    
    /**
     * 初始化用户界面
     * 设置曲线图的查询条件和图表容器
     */
    initUI: function() {
        layui.use(['form', 'laydate'], function() {
            // TODO: 初始化电量曲线界面
            // 包括时间范围选择器、设备选择器等
        });
    },
    
    /**
     * 渲染电量曲线图
     * 使用ECharts绘制电量随时间变化的曲线
     */
    renderPowerCurve: function() {
        // TODO: 实现电量曲线绘制逻辑
        console.log('渲染电量曲线图');
        if (typeof echarts !== 'undefined') {
            // 这里可以配置ECharts曲线图
            // 包括坐标轴、数据系列、样式等
        }
    }
};

/* ===========================================
   运行时间甘特图模块（OperationTimeGanttModule）
   功能：显示空压机运行状态的甘特图
   主要功能：
   1. 初始化LayUI组件（日期选择器、多选下拉框）
   2. 处理查询按钮点击事件
   3. 调用后端API获取数据
   4. 渲染ECharts甘特图
   =========================================== */
window.OperationTimeGanttModule = {
    // 标记组件是否已经初始化
    isInitialized: false,
    
    // 存储xmSelect实例，便于管理
    xmSelectInstance: null,
    
    /**
     * 模块初始化入口
     * 调用组件初始化和事件绑定
     */
    init: function() {
        console.log('初始化运行时间甘特图模块');
        
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('运行时间甘特图模块已初始化，跳过重复初始化');
            return;
        }
        
        const self = this;
        
        // 等待DOM和LayUI组件完全就绪
        this.waitForReady(() => {
            console.log('开始初始化运行时间甘特图组件');
            self.initLayUIComponents(); // 初始化LayUI组件
            self.bindQueryEvents(); // 绑定查询事件处理函数
            self.isInitialized = true; // 标记为已初始化
        });
    },
    
    /**
     * 等待所有必要条件就绪
     * @param {Function} callback - 就绪后的回调函数
     */
    waitForReady: function(callback) {
        const self = this;
        let checkCount = 0;
        const maxChecks = 20; // 最多检查20次（10秒）
        
        function checkReady() {
            checkCount++;
            console.log(`检查运行时间甘特图初始化条件 (${checkCount}/${maxChecks})`);
            
            // 检查LayUI是否加载
            if (typeof window.layui === 'undefined') {
                console.log('LayUI未加载');
                if (checkCount < maxChecks) {
                    setTimeout(checkReady, 500);
                } else {
                    console.error('LayUI加载超时');
                }
                return;
            }
            
            // 检查xmSelect是否加载
            if (typeof window.xmSelect === 'undefined') {
                console.log('xmSelect未加载');
                if (checkCount < maxChecks) {
                    setTimeout(checkReady, 500);
                } else {
                    console.error('xmSelect加载超时');
                }
                return;
            }
            
            // 检查甘特图页面是否激活
            const ganttPage = document.getElementById('gantt-page');
            if (!ganttPage || !ganttPage.classList.contains('active')) {
                console.log('运行时间甘特图页面未激活');
                if (checkCount < maxChecks) {
                    setTimeout(checkReady, 500);
                } else {
                    console.error('运行时间甘特图页面激活超时');
                }
                return;
            }
            
            // 检查关键DOM元素是否存在
            const compressorElement = document.getElementById('selectedCompressor');
            const startDateElement = document.getElementById('ID-laydate-start-date-1');
            const endDateElement = document.getElementById('ID-laydate-end-date-1');
            
            if (!compressorElement || !startDateElement || !endDateElement) {
                console.log('关键DOM元素未就绪');
                if (checkCount < maxChecks) {
                    setTimeout(checkReady, 500);
                } else {
                    console.error('DOM元素就绪超时');
                }
                return;
            }
            
            console.log('所有初始化条件已就绪');
            callback();
        }
        
        // 开始检查
        checkReady();
    },
    
    /**
     * 重置模块状态
     * 用于页面重新激活时清理状态
     */
    reset: function() {
        console.log('重置运行时间甘特图模块状态');
        this.isInitialized = false;
        
        // 清理xmSelect实例
        if (this.xmSelectInstance) {
            try {
                this.xmSelectInstance.destroy && this.xmSelectInstance.destroy();
            } catch(e) {
                console.log('清理xmSelect实例时出错:', e);
            }
            this.xmSelectInstance = null;
        }
    },
    
    /**
     * 初始化LayUI组件
     * 包括日期选择器和多选下拉框的配置
     */
    initLayUIComponents: function() {
        const self = this;
        
        // 确保目标DOM元素存在
        if (!document.getElementById('selectedCompressor')) {
            console.error('运行时间甘特图模块初始化失败：找不到selectedCompressor元素');
            return;
        }
        
        layui.use(['form', 'laydate', 'util','excel','xmSelect'], function() {
            try {
                // LayUI组件实例获取
                var form = layui.form;      // 表单组件
                var layer = layui.layer;    // 弹层组件
                var laydate = layui.laydate; // 日期选择器
                var util = layui.util;      // 工具组件
                var tree = layui.tree;      // 树形组件
                var excel = layui.excel;    // Excel导入导出
                var table = layui.table;    // 表格组件
                var $ = layui.$;           // jQuery实例
                
                // 设置默认查询日期为当月1号
                let currentDay = new Date();
                currentDay.setDate(1);        // 设置为当月第一天
                var dateValue = "day";        // 日期类型标识
                currentDay.setHours(7, 0, 0, 0); // 设置时间为早上7点

                /* ===== 日期选择器配置 ===== */
                
                // 开始日期选择器
                laydate.render({
                    type:"datetime",                    // 日期时间选择类型
                    elem: '#ID-laydate-start-date-1',  // 绑定元素ID
                    value: currentDay,                 // 默认值为当月1号
                });
                
                // 结束日期选择器
                laydate.render({
                    type:"datetime",                   // 日期时间选择类型
                    elem: '#ID-laydate-end-date-1',   // 绑定元素ID
                    value: new Date(),                // 默认值为当前时间
                });
                
                // 日期范围选择器（关联两个输入框）
                laydate.render({
                    type:"datetime",                   // 日期时间选择类型
                    elem: '#ID-laydate-rangeLinked',   // 绑定容器元素
                    range: ['#ID-laydate-start-date-1', '#ID-laydate-end-date-1'], // 关联的开始和结束输入框
                    rangeLinked: true                  // 启用范围关联
                });
                
                /* ===== 空压机多选下拉框配置 ===== */
                // 延迟初始化xmSelect，确保DOM完全准备就绪
                setTimeout(() => {
                    try {
                        // 检查容器元素是否存在且可见
                        const container = $('#selectedCompressor');
                        if (container.length === 0) {
                            console.error('selectedCompressor元素不存在');
                            return;
                        }
                        
                        // 清理可能存在的旧实例
                        if (self.xmSelectInstance) {
                            try {
                                self.xmSelectInstance.destroy && self.xmSelectInstance.destroy();
                            } catch(e) {
                                console.log('清理旧xmSelect实例时出错:', e);
                            }
                        }
                        container.empty();
                        
                        self.xmSelectInstance = xmSelect.render({
                            el: '#selectedCompressor',        // 绑定容器元素
                            data: [                           // 空压机选项数据
                                {name: '空调1', value: '空调1', selected:false},
                                {name: '空调2', value: '空调2', selected:false},
                                {name: '空调3', value: '空调3', selected:false},
                            ],
                            // 选择变化时的回调函数
                            on: function(data){
                                var arr = data.arr;           // 当前选中的所有项
                                var change = data.change;     // 本次变化的项
                                var isAdd = data.isAdd;       // 是否为添加操作
                                console.log('空压机选择发生变化:', arr);
                            },
                        });
                        
                        console.log('空压机多选组件初始化成功');
                        
                    } catch(error) {
                        console.error('xmSelect初始化失败:', error);
                    }
                }, 100); // 额外延迟100ms确保DOM就绪
                
            } catch(error) {
                console.error('LayUI组件初始化失败:', error);
            }
        });
    },
    
    /**
     * 绑定事件处理函数
     * 主要处理查询按钮的点击事件
     */
    bindQueryEvents: function() {
        const self = this;
        layui.use(['form', 'laydate', 'util','excel','xmSelect'], function() {
            var $ = layui.$;        // jQuery实例
            var layer = layui.layer; // 弹层组件
            
            /* ===== 查询按钮点击事件 ===== */
            $('#search').on('click', async function() {
                try {
                    // 获取用户选择的日期范围
                    var startdate = $("#ID-laydate-start-date-1")[0].value; // 开始日期
                    var enddate = $("#ID-laydate-end-date-1")[0].value;     // 结束日期
                    let selectDatas = []; // 存储选中的空压机列表
                    
                    // 遍历多选下拉框，获取选中的空压机
                    for(let i=0;i<xmSelect.get('#selectedCompressor', true).options.data.length;i++){
                        if(xmSelect.get('#selectedCompressor', true).options.data[i].selected == true){
                            selectDatas.push(xmSelect.get('#selectedCompressor', true).options.data[i].value);
                        }
                    }
                    
                    // 验证是否选择了空压机
                    if(selectDatas.length == 0){
                        layer.alert('未选择空压机！');
                        return;
                    }
                    
                    /* ===== 构建SQL查询语句 ===== */
                    var sql = ""
                    // 查询空压机历史状态记录
                    +" select MachineID,State,StateID,"
                    +"DATE_FORMAT(StartTime,'%Y-%m-%d %H:%i:%s') as StartTime,"      // 格式化开始时间
                    +"DATE_FORMAT(EndTime,'%Y-%m-%d %H:%i:%s') as EndTime,"        // 格式化结束时间
                    +"ROUND(LastTime/60,2) as LastTime "                           // 持续时间转换为分钟
                    +"from historyrecord_aircondition_machinestate \n"
                    +" where machineID in ('"+selectDatas.join("','")+"') \n"     // 过滤选中的空压机
                    +" and StartTime >= '"+startdate+"' and StartTime <= '"+enddate+"' " // 过滤日期范围
                    +" order by stateID,machineID,startTime ";                     // 按状态ID、机器ID、开始时间排序

                    console.info(sql); // 打印SQL语句用于调试
                    
                    // 调用后端API执行SQL查询
                    const data = await self.executeSQLQuery(sql);
                    console.info(data); // 打印返回数据用于调试
                    
                    // 渲染甘特图
                    self.renderOperationTimeGanttChart(data, startdate, enddate);
                    
                } catch (err) {
                    console.error('查询出错：', err);
                }
            });
        });
    },
    
    /**
     * 渲染ECharts甘特图（使用非解耦版的渲染逻辑）
     * @param {Object} data - 从后端API获取的数据
     * @param {string} startdate - 开始日期
     * @param {string} enddate - 结束日期
     */
    renderOperationTimeGanttChart: function(data, startdate, enddate) {
        let yAxisData = [];            // Y轴数据（空压机名称列表）
        let seriesData_run = [];       // 运行状态数据
        let seriesData_free = [];      // 空闲状态数据  
        let seriesData_shutdown = [];  // 停机状态数据
        let seriesData_fault = [];     // 故障状态数据
        
        /* ===== 数据处理和分类 ===== */
        for(let i=0;i<data.data.length;i++){
            // 构建Y轴空压机列表（去重）
            if(yAxisData.indexOf(data.data[i].MachineID) < 0 ){
                yAxisData.push(data.data[i].MachineID);
            }
            
            // 根据状态ID将数据分类到不同的系列中
            switch(data.data[i].StateID){
                case 1: // 运行状态
                    seriesData_run.push({
                        name: "status"+(i+1),
                        value: [
                            yAxisData.indexOf(data.data[i].MachineID), // Y轴索引位置
                            data.data[i].StartTime,                    // 开始时间
                            data.data[i].EndTime,                      // 结束时间
                            data.data[i].MachineID,                    // 机器ID
                            data.data[i].State,                        // 状态名称
                            data.data[i].LastTime                      // 持续时间（分钟）
                        ]
                    });
                    break;
                case 2: // 故障状态
                    seriesData_fault.push({
                        name: "status"+(i+1),
                        value: [
                            yAxisData.indexOf(data.data[i].MachineID), // Y轴索引位置
                            data.data[i].StartTime,                    // 开始时间
                            data.data[i].EndTime,                      // 结束时间
                            data.data[i].MachineID,                    // 机器ID
                            data.data[i].State,                        // 状态名称
                            data.data[i].LastTime                      // 持续时间（分钟）
                        ]
                    });
                    break;
                case 3: // 停机状态
                    seriesData_shutdown.push({
                        name: "status"+(i+1),
                        value: [
                            yAxisData.indexOf(data.data[i].MachineID), // Y轴索引位置
                            data.data[i].StartTime,                    // 开始时间
                            data.data[i].EndTime,                      // 结束时间
                            data.data[i].MachineID,                    // 机器ID
                            data.data[i].State,                        // 状态名称
                            data.data[i].LastTime                      // 持续时间（分钟）
                        ]
                    });
                    break;
                case 4: // 空闲状态
                    seriesData_free.push({
                        name: "status"+(i+1),
                        value: [
                            yAxisData.indexOf(data.data[i].MachineID), // Y轴索引位置
                            data.data[i].StartTime,                    // 开始时间
                            data.data[i].EndTime,                      // 结束时间
                            data.data[i].MachineID,                    // 机器ID
                            data.data[i].State,                        // 状态名称
                            data.data[i].LastTime                      // 持续时间（分钟）
                        ]
                    });
                    break;
            }
        }
        
        /* ===== ECharts图表初始化和配置 ===== */
        var myChart = echarts.init(document.getElementById('chart'));
        option = {
            tooltip: {
                formatter: function(params) {
                    // 自定义提示框内容：设备名称、状态、时间范围、持续时间
                    return params.marker + params.value[3] + ': ' + params.value[4] + 
                           '<br/>开始时间:' + params.value[1] + 
                           '<br/>结束时间:' + params.value[2] + 
                           '<br/>状态时长:' + params.value[5] + ' min';
                }
            },
            title: {
                text: "设备状态时长统计",
                textStyle: {
                    color: "#fff",
                },
                left: "left",
                top: 5
            },
            dataZoom: [
                {
                    type: "slider",
                    filterMode: "weakFilter",
                    showDataShadow: false,
                    height: 10,
                    borderColor: "transparent",
                    backgroundColor: "#00EBFF",
                    handleIcon: "M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z",
                    handleSize: 20,
                    handleStyle: {
                        shadowBlur: 6,
                        shadowOffsetX: 1,
                        shadowOffsetY: 2,
                        shadowColor: "#aaa"
                    },
                    labelFormatter: ""
                },
                {
                    type: "inside",
                    filterMode: "weakFilter"
                }
            ],
            grid: {
                left: "5%",
                right: "5%",
                top: "10%",
                bottom: "10%",
                containLabel: true
            },
            xAxis: {
                min: startdate,
                max: enddate,
                scale: true,
                type: "time",
                nameTextStyle:{
                    color:"#fff"
                },
                axisLine:{
                    lineStyle:{
                        color:"#fff"
                    }
                },
            },
            yAxis: {
                nameTextStyle:{
                    color:"#fff"
                },
                axisLine:{
                    lineStyle:{
                        color:"#fff"
                    }
                },
                data: yAxisData
            },
            color: [
                "#00FF00",
                "#FFFF00",
                "#FF4040",
                "#CFCFCF"
            ],
            legend: {
                top: 20,
                textStyle: {
                    color: "#fff",
                },
                data: [
                    "运行",
                    "空闲",
                    "故障",
                    "停机"
                ]
            },
            series: [
                {
                    name: "运行",
                    type: "custom",
                    renderItem: this.renderItem,
                    itemStyle: {
                        normal: {
                            opacity: 1
                        }
                    },
                    encode: {
                        x: [1, 2],
                        y: 0
                    },
                    data: seriesData_run
                },
                {
                    name: "空闲",
                    type: "custom",
                    renderItem: this.renderItem,
                    itemStyle: {
                        normal: {
                            opacity: 1
                        }
                    },
                    encode: {
                        x: [1, 2],
                        y: 0
                    },
                    data: seriesData_free
                },
                {
                    name: "故障",
                    type: "custom",
                    renderItem: this.renderItem,
                    itemStyle: {
                        normal: {
                            opacity: 1
                        }
                    },
                    encode: {
                        x: [1, 2],
                        y: 0
                    },
                    data: seriesData_fault
                },
                {
                    name: "停机",
                    type: "custom",
                    renderItem: this.renderItem,
                    itemStyle: {
                        normal: {
                            opacity: 1
                        }
                    },
                    encode: {
                        x: [1, 2],
                        y: 0
                    },
                    data: seriesData_shutdown
                }
            ]
        };
        
        // 应用图表配置
        if (option && typeof option === "object") {
            myChart.setOption(option, true); // true表示清除之前的配置
        }
    },
    
    /**
     * 自定义渲染函数 - 绘制甘特图的矩形条
     * @param {Object} params - ECharts参数对象
     * @param {Object} api - ECharts API对象
     * @returns {Object} 矩形图形配置
     */
    renderItem: function(params, api) {
        var categoryIndex = api.value(0);  // 获取Y轴类目索引（机器ID索引）
        var start = api.coord([api.value(1), categoryIndex]); // 开始时间在画布上的坐标
        var end = api.coord([api.value(2), categoryIndex]);   // 结束时间在画布上的坐标
        var height = api.size([0, 1])[1] * 0.6; // 矩形高度为类目高度的60%
    
        // 创建矩形形状，并进行裁剪确保不超出绘图区域
        var rectShape = echarts.graphic.clipRectByRect({
            x: start[0],                // 矩形左边X坐标
            y: start[1] - height / 2,   // 矩形上边Y坐标（居中）
            width: end[0] - start[0],   // 矩形宽度（时间跨度）
            height: height              // 矩形高度
        }, {
            x: params.coordSys.x,       // 坐标系左边界
            y: params.coordSys.y,       // 坐标系上边界
            width: params.coordSys.width,   // 坐标系宽度
            height: params.coordSys.height  // 坐标系高度
        });
        
        // 返回矩形图形配置
        return rectShape && {
            type: 'rect',           // 图形类型：矩形
            shape: rectShape,       // 矩形形状配置
            style: api.style()      // 应用系列样式（颜色等）
        };
    },
    
    /**
     * 发送SQL查询到后端API
     * @param {string} strsql - SQL查询语句
     * @returns {Promise<Object>} 返回查询结果的Promise
     */
    executeSQLQuery: async function(strsql) {
        const sql = strsql;
        console.info(sql); // 打印SQL用于调试
        
        // 发送POST请求到后端API
        const res = await fetch('http://192.168.10.100:8004/api/sql/run-sql', {
            method: 'POST',                         // POST方法
            headers: {
                'Content-Type': 'application/json', // JSON格式请求
                'Accept': 'application/json'        // 期望JSON格式响应
            },
            body: JSON.stringify({ sql })           // SQL语句作为请求体
        });

        const data = await res.json(); // 解析JSON响应
        return data;                    // 返回数据
    }
};
