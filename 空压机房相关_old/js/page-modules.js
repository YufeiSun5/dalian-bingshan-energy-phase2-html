/**
 * 空压机房管理系统 - 页面模块集合
 * 
 * 该文件包含了系统中所有功能页面的业务逻辑模块
 * 每个模块负责特定页面的初始化、事件绑定和数据处理
 * 
 * 模块列表：
 * - GanttModule: 甘特图统计模块
 * - RealtimeModule: 实时数据模块
 * - CommunicationModule: 通讯状态模块
 * - VoltageReportModule: 电压报表模块
 * - VoltageCurveModule: 电压曲线模块
 */

/* ===========================================
   甘特图统计模块（GanttModule）
   功能：显示空压机运行状态的甘特图
   主要功能：
   1. 初始化LayUI组件（日期选择器、多选下拉框）
   2. 处理查询按钮点击事件
   3. 调用后端API获取数据
   4. 渲染ECharts甘特图
   =========================================== */
window.GanttModule = {
    // 标记组件是否已经初始化
    isInitialized: false,
    
    // 存储xmSelect实例，便于管理
    xmSelectInstance: null,
    
    /**
     * 模块初始化入口
     * 调用组件初始化和事件绑定
     */
    init: function() {
        console.log('初始化甘特图模块');
        
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('甘特图模块已初始化，跳过重复初始化');
            return;
        }
        
        const self = this;
        
        // 等待DOM和LayUI组件完全就绪
        this.waitForReady(() => {
            console.log('开始初始化甘特图组件');
            self.initLayUIComponents(); // 初始化LayUI组件
            self.bindEvents(); // 绑定事件处理函数
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
            console.log(`检查甘特图初始化条件 (${checkCount}/${maxChecks})`);
            
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
                console.log('甘特图页面未激活');
                if (checkCount < maxChecks) {
                    setTimeout(checkReady, 500);
                } else {
                    console.error('甘特图页面激活超时');
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
        console.log('重置甘特图模块状态');
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
            console.error('甘特图模块初始化失败：找不到selectedCompressor元素');
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
                                {name: '空压机1', value: '空压机1', selected:false},
                                {name: '空压机2', value: '空压机2', selected:false},
                                {name: '空压机3', value: '空压机3', selected:false},
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
    bindEvents: function() {
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
                    +"from historyrecord_compressor_machinestate \n"
                    +" where machineID in ('"+selectDatas.join("','")+"') \n"     // 过滤选中的空压机
                    +" and StartTime >= '"+startdate+"' and StartTime <= '"+enddate+"' " // 过滤日期范围
                    +" order by stateID,machineID,startTime ";                     // 按状态ID、机器ID、开始时间排序

                    console.info(sql); // 打印SQL语句用于调试
                    
                    // 调用后端API执行SQL查询
                    const data = await self.sendSQL(sql);
                    console.info(data); // 打印返回数据用于调试
                    
                    // 渲染甘特图
                    self.renderChart(data, startdate, enddate);
                    
                } catch (err) {
                    console.error('查询出错：', err);
                }
            });
        });
    },
    
    /**
     * 渲染ECharts甘特图
     * @param {Object} data - 从后端API获取的数据
     * @param {string} startdate - 开始日期
     * @param {string} enddate - 结束日期
     */
    renderChart: function(data, startdate, enddate) {
        // 初始化数据数组
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
            // 提示框配置
            tooltip: {
                formatter: function(params) {
                    // 自定义提示框内容：设备名称、状态、时间范围、持续时间
                    return params.marker + params.value[3] + ': ' + params.value[4] + 
                           '<br/>开始时间:' + params.value[1] + 
                           '<br/>结束时间:' + params.value[2] + 
                           '<br/>状态时长:' + params.value[5] + ' min';
                }
            },
            // 图表标题配置
            title: {
                text: "设备状态时长统计",
                textStyle: {
                    color: "#fff",  // 白色文字适配深色背景
                },
                left: "left",       // 左对齐
                top: 5              // 距离顶部5px
            },
            // 数据缩放组件配置（支持时间轴缩放）
            dataZoom: [
                {
                    type: "slider",         // 滑动条类型缩放
                    filterMode: "weakFilter", // 弱过滤模式
                    showDataShadow: false,  // 不显示数据阴影
                    height: 10,             // 滑动条高度
                    borderColor: "transparent", // 透明边框
                    backgroundColor: "#00EBFF", // 蓝色背景
                    // 自定义滑动条手柄图标
                    handleIcon: "M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z",
                    handleSize: 20,         // 手柄大小
                    handleStyle: {
                        shadowBlur: 6,      // 阴影模糊度
                        shadowOffsetX: 1,   // 阴影X偏移
                        shadowOffsetY: 2,   // 阴影Y偏移
                        shadowColor: "#aaa" // 阴影颜色
                    },
                    labelFormatter: ""      // 不显示标签
                },
                {
                    type: "inside",         // 内置缩放（鼠标滚轮和拖拽）
                    filterMode: "weakFilter" // 弱过滤模式
                }
            ],
            // 网格配置（图表绘图区域）
            grid: {
                left: "5%",             // 左边距
                right: "5%",            // 右边距
                top: "10%",             // 上边距
                bottom: "10%",          // 下边距
                containLabel: true      // 包含坐标轴标签
            },
            // X轴配置（时间轴）
            xAxis: {
                min: startdate,         // 最小值为查询开始时间
                max: enddate,           // 最大值为查询结束时间
                scale: true,            // 启用刻度缩放
                type: "time",           // 时间类型轴
                nameTextStyle:{
                    color:"#fff"        // 轴名称文字颜色
                },
                axisLine:{
                    lineStyle:{
                        color:"#fff"    // 轴线颜色
                    }
                },
            },
            // Y轴配置（空压机名称）
            yAxis: {
                nameTextStyle:{
                    color:"#fff"        // 轴名称文字颜色
                },
                axisLine:{
                    lineStyle:{
                        color:"#fff"    // 轴线颜色
                    }
                },
                data: yAxisData         // Y轴数据（空压机名称列表）
            },
            // 系列颜色配置
            color: [
                "#00FF00",              // 运行状态：绿色
                "#FFFF00",              // 空闲状态：黄色
                "#FF4040",              // 故障状态：红色
                "#CFCFCF"               // 停机状态：灰色
            ],
            // 图例配置
            legend: {
                top: 20,                // 距离顶部20px
                textStyle: {
                    color: "#fff",      // 图例文字颜色
                },
                data: [                 // 图例数据
                    "运行",
                    "空闲", 
                    "故障",
                    "停机"
                ]
            },
            // 系列配置（甘特图的各个状态条）
            series: [
                {
                    name: "运行",               // 运行状态系列
                    type: "custom",             // 自定义图表类型
                    renderItem: this.renderItem, // 自定义渲染函数
                    itemStyle: {
                        normal: {
                            opacity: 1          // 不透明度
                        }
                    },
                    encode: {
                        x: [1,2],               // X轴编码：索引1和2对应开始时间和结束时间
                        y: 0                    // Y轴编码：索引0对应机器ID索引
                    },
                    data: seriesData_run        // 运行状态数据
                },
                {
                    name: "空闲",               // 空闲状态系列
                    type: "custom",             // 自定义图表类型
                    renderItem: this.renderItem, // 自定义渲染函数
                    itemStyle: {
                        normal: {
                            opacity: 1          // 不透明度
                        }
                    },
                    encode: {
                        x: [1,2],               // X轴编码：索引1和2对应开始时间和结束时间
                        y: 0                    // Y轴编码：索引0对应机器ID索引
                    },
                    data: seriesData_free       // 空闲状态数据
                },
                {
                    name: "故障",               // 故障状态系列
                    type: "custom",             // 自定义图表类型
                    renderItem: this.renderItem, // 自定义渲染函数
                    itemStyle: {
                        normal: {
                            opacity: 1          // 不透明度
                        }
                    },
                    encode: {
                        x: [1,2],               // X轴编码：索引1和2对应开始时间和结束时间
                        y: 0                    // Y轴编码：索引0对应机器ID索引
                    },
                    data: seriesData_fault      // 故障状态数据
                },
                {
                    name: "停机",               // 停机状态系列
                    type: "custom",             // 自定义图表类型
                    renderItem: this.renderItem, // 自定义渲染函数
                    itemStyle: {
                        normal: {
                            opacity: 1          // 不透明度
                        }
                    },
                    encode: {
                        x: [1,2],               // X轴编码：索引1和2对应开始时间和结束时间
                        y: 0                    // Y轴编码：索引0对应机器ID索引
                    },
                    data: seriesData_shutdown   // 停机状态数据
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
    sendSQL: async function(strsql) {
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

/* ===========================================
   实时数据模块（RealtimeModule）
   功能：显示空压机房实时运行数据
   参考气表工艺图的实现方式，在工艺图背景上显示实时数据
   =========================================== */
window.RealtimeModule = {
    // 标记是否已初始化
    isInitialized: false,
    
    // 数据刷新定时器ID
    refreshTimer: null,
    
    // ECharts图表实例
    chartInstance: null,
    
    // 空压机配置
    compressorConfig: {
        // 空压机数据点位置配置 (x, y 为容器内的百分比位置，0-100)
        // 根据实际工艺图调整位置
        positions: [
            // 神钢系列（1#-4#）
            { x: 20.5, y: 7.5 },  // 神钢1#
            { x: 44.5, y: 7.5 },  // 神钢2#
            { x: 69, y: 7.5 },  // 神钢3#
            { x: 81, y: 7.5 },  // 神钢4#
            // 寿力系列（2#-4#，删除寿力1#）
            { x: 10.1, y: 25 },  // 寿力2#
            { x: 10.5, y: 52 },  // 寿力3#
            { x: 57, y: 7.5 },  // 寿力4#
        ],
        
        // 每个空压机的标题和指示灯配置
        titles: [
            // 神钢系列
            { title: "神钢1#", indicatorPosition: "left" },
            { title: "神钢2#", indicatorPosition: "left" },
            { title: "神钢3#", indicatorPosition: "left" },
            { title: "神钢4#", indicatorPosition: "left" },
            // 寿力系列（删除寿力1#）
            { title: "寿力2#", indicatorPosition: "left" },
            { title: "寿力3#", indicatorPosition: "left" },
            { title: "寿力4#", indicatorPosition: "left" },
        ],
        
        // 数据字段配置
        dataFields: [
            { label: "压力", unit: "bar", key: "pressure" },
            { label: "电流", unit: "A", key: "current" },
            { label: "状态", unit: "", key: "status" }
        ],
        
        // 当前数据（硬编码初始值）
        data: [
            { pressure: '8.5', current: '125', status: '运行' },  // 神钢1#
            { pressure: '8.2', current: '120', status: '运行' },  // 神钢2#
            { pressure: '7.8', current: '110', status: '停机' },  // 神钢3#
            { pressure: '8.9', current: '135', status: '故障' },  // 神钢4#
            { pressure: '8.1', current: '115', status: '运行' },  // 寿力2#
            { pressure: '7.9', current: '105', status: '停机' },  // 寿力3#
            { pressure: '8.7', current: '130', status: '运行' },  // 寿力4#
        ]
    },
    
    /**
     * 数据浮窗配置（大罐前压力、大罐压力、出口压力、出口露点、出流量）
     */
    dataPointsConfig: {
        // 大罐前压力
        tankFrontPressure: {
            id: 'tank-front-pressure',
            label: '大罐前压力',
            value: '8.2',
            unit: 'bar'
        },
        // 大罐压力
        tankPressure: {
            id: 'tank-pressure',
            label: '大罐压力',
            value: '8.5',
            unit: 'bar'
        },
        // 出口压力
        outletPressure: {
            id: 'outlet-pressure',
            label: '出口压力',
            value: '7.9',
            unit: 'bar'
        },
        // 出口露点
        outletDewpoint: {
            id: 'outlet-dewpoint',
            label: '出口露点',
            value: '-25',
            unit: '℃'
        },
        // 出流量
        outletFlow: {
            id: 'outlet-flow',
            label: '出流量',
            value: '850',
            unit: 'L/min'
        }
    },
    
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化空压机房实时数据模块');
        
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('实时数据模块已初始化，跳过重复初始化');
            return;
        }
        
        // 注意：数据已硬编码在 compressorConfig.data 中，无需重新初始化
        
        this.initDataDisplay();      // 初始化数据显示界面
        this.initDataPoints();       // 初始化数据浮窗显示
        this.initMiniChart();        // 初始化磨砂玻璃柱形图
        // this.startDataRefresh();  // 不启动自动刷新 - 改为手动调用更新
        this.isInitialized = true;   // 标记为已初始化
        
        // 暴露方法到全局作用域，方便在控制台修改数据
        this.exposeControlMethods();
    },
    
    /**
     * 暴露控制方法到全局作用域
     */
    exposeControlMethods: function() {
        const module = this;
        
        // 暴露到全局
        window.CompressorControl = {
            // 空压机数据修改方法
            setCompressorData: (index, pressure, current, status) => {
                module.compressorConfig.data[index] = { pressure, current, status };
                module.updateDisplay([module.compressorConfig.data[index]], index);
                console.log(`✓ 已更新空压机 ${index + 1}：压力=${pressure}, 电流=${current}, 状态=${status}`);
            },
            
            // 获取空压机数据
            getCompressorData: (index) => {
                console.log(`空压机 ${index + 1} 数据:`, module.compressorConfig.data[index]);
                return module.compressorConfig.data[index];
            },
            
            // 设置冷干机电量
            setDryerPower: (value) => {
                module.setDryerPower(value);
                console.log(`✓ 已设置冷干机电量: ${value} kW`);
            },
            
            // 设置冷干机状态
            setDryerStatus: (status) => {
                module.setDryerStatus(status);
                console.log(`✓ 已设置冷干机状态: ${status}`);
            },
            
            // 设置今日总用量
            setTodayUsage: (value) => {
                module.setTodayUsage(value);
                console.log(`✓ 已设置今日总用量: ${value} KWh`);
            },
            
            // 设置昨日总用量
            setYesterdayUsage: (value) => {
                module.setYesterdayUsage(value);
                console.log(`✓ 已设置昨日总用量: ${value} KWh`);
            },
            
            // 设置今日用电柱形图数据
            setChartData: (dataArray) => {
                if (module.chartInstance) {
                    const option = module.chartInstance.getOption();
                    option.series[0].data = dataArray;
                    module.chartInstance.setOption(option);
                    console.log(`✓ 已更新柱形图数据:`, dataArray);
                }
            },
            
            // 更新所有空压机数据
            setAllCompressorsData: (dataArray) => {
                module.compressorConfig.data = dataArray;
                module.updateDisplay(dataArray);
                console.log('✓ 已更新所有空压机数据');
            },
            
            // 设置大罐前压力
            setTankFrontPressure: (value) => {
                module.dataPointsConfig.tankFrontPressure.value = value;
                const element = document.getElementById('tank-front-pressure');
                if (element) element.textContent = value;
                console.log(`✓ 已设置大罐前压力: ${value}`);
            },
            
            // 设置大罐压力
            setTankPressure: (value) => {
                module.dataPointsConfig.tankPressure.value = value;
                const element = document.getElementById('tank-pressure');
                if (element) element.textContent = value;
                console.log(`✓ 已设置大罐压力: ${value}`);
            },
            
            // 设置出口压力
            setOutletPressure: (value) => {
                module.dataPointsConfig.outletPressure.value = value;
                const element = document.getElementById('outlet-pressure');
                if (element) element.textContent = value;
                console.log(`✓ 已设置出口压力: ${value}`);
            },
            
            // 设置出口露点
            setOutletDewpoint: (value) => {
                module.dataPointsConfig.outletDewpoint.value = value;
                const element = document.getElementById('outlet-dewpoint');
                if (element) element.textContent = value;
                console.log(`✓ 已设置出口露点: ${value}`);
            },
            
            // 设置出流量
            setOutletFlow: (value) => {
                module.dataPointsConfig.outletFlow.value = value;
                const element = document.getElementById('outlet-flow');
                if (element) element.textContent = value;
                console.log(`✓ 已设置出流量: ${value}`);
            },
            
            // 获取所有数据浮窗数据
            getAllDataPoints: () => {
                console.log('所有数据浮窗:', module.dataPointsConfig);
                return module.dataPointsConfig;
            },
            
            // 显示帮助信息
            help: function() {
                console.clear();
                console.log('%c========== 空压机房控制系统 ==========', 'color: #00ff00; font-size: 16px; font-weight: bold;');
                console.log('%c【空压机数据修改】', 'color: #00ffff; font-size: 12px; font-weight: bold;');
                console.log('CompressorControl.setCompressorData(索引, 压力, 电流, 状态)');
                console.log('  例: CompressorControl.setCompressorData(0, "8.5", "125", "运行")');
                console.log('  索引范围: 0-6 (7台机器)');
                console.log('  状态: "运行" / "故障" / "停机"');
                console.log('');
                console.log('CompressorControl.getCompressorData(索引)');
                console.log('  例: CompressorControl.getCompressorData(0)');
                console.log('');
                console.log('%c【冷干机控制】', 'color: #ff00ff; font-size: 12px; font-weight: bold;');
                console.log('CompressorControl.setDryerPower(电量)');
                console.log('  例: CompressorControl.setDryerPower(25.5)');
                console.log('');
                console.log('CompressorControl.setDryerStatus(状态)');
                console.log('  例: CompressorControl.setDryerStatus("运行")');
                console.log('');
                console.log('%c【用量统计控制】', 'color: #ffff00; font-size: 12px; font-weight: bold;');
                console.log('CompressorControl.setTodayUsage(用量)');
                console.log('  例: CompressorControl.setTodayUsage(1250)');
                console.log('');
                console.log('CompressorControl.setYesterdayUsage(用量)');
                console.log('  例: CompressorControl.setYesterdayUsage(1180)');
                console.log('');
                console.log('%c【柱形图控制】', 'color: #ffaa00; font-size: 12px; font-weight: bold;');
                console.log('CompressorControl.setChartData(数据数组)');
                console.log('  例: CompressorControl.setChartData([65, 82, 75, 88, 92, 78, 85])');
                console.log('');
                console.log('%c【数据浮窗控制】', 'color: #00ff88; font-size: 12px; font-weight: bold;');
                console.log('CompressorControl.setTankFrontPressure(值)');
                console.log('  例: CompressorControl.setTankFrontPressure("8.5")');
                console.log('');
                console.log('CompressorControl.setTankPressure(值)');
                console.log('  例: CompressorControl.setTankPressure("8.2")');
                console.log('');
                console.log('CompressorControl.setOutletPressure(值)');
                console.log('  例: CompressorControl.setOutletPressure("7.9")');
                console.log('');
                console.log('CompressorControl.setOutletDewpoint(值)');
                console.log('  例: CompressorControl.setOutletDewpoint("-25")');
                console.log('');
                console.log('CompressorControl.setOutletFlow(值)');
                console.log('  例: CompressorControl.setOutletFlow("850")');
                console.log('');
                console.log('CompressorControl.getAllDataPoints()');
                console.log('  获取所有数据浮窗的当前数据');
                console.log('');
                console.log('%c【批量操作】', 'color: #aa00ff; font-size: 12px; font-weight: bold;');
                console.log('CompressorControl.setAllCompressorsData(数据数组)');
                console.log('  例: CompressorControl.setAllCompressorsData([{压力,电流,状态}, ...])');
                console.log('');
                console.log('========================================');
            }
        };
        
        // 页面加载完成时输出帮助信息
        console.clear();
        window.CompressorControl.help();
    },
    
    /**
     * 初始化数据显示界面
     * HTML已包含所有浮窗元素，此方法仅做初始化标记
     */
    initDataDisplay: function() {
        console.log('低压系统数据显示界面初始化完成 - 浮窗元素已在HTML中定义');
        // HTML中已包含所有浮窗元素，无需动态创建
        // 数据更新通过updateDisplay方法完成
    },
    
    /**
     * 冷干机配置
     */
    dryerConfig: {
        position: { x: 50, y: 71 },  // 冷干机位置百分比
        title: "冷干机",
        indicatorPosition: "left",
        data: {
            power: 0  // 电量 (kW)
        }
    },
    
    
    /**
     * 设置冷干机电量
     * @param {Number} value - 电量数值 (kW)
     */
    setDryerPower: function(value) {
        const element = document.getElementById('dryer-power');
        if (element) {
            element.textContent = value;
        }
        this.dryerConfig.data.power = value;
    },
    
    /**
     * 设置冷干机指示灯状态
     * @param {String} status - 状态值: 'running' (运行), 'fault' (故障), 'stopped' (停机)
     */
    setDryerStatus: function(status) {
        const indicator = document.getElementById('dryer-indicator');
        if (!indicator) return;
        
        indicator.classList.remove('running', 'fault', 'stopped');
        if (status === 'running' || status === '运行') {
            indicator.classList.add('running');
        } else if (status === 'fault' || status === '故障') {
            indicator.classList.add('fault');
        } else {
            indicator.classList.add('stopped');
        }
    },
    
    /**
     * 总用量浮窗位置配置
     * 可根据需要调整 left 和 top 的百分比值
     */
    usageConfig: {
        today: {
            left: '75%',    // 距离容器左边的百分比
            top: '32%'      // 距离容器顶部的百分比
        },
        yesterday: {
            left: '75%',    // 距离容器左边的百分比
            top: '58%'      // 距离容器顶部的百分比
        }
    },
    
    
    /**
     * 设置今日总用量
     * @param {Number} value - 用量数值 (KWh)
     */
    setTodayUsage: function(value) {
        const element = document.getElementById('today-usage-value');
        if (element) {
            element.textContent = value;
        }
    },
    
    /**
     * 设置昨日总用量
     * @param {Number} value - 用量数值 (KWh)
     */
    setYesterdayUsage: function(value) {
        const element = document.getElementById('yesterday-usage-value');
        if (element) {
            element.textContent = value;
        }
    },
    
    /**
     * 设置今日总用量浮窗位置
     * @param {String} left - 左边位置百分比 (如 '10%')
     * @param {String} top - 顶部位置百分比 (如 '85%')
     */
    setTodayUsagePosition: function(left, top) {
        this.usageConfig.today.left = left;
        this.usageConfig.today.top = top;
        const elements = document.querySelectorAll('.usage-window');
        if (elements[0]) {
            elements[0].style.left = left;
            elements[0].style.top = top;
        }
    },
    
    /**
     * 设置昨日总用量浮窗位置
     * @param {String} left - 左边位置百分比 (如 '30%')
     * @param {String} top - 顶部位置百分比 (如 '85%')
     */
    setYesterdayUsagePosition: function(left, top) {
        this.usageConfig.yesterday.left = left;
        this.usageConfig.yesterday.top = top;
        const elements = document.querySelectorAll('.usage-window');
        if (elements[1]) {
            elements[1].style.left = left;
            elements[1].style.top = top;
        }
    },
    
    /**
     * 初始化数据浮窗显示
     * 初始化大罐前压力、大罐压力、出口压力、出口露点、出流量等数据点
     */
    initDataPoints: function() {
        // 遍历所有数据点，初始化显示
        for (const key in this.dataPointsConfig) {
            const point = this.dataPointsConfig[key];
            const element = document.getElementById(point.id);
            if (element) {
                element.textContent = point.value;
            }
        }
        console.log('数据浮窗已初始化');
    },
    
    /**
     * 初始化磨砂玻璃柱形图
     * 在页面中央显示一个简洁的柱形图
     */
    initMiniChart: function() {
        console.log('初始化磨砂玻璃柱形图');
        
        const chartContainer = document.getElementById('compressor-mini-chart');
        if (!chartContainer) {
            console.error('未找到柱形图容器元素');
            return;
        }
        
        // 初始化ECharts实例
        if (typeof echarts !== 'undefined') {
            this.chartInstance = echarts.init(chartContainer);
            
            // 生成柱形图数据（7个柱子：神钢1#-4#, 寿力2#-4#）
            const data = [65, 82, 75, 88, 92, 78, 85];
            const names = ['神钢1#', '神钢2#', '神钢3#', '神钢4#', '寿力2#', '寿力3#', '寿力4#'];
            
            const option = {
                title: {
                    text: '设备今日用电',
                    left: 'center',
                    top: '0%',
                    textStyle: {
                        color: '#ffffff',
                        fontSize: 17,
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                    }
                },
                grid: {
                    left: '0%',
                    right: '0%',
                    bottom: '8%',
                    top: '7%',
                    containLabel: false
                },
                xAxis: {
                    type: 'category',
                    data: names,
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: true,
                        color: '#ffffff',
                        fontSize: 12,
                        interval: 0
                    },
                    splitLine: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    }
                },
                series: [{
                    type: 'bar',
                    data: data,
                    barWidth: '45%',
                    label: {
                        show: true,
                        position: 'top',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                        formatter: '{c}'
                    },
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 235, 255, 0.9)' },
                            { offset: 0.5, color: 'rgba(74, 144, 226, 0.7)' },
                            { offset: 1, color: 'rgba(30, 60, 114, 0.5)' }
                        ]),
                        barBorderRadius: [6, 6, 0, 0],
                        shadowColor: 'rgba(0, 235, 255, 0.4)',
                        shadowBlur: 10,
                        shadowOffsetY: 0
                    },
                    emphasis: {
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(0, 235, 255, 1)' },
                                { offset: 0.5, color: 'rgba(74, 144, 226, 0.9)' },
                                { offset: 1, color: 'rgba(30, 60, 114, 0.7)' }
                            ])
                        }
                    }
                }],
                tooltip: {
                    show: false
                }
            };
            
            this.chartInstance.setOption(option);
            
            // 延迟调用resize确保容器尺寸正确
            setTimeout(() => {
                if (this.chartInstance) {
                    this.chartInstance.resize();
                }
            }, 100);
            
            // 监听窗口大小变化
            window.addEventListener('resize', () => {
                if (this.chartInstance) {
                    this.chartInstance.resize();
                }
            });
            
            console.log('磨砂玻璃柱形图初始化完成');
        }
    },
    
    /**
     * 启动数据刷新定时器
     * 定期从后端获取最新的实时数据
     */
    startDataRefresh: function() {
        const self = this;
        
        // 清除已存在的定时器
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // 立即执行一次数据刷新
        this.refreshData();
        
        // 启动定时器，每5秒刷新一次
        this.refreshTimer = setInterval(() => {
            self.refreshData();
        }, 5000);
        
        console.log('数据刷新定时器已启动');
    },
    
    /**
     * 刷新实时数据
     * 使用硬编码数据进行显示
     */
    refreshData: async function() {
        try {
            // 使用硬编码数据
            const data = this.compressorConfig.data;
            
            // 更新显示
            this.updateDisplay(data);
            
        } catch (error) {
            console.error('刷新实时数据失败:', error);
        }
    },
    
    /**
     * 更新指示灯状态
     * @param {Number} index - 空压机索引 (0-7)
     * @param {String} status - 状态值: 'running' (运行), 'fault' (故障), 'stopped' (停机)
     */
    updateIndicatorStatus: function(index, status) {
        const indicator = document.getElementById(`indicator-${index}`);
        if (!indicator) return;
        
        // 移除所有状态类
        indicator.classList.remove('running', 'fault', 'stopped');
        
        // 添加新状态类
        if (status === 'running' || status === '运行') {
            indicator.classList.add('running');
        } else if (status === 'fault' || status === '故障') {
            indicator.classList.add('fault');
        } else {
            indicator.classList.add('stopped');
        }
    },
    
    /**
     * 生成模拟数据（开发测试用）
     * 正式环境中应替换为真实API调用
     */
    generateMockData: function() {
        return this.compressorConfig.titles.map((_, index) => {
            const rand = Math.random();
            let statusText = '停机';
            let statusClass = 'stopped';
            
            // 随机生成状态
            if (rand > 0.7) {
                statusText = '运行';
                statusClass = 'running';
            } else if (rand > 0.4) {
                statusText = '故障';
                statusClass = 'fault';
            }
            
            // 更新指示灯状态
            this.updateIndicatorStatus(index, statusClass);
            
            return {
                pressure: (Math.random() * 2 + 7).toFixed(2),      // 压力：7-9 bar
                current: (Math.random() * 50 + 100).toFixed(1),    // 电流：100-150A
                status: statusText                                   // 状态：运行/故障/停机
            };
        });
    },
    
    /**
     * 更新单个或多个空压机数据
     * @param {Array|Object} data - 数据数组或单个数据对象
     * @param {Number} index - 如果是单个数据，指定空压机索引
     */
    updateDisplay: function(data, index) {
        // 如果传入的是单个对象且指定了索引，则转换为数组格式
        if (!Array.isArray(data) && index !== undefined) {
            const tempData = [];
            tempData[index] = data;
            data = tempData;
        }
        
        // 遍历更新每个空压机的数据
        data.forEach((compressorData, i) => {
            if (!compressorData) return;
            
            // 更新配置中的数据
            this.compressorConfig.data[i] = { ...this.compressorConfig.data[i], ...compressorData };
            
            // 更新每个数据字段的显示
            this.compressorConfig.dataFields.forEach((field) => {
                const element = document.getElementById(`${field.key}-${i}`);
                if (element) {
                    const value = compressorData[field.key];
                    element.textContent = value !== null && value !== undefined ? value : '无连接';
                    
                    // 如果是状态字段，更新颜色
                    if (field.key === 'status') {
                        this.updateStatusTextColor(element, value);
                    }
                }
            });
            
            // 更新状态指示灯颜色
            this.updateIndicator(i, compressorData.status);
        });
    },
    
    /**
     * 更新状态文字颜色以匹配指示灯
     * @param {Element} element - 状态文字元素
     * @param {String} status - 状态值
     */
    updateStatusTextColor: function(element, status) {
        if (!element) return;
        
        switch(status) {
            case '运行':
                element.style.color = '#2ed573';
                element.style.textShadow = '0 0 8px rgba(46, 213, 115, 0.6)';
                break;
            case '故障':
                element.style.color = '#ff4d4f';
                element.style.textShadow = '0 0 8px rgba(255, 77, 79, 0.6)';
                break;
            default: // 停机
                element.style.color = '#888888';
                element.style.textShadow = '0 0 4px rgba(80, 80, 80, 0.3)';
                break;
        }
    },
    
    /**
     * 更新状态指示灯
     * @param {Number} index - 空压机索引
     * @param {String} status - 状态值
     */
    updateIndicator: function(index, status) {
        const indicator = document.getElementById(`indicator-${index}`);
        if (!indicator) {
            console.warn(`未找到指示灯元素: indicator-${index}`);
            return;
        }
        
        // 移除所有状态类
        indicator.classList.remove('running', 'fault', 'stopped');
        // 清除内联样式，让CSS类生效
        indicator.style.background = '';
        indicator.style.boxShadow = '';
        
        // 根据状态添加对应的CSS类
        switch(status) {
            case '运行':
                indicator.classList.add('running');
                break;
            case '待机':
                // 待机状态暂时使用运行状态的样式
                indicator.classList.add('running');
                break;
            case '故障':
                indicator.classList.add('fault');
                break;
            case '停机':
            default:
                indicator.classList.add('stopped');
                break;
        }
    },
    
    /**
     * 修改数据组位置
     * @param {Number|String} groupIndex - 空压机索引（0-7）或名称（如"神钢1#"、"寿力1#"）
     * @param {Number} x - X坐标百分比
     * @param {Number} y - Y坐标百分比
     */
    updateDataPosition: function(groupIndex, x, y) {
        // 如果传入的是名称，转换为索引
        if (typeof groupIndex === 'string') {
            const nameMap = {
                '神钢1#': 0, '神钢2#': 1, '神钢3#': 2, '神钢4#': 3,
                '寿力1#': 4, '寿力2#': 5, '寿力3#': 6, '寿力4#': 7
            };
            groupIndex = nameMap[groupIndex];
            if (groupIndex === undefined) {
                console.error('未找到对应的空压机名称');
                return;
            }
        }
        
        if (groupIndex < 0 || groupIndex >= this.compressorConfig.titles.length) {
            console.error('空压机索引超出范围（0-7）');
            return;
        }
        
        this.compressorConfig.positions[groupIndex] = { x, y };
        
        const group = document.getElementById(`compressor-group-${groupIndex}`);
        if (group) {
            group.style.left = x + '%';
            group.style.top = y + '%';
        }
    },
    
    /**
     * 停止数据刷新
     * 用于页面切换时清理定时器
     */
    stopDataRefresh: function() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('数据刷新定时器已停止');
        }
    },
    
    /**
     * 重置模块
     * 清理资源并重置状态
     */
    reset: function() {
        this.stopDataRefresh();
        
        // 清理图表实例
        if (this.chartInstance) {
            this.chartInstance.dispose();
            this.chartInstance = null;
        }
        
        this.isInitialized = false;
        console.log('实时数据模块已重置');
    }
};

/* ===========================================
   通讯状态模块（CommunicationModule）
   功能：监控设备通讯连接状态
   状态：框架已搭建，待具体实现
   =========================================== */
window.CommunicationModule = {
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化通讯状态模块');
        this.initUI();                    // 初始化用户界面
        this.checkCommunicationStatus();  // 检查通讯状态
    },
    
    /**
     * 初始化用户界面
     * 设置通讯状态监控界面
     */
    initUI: function() {
        layui.use(['form', 'table'], function() {
            // TODO: 初始化通讯状态界面
            // 可以显示各设备的连接状态、信号强度等
        });
    },
    
    /**
     * 检查通讯状态
     * 监控各设备的网络连接状态
     */
    checkCommunicationStatus: function() {
        // TODO: 实现通讯状态检查逻辑
        console.log('检查通讯状态');
        // 这里可以定期ping设备或检查连接状态
        // 并在界面上显示连接状态（在线/离线/异常）
    }
};

/* ===========================================
   电压报表模块（VoltageReportModule）
   功能：分析和展示电压相关报表数据
   状态：框架已搭建，待具体实现
   =========================================== */
window.VoltageReportModule = {
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化电压报表模块');
        this.initUI();          // 初始化用户界面
        this.loadVoltageData(); // 加载电压数据
    },
    
    /**
     * 初始化用户界面
     * 设置电压报表的查询条件和数据表格
     */
    initUI: function() {
        layui.use(['form', 'laydate', 'table'], function() {
            // TODO: 初始化电压报表界面
            // 包括日期选择器、查询条件、数据表格等
        });
    },
    
    /**
     * 加载电压数据
     * 从后端API获取电压相关数据
     */
    loadVoltageData: function() {
        // TODO: 实现电压数据加载逻辑
        console.log('加载电压数据');
        // 这里可以调用API获取电压历史数据
        // 并生成相应的报表和统计信息
    }
};

/* ===========================================
   电压曲线模块（VoltageCurveModule）
   功能：绘制和分析电压变化曲线
   状态：框架已搭建，待具体实现
   =========================================== */
window.VoltageCurveModule = {
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化电压曲线模块');
        this.initUI();             // 初始化用户界面
        this.renderVoltageCurve(); // 渲染电压曲线图
    },
    
    /**
     * 初始化用户界面
     * 设置电压曲线的查询条件和图表容器
     */
    initUI: function() {
        layui.use(['form', 'laydate'], function() {
            // TODO: 初始化电压曲线界面
            // 包括时间范围选择器、设备选择器等
        });
    },
    
    /**
     * 渲染电压曲线图
     * 使用ECharts绘制电压随时间变化的曲线
     */
    renderVoltageCurve: function() {
        // TODO: 实现电压曲线绘制逻辑
        console.log('渲染电压曲线图');
        if (typeof echarts !== 'undefined') {
            // 这里可以配置ECharts曲线图
            // 包括坐标轴、数据系列、样式等
        }
    }
};

/* ===========================================
   高压数据模块（HighPressureModule）
   功能：显示高压系统实时运行数据
   完全独立的数据系统、HTML、CSS与低压分离
   =========================================== */
window.HighPressureModule = {
    // 标记是否已初始化
    isInitialized: false,
    
    // 数据刷新定时器ID
    refreshTimer: null,
    
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化高压系统数据模块');
        
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('高压系统数据模块已初始化，跳过重复初始化');
            return;
        }
        
        this.initDataDisplay();      // 初始化数据显示界面
        // this.startDataRefresh();  // 不启动自动刷新 - 改为手动调用更新
        this.isInitialized = true;   // 标记为已初始化
    },
    
    /**
     * 初始化数据显示界面
     * HTML已包含所有浮窗元素，此方法仅做初始化标记
     */
    initDataDisplay: function() {
        console.log('高压系统数据显示界面初始化完成 - 浮窗元素已在HTML中定义');
        // HTML中已包含所有浮窗元素，无需动态创建
        // 数据更新通过updateDisplay方法完成
    },
    
    /**
     * 冷干机配置
     */
    dryerConfig: {
        position: { x: 50, y: 71 },  // 冷干机位置百分比
        title: "冷干机",
        indicatorPosition: "left",
        data: {
            power: 0  // 电量 (kW)
        }
    },
    
    
    /**
     * 设置冷干机电量
     * @param {Number} value - 电量数值 (kW)
     */
    setDryerPower: function(value) {
        const element = document.getElementById('high-dryer-power');
        if (element) {
            element.textContent = value;
        }
        this.dryerConfig.data.power = value;
    },
    
    /**
     * 设置冷干机指示灯状态
     * @param {String} status - 状态值: 'running' (运行), 'fault' (故障), 'stopped' (停机)
     */
    setDryerStatus: function(status) {
        const indicator = document.getElementById('high-dryer-indicator');
        if (!indicator) return;
        
        indicator.classList.remove('running', 'fault', 'stopped');
        if (status === 'running' || status === '运行') {
            indicator.classList.add('running');
        } else if (status === 'fault' || status === '故障') {
            indicator.classList.add('fault');
        } else {
            indicator.classList.add('stopped');
        }
    },
    
    
    /**
     * 高压系统用量浮窗位置配置
     */
    usageConfig: {
        today: {
            left: '75%',    // 距离容器左边的百分比
            top: '32%'      // 距离容器顶部的百分比
        },
        yesterday: {
            left: '75%',    // 距离容器左边的百分比
            top: '58%'      // 距离容器顶部的百分比
        }
    },
    
    
    /**
     * 设置高压系统今日总用量
     * @param {Number} value - 用量数值 (KWh)
     */
    setTodayUsage: function(value) {
        const element = document.getElementById('high-today-usage-value');
        if (element) {
            element.textContent = value;
        }
    },
    
    /**
     * 设置高压系统昨日总用量
     * @param {Number} value - 用量数值 (KWh)
     */
    setYesterdayUsage: function(value) {
        const element = document.getElementById('high-yesterday-usage-value');
        if (element) {
            element.textContent = value;
        }
    },
    
    
    /**
     * 启动数据刷新定时器
     */
    startDataRefresh: function() {
        const self = this;
        
        // 清除已存在的定时器
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // 立即执行一次数据刷新
        this.refreshData();
        
        // 启动定时器，每5秒刷新一次
        this.refreshTimer = setInterval(() => {
            self.refreshData();
        }, 5000);
        
        console.log('高压系统数据刷新定时器已启动');
    },
    
    /**
     * 刷新实时数据
     */
    refreshData: async function() {
        try {
            // 高压系统已改为活塞机，暂时无数据刷新逻辑
            console.log('高压系统数据刷新');
        } catch (error) {
            console.error('刷新高压系统实时数据失败:', error);
        }
    },
    
    /**
     * 更新活塞机状态
     * @param {Number} pistonIndex - 活塞机编号 (1-4)
     * @param {Object} statusData - 状态数据，所有值使用数字：1=正常，2=不正常
     *                              { run: 1|2, normal: 1|2, mode: 1|2, interlock: 1|2 }
     */
    updatePistonStatus: function(pistonIndex, statusData) {
        if (pistonIndex < 1 || pistonIndex > 4) {
            console.error('活塞机编号必须在1-4之间');
            return;
        }
        
        // 更新运行/停止状态 (1=运行, 2=停止)
        if (statusData.run !== undefined) {
            const runElement = document.getElementById(`piston-${pistonIndex}-run`);
            if (runElement) {
                if (statusData.run === 1) {
                    runElement.textContent = '运行';
                    runElement.className = 'status-light running';
                } else {
                    runElement.textContent = '停止';
                    runElement.className = 'status-light stopped';
                }
            }
        }
        
        // 更新正常/异常状态 (1=正常, 2=异常)
        if (statusData.normal !== undefined) {
            const normalElement = document.getElementById(`piston-${pistonIndex}-normal`);
            if (normalElement) {
                if (statusData.normal === 1) {
                    normalElement.textContent = '正常';
                    normalElement.className = 'status-light normal';
                } else {
                    normalElement.textContent = '异常';
                    normalElement.className = 'status-light abnormal';
                }
            }
        }
        
        // 更新自动/手动模式 (1=自动, 2=手动)
        if (statusData.mode !== undefined) {
            const modeElement = document.getElementById(`piston-${pistonIndex}-mode`);
            if (modeElement) {
                if (statusData.mode === 1) {
                    modeElement.textContent = '自动';
                    modeElement.className = 'status-light auto';
                } else {
                    modeElement.textContent = '手动';
                    modeElement.className = 'status-light manual';
                }
            }
        }
        
        // 更新联锁状态 (1=联锁, 2=联锁熄灭)
        if (statusData.interlock !== undefined) {
            const interlockElement = document.getElementById(`piston-${pistonIndex}-interlock`);
            if (interlockElement) {
                if (statusData.interlock === 1) {
                    interlockElement.textContent = '联锁';
                    interlockElement.className = 'status-light interlock';
                } else {
                    interlockElement.textContent = '联锁熄灭';
                    interlockElement.className = 'status-light no-interlock';
                }
            }
        }
    },
    
    /**
     * 更新活塞机运行时长
     * @param {Number} pistonIndex - 活塞机编号 (1-4)
     * @param {Number} hours - 运行时长（小时）
     */
    updatePistonHours: function(pistonIndex, hours) {
        if (pistonIndex < 1 || pistonIndex > 4) {
            console.error('活塞机编号必须在1-4之间');
            return;
        }
        
        const hoursElement = document.getElementById(`piston-${pistonIndex}-hours`);
        if (hoursElement) {
            hoursElement.textContent = hours;
        }
    },
    
    /**
     * 更新系统参数面板
     * @param {Object} params - 系统参数 { systemPressure, instantFlow, accumulatedFlow, voltages: {uab, ubc, uca}, currents: {ia, ib, ic}, activeEnergy }
     */
    updateSystemParams: function(params) {
        // 更新系统压力
        if (params.systemPressure !== undefined) {
            const element = document.getElementById('system-pressure');
            if (element) element.textContent = params.systemPressure;
        }
        
        // 更新瞬时流量
        if (params.instantFlow !== undefined) {
            const element = document.getElementById('instant-flow');
            if (element) element.textContent = params.instantFlow;
        }
        
        // 更新累计流量
        if (params.accumulatedFlow !== undefined) {
            const element = document.getElementById('accumulated-flow');
            if (element) element.textContent = params.accumulatedFlow;
        }
        
        // 更新电压
        if (params.voltages) {
            if (params.voltages.uab !== undefined) {
                const element = document.getElementById('voltage-uab');
                if (element) element.textContent = params.voltages.uab;
            }
            if (params.voltages.ubc !== undefined) {
                const element = document.getElementById('voltage-ubc');
                if (element) element.textContent = params.voltages.ubc;
            }
            if (params.voltages.uca !== undefined) {
                const element = document.getElementById('voltage-uca');
                if (element) element.textContent = params.voltages.uca;
            }
        }
        
        // 更新电流
        if (params.currents) {
            if (params.currents.ia !== undefined) {
                const element = document.getElementById('current-ia');
                if (element) element.textContent = params.currents.ia;
            }
            if (params.currents.ib !== undefined) {
                const element = document.getElementById('current-ib');
                if (element) element.textContent = params.currents.ib;
            }
            if (params.currents.ic !== undefined) {
                const element = document.getElementById('current-ic');
                if (element) element.textContent = params.currents.ic;
            }
        }
        
        // 更新有功电能
        if (params.activeEnergy !== undefined) {
            const element = document.getElementById('active-energy');
            if (element) element.textContent = params.activeEnergy;
        }
    },
    
    /**
     * 更新所有高压系统数据
     * @param {Object} data - 完整的高压系统数据
     */
    updateAllData: function(data) {
        // 更新活塞机状态和时长
        if (data.pistons && Array.isArray(data.pistons)) {
            data.pistons.forEach((piston, index) => {
                const pistonIndex = index + 1;
                if (piston.status) {
                    this.updatePistonStatus(pistonIndex, piston.status);
                }
                if (piston.hours !== undefined) {
                    this.updatePistonHours(pistonIndex, piston.hours);
                }
            });
        }
        
        // 更新系统参数面板
        if (data.systemParams) {
            this.updateSystemParams(data.systemParams);
        }
    },
    
    /**
     * 更新单个或多个高压系统数据
     */
    updateDisplay: function(data, index) {
        // 如果传入的是单个对象且指定了索引，则转换为数组格式
        if (!Array.isArray(data) && index !== undefined) {
            const tempData = [];
            tempData[index] = data;
            data = tempData;
        }
        
        // 遍历更新每个高压系统的数据
        data.forEach((compressorData, i) => {
            if (!compressorData) return;
            
            // 更新配置中的数据
            this.compressorConfig.data[i] = { ...this.compressorConfig.data[i], ...compressorData };
            
            // 更新每个数据字段的显示
            this.compressorConfig.dataFields.forEach((field) => {
                const element = document.getElementById(`high-${field.key}-${i}`);
                if (element) {
                    const value = compressorData[field.key];
                    element.textContent = value !== null && value !== undefined ? value : '无连接';
                    
                    // 如果是状态字段，更新颜色
                    if (field.key === 'status') {
                        this.updateStatusTextColor(element, value);
                    }
                }
            });
            
            // 更新状态指示灯颜色
            this.updateIndicator(i, compressorData.status);
        });
    },
    
    /**
     * 更新状态文字颜色
     */
    updateStatusTextColor: function(element, status) {
        if (!element) return;
        
        switch(status) {
            case '运行':
                element.style.color = '#2ed573';
                element.style.textShadow = '0 0 8px rgba(46, 213, 115, 0.6)';
                break;
            case '故障':
                element.style.color = '#ff4d4f';
                element.style.textShadow = '0 0 8px rgba(255, 77, 79, 0.6)';
                break;
            default: // 停机
                element.style.color = '#888888';
                element.style.textShadow = '0 0 4px rgba(80, 80, 80, 0.3)';
                break;
        }
    },
    
    /**
     * 更新状态指示灯
     */
    updateIndicator: function(index, status) {
        const indicator = document.getElementById(`high-indicator-${index}`);
        if (!indicator) return;
        
        // 根据状态设置指示灯颜色
        switch(status) {
            case '运行':
                indicator.style.background = 'rgba(0, 255, 0, 0.9)';
                indicator.style.boxShadow = '0 0 12px rgba(0, 255, 0, 0.7), 0 0 20px rgba(0, 255, 0, 0.5)';
                break;
            case '待机':
                indicator.style.background = 'rgba(255, 255, 0, 0.9)';
                indicator.style.boxShadow = '0 0 12px rgba(255, 255, 0, 0.7), 0 0 20px rgba(255, 255, 0, 0.5)';
                break;
            case '故障':
                indicator.style.background = 'rgba(255, 0, 0, 0.9)';
                indicator.style.boxShadow = '0 0 12px rgba(255, 0, 0, 0.7), 0 0 20px rgba(255, 0, 0, 0.5)';
                break;
            case '停机':
                indicator.style.background = 'rgba(128, 128, 128, 0.9)';
                indicator.style.boxShadow = '0 0 12px rgba(128, 128, 128, 0.7), 0 0 20px rgba(128, 128, 128, 0.5)';
                break;
            default:
                indicator.style.background = 'rgba(255, 150, 50, 0.9)';
                indicator.style.boxShadow = '0 0 12px rgba(255, 150, 50, 0.7), 0 0 20px rgba(255, 150, 50, 0.5)';
        }
    },
    
    /**
     * 停止数据刷新
     */
    stopDataRefresh: function() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('高压系统数据刷新定时器已停止');
        }
    },
    
    /**
     * 重置模块
     */
    reset: function() {
        this.stopDataRefresh();
        this.isInitialized = false;
        console.log('高压系统数据模块已重置');
    }
};

/* ===========================================
   台数控制器模块（UnitControllerModule）
   功能：显示空压机台数控制器界面
   模仿KOBELCO控制面板风格
   =========================================== */
window.UnitControllerModule = {
    // 标记是否已初始化
    isInitialized: false,
    
    // 数据刷新定时器ID
    refreshTimer: null,
    
    /**
     * 模块初始化入口
     */
    init: function() {
        console.log('初始化台数控制器模块');
        
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('台数控制器模块已初始化，跳过重复初始化');
            return;
        }
        
        this.initDataDisplay();      // 初始化数据显示界面
        this.isInitialized = true;   // 标记为已初始化
        
        // 暴露方法到全局作用域
        this.exposeControlMethods();
    },
    
    /**
     * 暴露控制方法到全局作用域
     */
    exposeControlMethods: function() {
        const module = this;
        
        // 暴露到全局
        window.UnitControllerControl = {
            /**
             * 设备映射关系
             * NO.1=神钢4#, NO.2=神钢3#, NO.3=寿力4#, NO.4=神钢1#, 
             * NO.5=寿力1#, NO.6=神钢2#, NO.7=寿力2#, NO.8=寿力3#
             */
            deviceMap: {
                1: '神钢4#',
                2: '神钢3#',
                3: '寿力4#',
                4: '神钢1#',
                5: '寿力1#',
                6: '神钢2#',
                7: '寿力2#',
                8: '寿力3#'
            },

            /**
             * 更新单个机组的指示灯状态
             * @param {Number} unitIndex - 机组编号 (1-8)
             * @param {String} column - 列名: 'auto', 'run', 'load'
             * @param {Boolean} active - 是否激活
             */
            setIndicator: (unitIndex, column, active) => {
                if (unitIndex < 1 || unitIndex > 8) {
                    console.error('机组编号必须在1-8之间');
                    return;
                }
                const element = document.getElementById(`unit-${unitIndex}-${column}`);
                if (element) {
                    if (active) {
                        element.classList.add('unit-active');
                    } else {
                        element.classList.remove('unit-active');
                    }
                    const deviceName = window.UnitControllerControl.deviceMap[unitIndex];
                    console.log(`✓ 已更新${deviceName}(NO.${unitIndex})的${column}指示灯: ${active ? '激活' : '关闭'}`);
                }
            },
            
            /**
             * 更新单个机组的文字状态（状态块）
             * @param {Number} unitIndex - 机组编号 (1-8)
             * @param {String} column - 列名: 'unload', 'fault'
             * @param {String} text - 文字内容
             * @param {Boolean} isFault - 是否为故障状态（用于fault列）
             */
            setText: (unitIndex, column, text, isFault = false) => {
                if (unitIndex < 1 || unitIndex > 8) {
                    console.error('机组编号必须在1-8之间');
                    return;
                }
                const element = document.getElementById(`unit-${unitIndex}-${column}`);
                if (element) {
                    element.textContent = text;
                    
                    // 移除所有状态类
                    element.classList.remove('unit-status-normal', 'unit-status-off', 'unit-status-fault', 'unit-status-disabled');
                    
                    if (column === 'unload') {
                        // 故障列：正常/运行/故障/停机/无连接
                        if (text === '正常' || text === '运行') {
                            element.classList.add('unit-status-normal');  // 绿色
                        } else if (text === '故障') {
                            element.classList.add('unit-status-fault');  // 红色闪烁
                        } else if (text === '停机') {
                            element.classList.add('unit-status-off');  // 灰色
                        } else if (text === '无连接' || text === '--') {
                            element.classList.add('unit-status-disabled');  // 灰色（无连接）
                        } else {
                            element.classList.add('unit-status-off');  // 默认灰色
                        }
                    } else if (column === 'fault') {
                        // 先发选择列：OFF/ON/无连接
                        if (isFault || text === 'ON') {
                            element.classList.add('unit-status-normal');  // ON时显示绿色
                        } else if (text === '--' || text === '无连接') {
                            element.classList.add('unit-status-disabled');
                        } else {
                            element.classList.add('unit-status-off');  // OFF时显示灰色
                        }
                    }
                    
                    const deviceName = window.UnitControllerControl.deviceMap[unitIndex];
                    console.log(`✓ 已更新${deviceName}(NO.${unitIndex})的${column}状态块: ${text}`);
                }
            },
            
            /**
             * 更新单个机组的所有状态
             * @param {Number} unitIndex - 机组编号 (1-8)
             * @param {Object} status - 状态对象 { auto: bool, run: bool, load: bool, unload: string, fault: string }
             */
            setUnitStatus: (unitIndex, status) => {
                if (status.auto !== undefined) {
                    window.UnitControllerControl.setIndicator(unitIndex, 'auto', status.auto);
                }
                if (status.run !== undefined) {
                    window.UnitControllerControl.setIndicator(unitIndex, 'run', status.run);
                }
                if (status.load !== undefined) {
                    window.UnitControllerControl.setIndicator(unitIndex, 'load', status.load);
                }
                if (status.unload !== undefined) {
                    window.UnitControllerControl.setText(unitIndex, 'unload', status.unload);
                }
                if (status.fault !== undefined) {
                    const isFault = status.fault === 'ON';
                    window.UnitControllerControl.setText(unitIndex, 'fault', status.fault, isFault);
                }
                const deviceName = window.UnitControllerControl.deviceMap[unitIndex];
                console.log(`✓ 已更新${deviceName}(NO.${unitIndex})的所有状态`);
            },
            
            /**
             * 更新横置压力条宽度和数值
             * @param {Number} pressure - 压力值 (Mpa)
             * @param {Number} maxPressure - 最大压力值，默认1.6 (Mpa)
             */
            setPressure: (pressure, maxPressure = 1.6) => {
                const percentage = (pressure / maxPressure) * 100;
                const barFill = document.getElementById('horizontal-pressure-bar-fill');
                const pressureValue = document.getElementById('horizontal-pressure-value');
                
                if (barFill) {
                    barFill.style.width = percentage + '%';
                }
                if (pressureValue) {
                    pressureValue.textContent = pressure.toFixed(2);
                }
                console.log(`✓ 已更新横置压力条: ${pressure} Mpa (${percentage.toFixed(1)}%)`);
            },
            
            /**
             * 更新压力参数
             * @param {Object} params - 参数对象 { pih, ph, pl, pll }
             */
            setPressureParams: (params) => {
                if (params.pih !== undefined) {
                    const element = document.getElementById('param-pih');
                    if (element) element.textContent = params.pih;
                }
                if (params.ph !== undefined) {
                    const element = document.getElementById('param-ph');
                    if (element) element.textContent = params.ph;
                }
                if (params.pl !== undefined) {
                    const element = document.getElementById('param-pl');
                    if (element) element.textContent = params.pl;
                }
                if (params.pll !== undefined) {
                    const element = document.getElementById('param-pll');
                    if (element) element.textContent = params.pll;
                }
                console.log('✓ 已更新压力参数');
            },
            
            /**
             * 更新系统压力显示
             * @param {Number} pressure - 系统压力值 (Mpa)
             */
            setSystemPressure: (pressure) => {
                const element = document.getElementById('system-pressure-value');
                if (element) {
                    element.textContent = pressure.toFixed(3);
                }
                console.log(`✓ 已更新系统压力: ${pressure} Mpa`);
            },
            
            /**
             * 更新所有数据
             * @param {Object} data - 完整的台数控制器数据
             */
            updateAllData: (data) => {
                // 更新所有机组状态
                if (data.units && Array.isArray(data.units)) {
                    data.units.forEach((unit, index) => {
                        const unitIndex = index + 1;
                        window.UnitControllerControl.setUnitStatus(unitIndex, unit);
                    });
                }
                
                // 更新压力条
                if (data.pressure !== undefined) {
                    window.UnitControllerControl.setPressure(data.pressure, data.maxPressure);
                }
                
                // 更新压力参数
                if (data.pressureParams) {
                    window.UnitControllerControl.setPressureParams(data.pressureParams);
                }
                
                // 更新系统压力
                if (data.systemPressure !== undefined) {
                    window.UnitControllerControl.setSystemPressure(data.systemPressure);
                }
                
                console.log('✓ 已更新台数控制器所有数据');
            },
            
            /**
             * 显示帮助信息
             */
            help: function() {
                console.clear();
                console.log('%c═══════════════════════════════════════════', 'color: #00ff00; font-size: 16px; font-weight: bold;');
                console.log('%c台数控制器控制系统 - 使用指南', 'color: #00ff00; font-size: 18px; font-weight: bold;');
                console.log('%c═══════════════════════════════════════════', 'color: #00ff00; font-size: 16px; font-weight: bold;');
                
                console.log('\n%c【单个指示灯控制】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
                console.log('%cUnitControllerControl.setIndicator(机组编号, 列名, 激活状态)', 'color: #ffff00;');
                console.log('  例: UnitControllerControl.setIndicator(1, "auto", true)');
                console.log('  机组编号: 1-8');
                console.log('  列名: "auto" / "run" / "load"');
                console.log('  激活状态: true / false');
                
                console.log('\n%c【单个文字状态控制】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
                console.log('%cUnitControllerControl.setText(机组编号, 列名, 文字, 是否故障)', 'color: #ffff00;');
                console.log('  例: UnitControllerControl.setText(1, "unload", "正常")');
                console.log('  例: UnitControllerControl.setText(5, "fault", "ON", true)');
                console.log('  列名: "unload" / "fault"');
                
                console.log('\n%c【单个机组完整状态控制】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
                console.log('%cUnitControllerControl.setUnitStatus(机组编号, 状态对象)', 'color: #ffff00;');
                console.log(`  例: UnitControllerControl.setUnitStatus(1, {
    auto: true,
    run: true,
    load: false,
    unload: "正常",
    fault: "OFF"
  })`);
                
                console.log('\n%c【压力条控制】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
                console.log('%cUnitControllerControl.setPressure(压力值, 最大压力值)', 'color: #ffff00;');
                console.log('  例: UnitControllerControl.setPressure(0.8, 1.6)');
                console.log('  压力值: 当前压力 (Mpa)');
                console.log('  最大压力值: 可选，默认1.6 (Mpa)');
                
                console.log('\n%c【压力参数控制】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
                console.log('%cUnitControllerControl.setPressureParams(参数对象)', 'color: #ffff00;');
                console.log(`  例: UnitControllerControl.setPressureParams({
    pih: "0.580",
    ph: "0.550",
    pl: "0.520",
    pll: "0.505"
  })`);
                
                console.log('\n%c【系统压力控制】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
                console.log('%cUnitControllerControl.setSystemPressure(压力值)', 'color: #ffff00;');
                console.log('  例: UnitControllerControl.setSystemPressure(0.523)');
                
                console.log('\n%c【批量更新所有数据】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
                console.log('%cUnitControllerControl.updateAllData(数据对象)', 'color: #ffff00;');
                console.log(`  例: UnitControllerControl.updateAllData({
    units: [
      { auto: false, run: true, load: false, unload: "正常", fault: "OFF" },
      { auto: false, run: false, load: false, unload: "正常", fault: "OFF" },
      // ... 共8个机组
    ],
    pressure: 0.8,
    maxPressure: 1.6,
    pressureParams: { pih: "0.580", ph: "0.550", pl: "0.520", pll: "0.505" },
    systemPressure: 0.523
  })`);
                
                console.log('\n%c═══════════════════════════════════════════', 'color: #00ff00; font-size: 16px; font-weight: bold;');
            }
        };
        
        // 页面加载完成时输出帮助信息
        setTimeout(() => {
            if (window.UnitControllerControl) {
                window.UnitControllerControl.help();
            }
        }, 500);
    },
    
    /**
     * 初始化数据显示界面
     */
    initDataDisplay: function() {
        console.log('台数控制器数据显示界面初始化完成');
        // HTML中已包含所有元素，无需动态创建
        
        // 确保压力条正确显示 - 设置初始值
        const barFill = document.getElementById('horizontal-pressure-bar-fill');
        if (barFill) {
            // 确保宽度属性存在（HTML中已设置为50%）
            if (!barFill.style.width) {
                barFill.style.width = '50%';
            }
            console.log('压力条初始化完成，当前宽度:', barFill.style.width);
        } else {
            console.warn('未找到压力条元素 horizontal-pressure-bar-fill');
        }
    },
    
    /**
     * 重置模块
     */
    reset: function() {
        this.isInitialized = false;
        console.log('台数控制器模块已重置');
    }
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
    },
    
    /**
     * 显示使用帮助信息
     */
    help: function() {
        console.clear();
        console.log('%c═══════════════════════════════════════════', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        console.log('%c空压机房数据管理系统 - 使用指南', 'color: #00ff00; font-size: 18px; font-weight: bold;');
        console.log('%c═══════════════════════════════════════════', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        
        console.log('\n%c【使用方法】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
        console.log('%cCompressorDataManager.updateAllSystems(lowPressureData, highPressureData)', 'color: #ffff00;');
        console.log(`%c示例：
CompressorDataManager.updateAllSystems(
  // 低压系统数据
  {
    compressorData: [
      { pressure: '8.5', current: '125', status: '运行' },
      { pressure: '8.2', current: '120', status: '运行' },
      { pressure: '7.8', current: '110', status: '停机' },
      { pressure: '8.9', current: '135', status: '故障' },
      { pressure: '8.1', current: '115', status: '运行' },
      { pressure: '7.9', current: '105', status: '停机' },
      { pressure: '8.7', current: '130', status: '运行' }
    ],
    dataPoints: {
      tankFrontPressure: '8.2',
      tankPressure: '8.5',
      outletPressure: '7.9',
      outletDewpoint: '-25',
      outletFlow: '850'
    },
    chartData: [65, 82, 75, 88, 92, 78, 85],
    usage: {
      todayUsage: 1250,
      yesterdayUsage: 1180
    }
  },
  // 高压系统数据（新版活塞机 - 状态使用数字：1=正常，2=不正常）
  {
    pistons: [
      {
        status: { run: 1, normal: 1, mode: 1, interlock: 1 },
        hours: 1533
      },
      {
        status: { run: 2, normal: 1, mode: 1, interlock: 1 },
        hours: 1343
      },
      {
        status: { run: 2, normal: 1, mode: 1, interlock: 1 },
        hours: 1440
      },
      {
        status: { run: 1, normal: 1, mode: 2, interlock: 1 },
        hours: 1526
      }
    ],
    systemParams: {
      systemPressure: '4.51',
      instantFlow: '860.7',
      accumulatedFlow: '4888467.0',
      voltages: { uab: '379.6', ubc: '378.5', uca: '381.8' },
      currents: { ia: '20.4', ib: '21.1', ic: '20.3' },
      activeEnergy: '141716.7'
    }
  }
)`, 'color: #cccccc; font-family: monospace;');
        
        console.log('\n%c【参数说明 - 低压系统】', 'color: #ffaa00; font-size: 13px; font-weight: bold;');
        console.log('%ccompressorData: 空压机数据数组，包含7个对象', 'color: #cccccc;');
        console.log('%c  - pressure: 压力值（字符串），如 "8.5"', 'color: #cccccc;');
        console.log('%c  - current: 电流值（字符串），如 "125"', 'color: #cccccc;');
        console.log('%c  - status: 状态值（字符串），可选值："运行" / "故障" / "停机"', 'color: #cccccc;');
        console.log('%cdataPoints: 数据浮窗对象（所有字段可选）', 'color: #cccccc;');
        console.log('%c  - tankFrontPressure: 大罐前压力', 'color: #cccccc;');
        console.log('%c  - tankPressure: 大罐压力', 'color: #cccccc;');
        console.log('%c  - outletPressure: 出口压力', 'color: #cccccc;');
        console.log('%c  - outletDewpoint: 出口露点', 'color: #cccccc;');
        console.log('%c  - outletFlow: 出流量', 'color: #cccccc;');
        console.log('%cchartData: 柱形图数据数组，包含7个数值', 'color: #cccccc;');
        console.log('%cusage: 用量数据对象（所有字段可选）', 'color: #cccccc;');
        console.log('%c  - todayUsage: 今日总用量（数值），如 1250', 'color: #cccccc;');
        console.log('%c  - yesterdayUsage: 昨日总用量（数值），如 1180', 'color: #cccccc;');
        
        console.log('\n%c【参数说明 - 高压系统（新版活塞机）】', 'color: #ffaa00; font-size: 13px; font-weight: bold;');
        console.log('%cpistons: 活塞机数据数组，包含4个对象', 'color: #cccccc;');
        console.log('%c  - status: 状态对象（所有状态使用数字：1=正常，2=不正常）', 'color: #cccccc;');
        console.log('%c    • run: 1=运行, 2=停止', 'color: #cccccc;');
        console.log('%c    • normal: 1=正常, 2=异常', 'color: #cccccc;');
        console.log('%c    • mode: 1=自动, 2=手动', 'color: #cccccc;');
        console.log('%c    • interlock: 1=联锁, 2=联锁熄灭', 'color: #cccccc;');
        console.log('%c  - hours: 运行时长（数值），如 1533', 'color: #cccccc;');
        console.log('%csystemParams: 系统参数对象（所有字段可选）', 'color: #cccccc;');
        console.log('%c  - systemPressure: 系统压力', 'color: #cccccc;');
        console.log('%c  - instantFlow: 瞬时流量', 'color: #cccccc;');
        console.log('%c  - accumulatedFlow: 累计流量', 'color: #cccccc;');
        console.log('%c  - voltages: 电压对象 { uab, ubc, uca }', 'color: #cccccc;');
        console.log('%c  - currents: 电流对象 { ia, ib, ic }', 'color: #cccccc;');
        console.log('%c  - activeEnergy: 有功电能', 'color: #cccccc;');
        
        console.log('\n%c【注意事项】', 'color: #ff00ff; font-size: 13px; font-weight: bold;');
        console.log('%c1. 低压和高压数据都是可选的，可以只更新一个系统', 'color: #cccccc;');
        console.log('%c2. 低压系统空压机数据必须是7个对象的数组', 'color: #cccccc;');
        console.log('%c3. 高压系统活塞机数据必须是4个对象的数组', 'color: #cccccc;');
        console.log('%c4. 柱形图数据必须是7个数值的数组（仅低压系统）', 'color: #cccccc;');
        console.log('%c5. 所有子字段都是可选的，只传递需要更新的数据', 'color: #cccccc;');
        
        console.log('\n%c═══════════════════════════════════════════', 'color: #00ff00; font-size: 16px; font-weight: bold;');
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
        console.clear();
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
                // 直接访问模块数据，避免触发console.log
                const compressorData = window.RealtimeModule.compressorConfig.data;
                
                data.compressors.forEach((comp, index) => {
                    // 获取当前空压机数据
                    const currentData = compressorData[index] || {};
                    
                    // 合并新数据（只更新提供的字段）
                    const pressure = comp.pressure !== undefined ? comp.pressure : currentData.pressure;
                    const current = comp.current !== undefined ? comp.current : currentData.current;
                    
                    // 处理状态（1=运行, 2=故障, 3=停机）
                    let status = currentData.status;
                    if (comp.status !== undefined) {
                        status = this.statusMap[comp.status] || '停机';
                    }
                    
                    // 更新数据并刷新显示
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
                // setChartData 已经有console.log，这里不重复输出
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
                // setTodayUsage 和 setYesterdayUsage 已经有console.log
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
                    // 状态映射：1=运行, 2=故障, 3=停机
                    const statusText = this.statusMap[data.dryer.status] || '停机';
                    window.CompressorControl.setDryerStatus(statusText);
                }
                // setDryerPower 和 setDryerStatus 已经有console.log
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
            window.UnitControllerControl.setSystemPressure(data.systemPressure);
            // setSystemPressure 已经有console.log
        }
        
        // 更新压力条
        if (data.pressure !== undefined && window.UnitControllerControl) {
            window.UnitControllerControl.setPressure(data.pressure, data.maxPressure || 1.6);
            // setPressure 已经有console.log
        }
        
        // 更新压力参数
        if (data.pressureParams && window.UnitControllerControl) {
            window.UnitControllerControl.setPressureParams(data.pressureParams);
            // setPressureParams 已经有console.log
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
        console.clear();
        console.log('%c╔═══════════════════════════════════════════════════════════╗', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        console.log('%c║   空压机房数据更新接口 - 使用指南                       ║', 'color: #00ff00; font-size: 18px; font-weight: bold;');
        console.log('%c╚═══════════════════════════════════════════════════════════╝', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        
        console.log('\n%c【1. 使用说明】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
        console.log('%c调用方法：', 'color: #ffaa00;');
        console.log('%c  CompressorSystemUpdate.updateAll(data)', 'color: #ffff00;');
        console.log('%c  • 可以更新完整数据，也可以只更新某一部分', 'color: #cccccc;');
        console.log('%c  • 只更新提供的数据，未提供的部分保持不变', 'color: #cccccc;');
        
        console.log('\n%c状态值说明：', 'color: #ffaa00;');
        console.log('%c  指示灯状态 (auto/run/load):', 'color: #00ffff;');
        console.log('%c    0 = 关闭（灰色）', 'color: #888888;');
        console.log('%c    1 = 开启（绿色发光）', 'color: #00ff00;');
        console.log('%c  故障状态 (fault) - 显示在"故障"列:', 'color: #00ffff;');
        console.log('%c    1 = 正常（绿色）', 'color: #00ff00;');
        console.log('%c    2 = 故障（红色闪烁）', 'color: #ff0000;');
        console.log('%c    3 = 停机（灰色）', 'color: #888888;');
        console.log('%c  先发选择 (firstStart) - 显示在"先发选择"列:', 'color: #00ffff;');
        console.log('%c    1 = OFF（灰色，灯灭）', 'color: #888888;');
        console.log('%c    2 = ON（绿色发光）', 'color: #00ff00;');
        
        console.log('\n%c设备索引对应关系：', 'color: #ffaa00;');
        console.log('%c  低压系统（7台）: 0=神钢1#, 1=神钢2#, 2=神钢3#, 3=神钢4#, 4=寿力2#, 5=寿力3#, 6=寿力4#', 'color: #cccccc;');
        console.log('%c  台数控制器（8台）: NO.1=神钢4#, NO.2=神钢3#, NO.3=寿力4#, NO.4=神钢1#, NO.5=寿力1#, NO.6=神钢2#, NO.7=寿力2#, NO.8=寿力3#', 'color: #cccccc;');
        console.log('%c  高压系统（4台）: 0=1#活塞机, 1=2#活塞机, 2=3#活塞机, 3=4#活塞机', 'color: #cccccc;');
        
        console.log('\n%c【2. 完整更新代码（可直接复制到控制台）】', 'color: #00ffff; font-size: 14px; font-weight: bold;');
        console.log('%c说明：示例展示了所有可能的状态组合（每种状态都至少出现一次）', 'color: #ffaa00;');
        console.log('%c  台数控制器 - 8台设备展示所有状态组合：', 'color: #ffaa00;');
        console.log('%c  • NO.1: 自动+运行+加载，正常（绿色），OFF（灰色）', 'color: #cccccc;');
        console.log('%c  • NO.2: 自动+运行，故障（红色闪烁），OFF（灰色）', 'color: #cccccc;');
        console.log('%c  • NO.3: 仅自动，停机（灰色），OFF（灰色）', 'color: #cccccc;');
        console.log('%c  • NO.4: 运行+加载，正常（绿色），ON（绿色）', 'color: #cccccc;');
        console.log('%c  • NO.5: 仅运行，故障（红色闪烁），ON（绿色）', 'color: #cccccc;');
        console.log('%c  • NO.6: 仅加载，停机（灰色），ON（绿色）', 'color: #cccccc;');
        console.log('%c  • NO.7: 全部关闭，正常（绿色），ON（绿色）', 'color: #cccccc;');
        console.log('%c  • NO.8: 自动+运行+加载，停机（灰色），OFF（灰色）', 'color: #cccccc;');
        console.log('%c  低压系统 - 7台压缩机展示3种状态：', 'color: #ffaa00;');
        console.log('%c  • 神钢1#, 神钢4#, 寿力4#: 运行（绿色发光）', 'color: #cccccc;');
        console.log('%c  • 神钢2#, 寿力2#: 故障（红色闪烁）', 'color: #cccccc;');
        console.log('%c  • 神钢3#, 寿力3#: 停机（灰色）', 'color: #cccccc;');
        console.log('%c  高压系统 - 4台活塞机展示所有状态组合：', 'color: #ffaa00;');
        console.log('%c  • 1#: 运行+正常+自动+联锁', 'color: #cccccc;');
        console.log('%c  • 2#: 停止+正常+手动+联锁', 'color: #cccccc;');
        console.log('%c  • 3#: 运行+故障+自动+联锁', 'color: #cccccc;');
        console.log('%c  • 4#: 停止+故障+手动+解锁\n', 'color: #cccccc;');
        console.log(`%cCompressorSystemUpdate.updateAll({
    lowPressure: {
        compressors: [
            { pressure: '8.5', current: '125', status: 1 },
            { pressure: '8.2', current: '120', status: 2 },
            { pressure: '7.8', current: '110', status: 3 },
            { pressure: '8.9', current: '135', status: 1 },
            { pressure: '8.1', current: '115', status: 2 },
            { pressure: '7.9', current: '105', status: 3 },
            { pressure: '8.7', current: '130', status: 1 } 
        ],
        dataPoints: {
            tankFrontPressure: '8.2',
            tankPressure: '8.5',
            outletPressure: '7.9',
            outletDewpoint: '-25',
            outletFlow: '850'
        },
        chartData: [65, 82, 75, 88, 92, 78, 85],
        usage: { today: 1250, yesterday: 1180 },
        dryer: { power: 25.5, status: 1 }
    },
    unitController: {
        units: [
            { auto: 1, run: 1, load: 1, fault: 1, firstStart: 1 },
            { auto: 1, run: 1, load: 0, fault: 2, firstStart: 1 },
            { auto: 1, run: 0, load: 0, fault: 3, firstStart: 1 },
            { auto: 0, run: 1, load: 1, fault: 1, firstStart: 2 },
            { auto: 0, run: 1, load: 0, fault: 2, firstStart: 2 },
            { auto: 0, run: 0, load: 1, fault: 3, firstStart: 2 },
            { auto: 0, run: 0, load: 0, fault: 1, firstStart: 2 },
            { auto: 1, run: 1, load: 1, fault: 3, firstStart: 1 }
        ],
        systemPressure: 0.523,
        pressure: 0.99,
        maxPressure: 1.6,
        pressureParams: { pih: '0.580', ph: '0.550', pl: '0.520', pll: '0.505' }
    },
    highPressure: {
        pistons: [
            { status: { run: 1, normal: 1, mode: 1, interlock: 1 }, hours: 1533 },
            { status: { run: 2, normal: 1, mode: 2, interlock: 1 }, hours: 1343 },
            { status: { run: 1, normal: 2, mode: 1, interlock: 1 }, hours: 1440 },
            { status: { run: 2, normal: 2, mode: 2, interlock: 2 }, hours: 1526 }
        ],
        systemParams: {
            systemPressure: '4.51',
            instantFlow: '860.7',
            accumulatedFlow: '4888467.0',
            voltages: { uab: '379.6', ubc: '378.5', uca: '381.8' },
            currents: { ia: '20.4', ib: '21.1', ic: '20.3' },
            activeEnergy: '141716.7'
        }
    }
});`, 'color: #00ff00; background: #1a1a1a; padding: 10px; border-radius: 5px;');
        
        console.log('\n%c╔═══════════════════════════════════════════════════════════╗', 'color: #00ff00; font-size: 16px; font-weight: bold;');
        console.log('%c║   输入 CompressorSystemUpdate.help() 再次查看帮助        ║', 'color: #00ff00; font-size: 14px; font-weight: bold;');
        console.log('%c╚═══════════════════════════════════════════════════════════╝', 'color: #00ff00; font-size: 16px; font-weight: bold;');
    }
};

// 页面加载完成后显示帮助信息
// 注意：这个函数会在HTML文件的PageManager初始化后被调用
// 不需要在这里使用$(document).ready()，因为会与HTML中的初始化冲突
// 如果需要显示帮助，请在HTML文件中调用 CompressorSystemUpdate.help()
