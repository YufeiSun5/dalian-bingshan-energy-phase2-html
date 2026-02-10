# 能源管理系统开发技能指南

## 📋 项目概述

这是一个能源管理系统的前端项目，主要用于监控和统计工厂的能源使用情况，包括：
- **电能**：各区域用电量统计、尖峰平谷分析、同比环比分析
- **气量**：空压机房用气量统计和分析
- **水量**：各区域用水量统计和分析
- **污水处理**：污水处理数据监控和报表
- **热泵系统**：热泵能效分析和统计
- **变压器温度**：变压器温度监控
- **故障报警**：故障报警历史和统计

## 🛠️ 技术栈

- **前端框架**：原生 HTML + JavaScript + CSS
- **UI 框架**：LayUI
- **图表库**：ECharts
- **Excel 处理**：xlsx.full.min.js
- **日期选择**：LayUI laydate 组件
- **HTTP 请求**：LayUI 的 form 模块或原生 fetch

## 📁 项目结构

```
Html/
├── js/                    # 公共 JavaScript 库
│   ├── echarts.js         # ECharts 图表库
│   ├── layui.js           # LayUI 框架
│   ├── xlsx.full.min.js   # Excel 处理库
│   └── css/               # LayUI CSS
├── 登录/                   # 登录和用户管理
├── 电能相关/                # 电能统计和分析页面
├── 空压机房相关/            # 空压机房相关页面
├── 气量相关/                # 气量统计页面
├── 水量相关/                # 水量统计页面
├── 污水处理相关/             # 污水处理页面
├── 热泵系统相关/            # 热泵系统页面
├── 总统计相关/              # 各区域统计页面
├── 菜单/                   # 侧边栏菜单
└── 驾驶舱/                 # 数据大屏
```

## 🎨 UI 设计规范

### 颜色主题

- **背景色**：`#0f266c`（深蓝色）
- **卡片背景**：`#1d386f`（中蓝色）
- **边框色**：`#2a6dc8`（亮蓝色）
- **文字颜色**：
  - 主文字：`#fff`（白色）
  - 次要文字：`#d0d2e0`（浅灰色）
  - 标题文字：`#fff7ca`（浅黄色）
  - 标签文字：`#b9d3f4`（浅蓝色）

### 布局规范

- **页面容器**：使用 `flex` 布局，垂直排列
- **卡片间距**：`8px` 或 `15px`
- **内边距**：卡片内边距 `10px-15px`
- **圆角**：`4px`

### 滚动条样式

所有滚动条使用统一的渐变样式：

```css
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #3c8ce7 0%, #2a6dc8 50%, #1e5aa8 100%);
    border-radius: 6px;
    border: 1px solid #1d386f;
}

::-webkit-scrollbar-track {
    background: linear-gradient(90deg, #0f266c 0%, #18589b 50%, #1d386f 100%);
    border-radius: 6px;
}
```

## 📊 ECharts 图表集成规范

### 基础配置

所有图表使用统一的主题配置：

```javascript
{
    backgroundColor: 'transparent',
    tooltip: {
        backgroundColor: '#1d386f',
        borderColor: '#2a6dc8',
        textStyle: { color: '#fff' }
    },
    legend: {
        textStyle: { color: '#d0d2e0' }
    },
    grid: {
        left: 60,
        right: 40,
        bottom: 40,
        top: 60
    },
    xAxis: {
        axisLine: { lineStyle: { color: '#2a6dc8' } },
        axisLabel: { color: '#d0d2e0' }
    },
    yAxis: {
        nameTextStyle: { color: '#d0d2e0' },
        axisLine: { lineStyle: { color: '#2a6dc8' } },
        axisLabel: { color: '#d0d2e0' },
        splitLine: { lineStyle: { color: '#2a6dc8', opacity: 0.3 } }
    }
}
```

### 图表类型

- **折线图**：用于趋势分析（月度、年度趋势）
- **柱状图**：用于对比分析（同比、环比）
- **饼图**：用于占比统计（各区域占比）
- **热力图**：用于数据分布展示
- **树形图**：用于层级结构展示

### 图表响应式

所有图表必须监听窗口大小变化：

```javascript
window.addEventListener('resize', () => {
    myChart && myChart.resize();
});
```

## 🔧 代码规范

### JavaScript 规范

1. **使用 LayUI 模块化**：
```javascript
layui.use(['laydate', 'layer', 'jquery'], function() {
    const $ = layui.jquery;
    const laydate = layui.laydate;
    // 代码逻辑
});
```

2. **变量命名**：
   - 图表实例：`myChart`, `pieChart`, `lineChart`
   - 数据变量：`data`, `tableData`, `chartData`
   - 配置对象：`config`, `pageConfig`, `chartConfig`

3. **函数命名**：
   - 初始化函数：`initChart()`, `initTable()`
   - 更新函数：`updateChart()`, `updateDashboard()`
   - 数据获取：`fetchData()`, `loadData()`

### HTML 结构规范

1. **页面基本结构**：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <title>页面标题</title>
    <link href="../js/css/layui.css" rel="stylesheet">
    <script src="../js/echarts.js"></script>
    <script src="../js/layui.js"></script>
</head>
<body>
    <div class="page-container">
        <!-- 工具栏 -->
        <div class="toolbar">...</div>
        <!-- 主内容区 -->
        <div class="main-content">...</div>
    </div>
</body>
</html>
```

2. **卡片结构**：
```html
<div class="card-block">
    <div class="card-header">
        <span class="card-title">标题</span>
    </div>
    <div class="card-body">
        <!-- 内容 -->
    </div>
</div>
```

## 📝 常见开发任务

### 1. 创建新的统计页面

**步骤：**
1. 复制现有类似页面作为模板
2. 修改页面标题和配置
3. 实现 `fetchData()` 函数获取数据
4. 实现 `updateDashboard()` 函数渲染数据
5. 如需图表，参考 `ECharts图表集成指南.md`

**示例：**
```javascript
// 1. 获取数据
function fetchData(startDate, endDate) {
    layui.use(['jquery'], function() {
        const $ = layui.jquery;
        $.ajax({
            url: '/api/data',
            data: { startDate, endDate },
            success: function(res) {
                updateDashboard(res.data);
            }
        });
    });
}

// 2. 渲染数据
function updateDashboard(data) {
    // 填充表格
    // 更新图表
}
```

### 2. 集成 ECharts 图表

**参考文件：** `总统计相关/ECharts图表集成指南.md`

**核心步骤：**
1. 引入 ECharts 库
2. 添加图表容器 HTML
3. 初始化图表实例
4. 更新图表数据
5. 实现图表交互（如点击表格联动）

### 3. 使用配置文件模式

**参考文件：** `空压机房相关/chart-table-config.js`

**优势：**
- 配置与代码分离
- 易于维护和修改
- 支持多页面复用

**使用方式：**
```html
<script src="./chart-table-config.js"></script>
<script>
    // 使用 window.PAGE_CONFIG 配置
    const config = window.PAGE_CONFIG;
</script>
```

### 4. 日期选择器集成

```javascript
layui.use('laydate', function() {
    const laydate = layui.laydate;
    
    // 日期范围选择
    laydate.render({
        elem: '#date-range',
        type: 'date',
        range: true,
        done: function(value) {
            const dates = value.split(' - ');
            fetchData(dates[0], dates[1]);
        }
    });
});
```

### 5. Excel 导出功能

```javascript
layui.use(['excel', 'jquery'], function() {
    const excel = layui.excel;
    const $ = layui.jquery;
    
    // 导出表格数据
    function exportExcel() {
        const data = [];
        // 收集表格数据
        $('#data-table tr').each(function() {
            const row = [];
            $(this).find('td').each(function() {
                row.push($(this).text());
            });
            data.push(row);
        });
        
        excel.exportExcel(data, '文件名.xlsx', 'xlsx');
    }
});
```

## 🔍 数据格式规范

### API 响应格式

```javascript
{
    code: 200,           // 状态码
    msg: 'success',      // 消息
    data: {             // 数据
        list: [],       // 列表数据
        total: 100     // 总数
    }
}
```

### 表格数据格式

- **日期格式**：`YYYY-MM-DD`
- **数字格式**：使用千分位分隔符（如：`1,234.56`）
- **单位**：电量（kWh）、气量（m³）、水量（m³）

### 图表数据格式

- **折线图**：`[{name: '系列名', data: [1,2,3...]}]`
- **饼图**：`[{name: '名称', value: 数值}]`
- **柱状图**：与折线图相同

## 🐛 调试技巧

### 1. 控制台调试

```javascript
console.log('数据：', data);
console.table(tableData);  // 表格形式显示
```

### 2. LayUI 提示

```javascript
layui.use('layer', function() {
    const layer = layui.layer;
    layer.msg('操作成功');
    layer.alert('错误信息');
});
```

### 3. 图表调试

```javascript
// 检查图表实例
console.log('图表实例：', myChart);

// 检查图表配置
console.log('图表配置：', myChart.getOption());

// 检查数据
console.log('图表数据：', chartData);
```

### 4. 常见问题排查

**问题1：图表不显示**
- 检查 DOM 元素是否存在
- 检查容器是否有高度
- 检查数据格式是否正确
- 使用 `setTimeout` 延迟初始化

**问题2：数据不更新**
- 检查 API 请求是否成功
- 检查数据格式是否匹配
- 检查更新函数是否被调用

**问题3：样式不生效**
- 检查 CSS 选择器是否正确
- 检查样式优先级
- 使用浏览器开发者工具检查

## 📚 参考文档

- **ECharts 图表集成指南**：`总统计相关/ECharts图表集成指南.md`
- **计算方法说明**：`总统计相关/计算方法V2.md`
- **样式修改指南**：`总统计相关/AI修改样式指南.md`
- **配置文件示例**：`空压机房相关/chart-table-config.js`

## 🚀 快速开始

### 创建新页面模板

1. 复制 `空压机房相关/电气比图表.html` 作为基础模板
2. 修改页面标题和配置
3. 实现数据获取和渲染逻辑
4. 根据需要添加图表

### 修改现有页面

1. 先阅读页面代码，理解数据流
2. 确定需要修改的部分
3. 参考类似页面的实现
4. 测试修改后的功能

## 💡 最佳实践

1. **代码复用**：提取公共函数到配置文件
2. **性能优化**：使用防抖节流处理频繁操作
3. **错误处理**：添加 try-catch 和错误提示
4. **代码注释**：关键逻辑添加注释说明
5. **版本管理**：重要修改前先备份（如 `_old`, `_bak` 目录）

## 🎯 开发工作流

1. **需求分析**：理解业务需求和数据格式
2. **选择模板**：找到最相似的现有页面
3. **代码实现**：修改配置和逻辑
4. **样式调整**：确保 UI 符合规范
5. **功能测试**：测试各种场景
6. **代码优化**：优化性能和代码结构

---

**最后更新：** 2026-01-28
**维护者：** 开发团队
