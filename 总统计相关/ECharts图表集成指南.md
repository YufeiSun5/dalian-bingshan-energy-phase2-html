# ECharts 图表集成指南 (v2.0)

## 📋 功能说明
在电量统计表格下方添加左右布局的图表区域：
- **左侧曲线图**：展示各单元月度趋势，支持多条曲线同时显示
- **右侧饼图**：展示各单元用电占比分布
- **交互功能**：点击表格月份，同时更新曲线图tooltip和饼图数据
- **美化滚动条**：统一的UI风格滚动条样式
- **响应式设计**：自动适配窗口大小变化

---

## 🔧 集成步骤

### 步骤1：引入 ECharts 库

在 `<head>` 部分添加：

```html
<script src="../js/echarts.js"></script>
```

---

### 步骤2：添加 HTML 结构

在表格卡片下方添加左右布局的图表区域：

```html
<!-- 表格卡片 -->
<div class="card-block table-card">
    <div class="card-header">
        <span class="card-title">机加工各单元月度电量统计表</span>
        <!-- 表格内容 -->
    </div>
</div>

<!-- 图表区域 - 左右布局（新增） -->
<div style="display: flex; gap: 15px; min-height: 500px;">
    <!-- 左侧曲线图 -->
    <div class="card-block chart-card" style="flex: 3;">
        <div class="card-header">
            <div class="header-summary">
                <span>各单元月度单台用电趋势</span>
            </div>
            <div class="header-unit">
                <span>单台电能单位（千瓦时/台）</span>
            </div>
        </div>
        <div class="chart-container" id="trend-chart"></div>
    </div>
    
    <!-- 右侧饼图 -->
    <div class="card-block chart-card" style="flex: 2;">
        <div class="card-header">
            <div class="header-summary">
                <span id="pie-chart-title">各单元用电占比</span>
            </div>
            <div class="header-unit">
                <span>电量占比统计</span>
            </div>
        </div>
        <div class="chart-container" id="pie-chart"></div>
    </div>
</div>
```

---

### 步骤3：添加 CSS 样式

在 `<style>` 部分添加：

```css
/* 主容器可滚动 */
.main-content {
    overflow-y: auto;
    gap: 15px;
}

/* 防止卡片被压缩 */
.main-content .card-block {
    flex-shrink: 0;
}

/* 表格卡片最小高度 */
.table-card {
    min-height: 400px;
}

/* 图表卡片最小高度 */
.chart-card {
    min-height: 500px;
}

/* 图表容器 */
.chart-container {
    flex-grow: 1;
    padding: 10px;
    min-height: 450px;
}

/* 滚动条美化 - 统一样式 */
.table-container::-webkit-scrollbar,
.main-content::-webkit-scrollbar,
.chart-container::-webkit-scrollbar,
body::-webkit-scrollbar,
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.table-container::-webkit-scrollbar-thumb,
.main-content::-webkit-scrollbar-thumb,
.chart-container::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb,
::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #3c8ce7 0%, #2a6dc8 50%, #1e5aa8 100%);
    border-radius: 6px;
    border: 1px solid #1d386f;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}

.table-container::-webkit-scrollbar-thumb:hover,
.main-content::-webkit-scrollbar-thumb:hover,
.chart-container::-webkit-scrollbar-thumb:hover,
body::-webkit-scrollbar-thumb:hover,
::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #4a9aff 0%, #3c8ce7 50%, #2a6dc8 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
}

.table-container::-webkit-scrollbar-track,
.main-content::-webkit-scrollbar-track,
.chart-container::-webkit-scrollbar-track,
body::-webkit-scrollbar-track,
::-webkit-scrollbar-track {
    background: linear-gradient(90deg, #0f266c 0%, #18589b 50%, #1d386f 100%);
    border-radius: 6px;
    border: 1px solid #0a1d4a;
}

.table-container::-webkit-scrollbar-corner,
.main-content::-webkit-scrollbar-corner,
.chart-container::-webkit-scrollbar-corner,
body::-webkit-scrollbar-corner,
::-webkit-scrollbar-corner {
    background-color: #1d386f;
}
```

---

### 步骤4：JavaScript 核心代码

在 `layui.use()` 内部添加以下代码：

#### 4.1 全局变量

```javascript
let myChart = null;   // 曲线图实例
let pieChart = null;  // 饼图实例
```

#### 4.2 初始化图表函数

```javascript
// 初始化图表
function initChart() {
    const lineDom = document.getElementById('trend-chart');
    const pieDom = document.getElementById('pie-chart');
    if (!lineDom || !pieDom) return false;
    
    // 初始化曲线图
    myChart = echarts.init(lineDom);
    myChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#1d386f',
            borderColor: '#2a6dc8',
            textStyle: { color: '#fff' }
        },
        legend: {
            textStyle: { color: '#d0d2e0' },
            top: 10
        },
        grid: { left: 60, right: 40, bottom: 40, top: 60 },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLine: { lineStyle: { color: '#2a6dc8' } },
            axisLabel: { color: '#d0d2e0' }
        },
        yAxis: {
            type: 'value',
            name: '单台电量(kWh/台)',
            nameTextStyle: { color: '#d0d2e0' },
            axisLine: { lineStyle: { color: '#2a6dc8' } },
            axisLabel: { color: '#d0d2e0' },
            splitLine: { lineStyle: { color: '#2a6dc8', opacity: 0.3 } }
        },
        series: []
    });
    
    // 初始化饼图
    pieChart = echarts.init(pieDom);
    pieChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: '#1d386f',
            borderColor: '#2a6dc8',
            textStyle: { color: '#fff' },
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: '5%',
            left: 'center',
            textStyle: { color: '#d0d2e0', fontSize: 11 },
            type: 'scroll'
        },
        series: [{
            name: '用电占比',
            type: 'pie',
            radius: '65%',
            center: ['50%', '45%'],
            data: [],
            itemStyle: { borderWidth: 2, borderColor: '#1d386f' },
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
            label: { formatter: '{d}%', color: '#fff', position: 'outside' },
            labelLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.5)' } }
        }]
    });
    
    window.addEventListener('resize', () => {
        myChart && myChart.resize();
        pieChart && pieChart.resize();
    });
    return true;
}
```

#### 4.3 更新图表函数（核心）

```javascript
// 更新图表
function updateChart() {
    if (!myChart || !pieChart) return;
    
    const series = [];
    const legends = [];
    const pieData = [];
    
    itemConfig.forEach((item, index) => {
        // 读取12个月单台用电数据
        const data = [];
        for (let m = 1; m <= 12; m++) {
            const val = $(`#${item.key}_dantai_m${m}_val`).text().replace(/,/g, '');
            data.push(val ? Number(val) : 0);
        }
        
        // 添加曲线图系列
        series.push({
            name: item.name,
            type: 'line',
            data: data,
            smooth: true,
            markPoint: {
                data: [{ type: 'max', name: '最高' }, { type: 'min', name: '最低' }]
            }
        });
        
        // 计算饼图数据（总电量）
        const totalElec = $(`#${item.key}_dianliang_total`).text().replace(/,/g, '');
        if (totalElec && Number(totalElec) > 0) {
            pieData.push({
                name: item.name,
                value: Number(totalElec)
            });
        }
        
        legends.push(item.name);
    });
    
    // 更新曲线图
    myChart.setOption({
        legend: { data: legends },
        series: series
    });
    
    // 更新饼图
    pieChart.setOption({
        series: [{
            name: '用电占比',
            type: 'pie',
            radius: '65%',
            center: ['50%', '45%'],
            data: pieData,
            itemStyle: { borderWidth: 2, borderColor: '#1d386f' },
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
            label: { formatter: '{d}%', color: '#fff', position: 'outside' },
            labelLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.5)' } }
        }]
    });
}
```

**说明：**
- 曲线图读取单台用电数据（`#${key}_dantai_m${month}_val`）
- 饼图读取总电量数据（`#${key}_dianliang_total`）
- 同时更新两个图表，保持数据一致性

#### 4.4 表格交互功能

```javascript
// 表格点击事件
const table = $('#data-table');

table.on('click', 'td, th', function() {
    const month = $(this).data('month');
    if (month) {
        updateHeaderSummaryForMonth(month);
        updatePieChartForMonth(month);
        showLineChartTooltipForMonth(month);
    }
});

// 显示曲线图指定月份的tooltip
function showLineChartTooltipForMonth(month) {
    if (!myChart) return;
    
    const monthIndex = parseInt(month) - 1; // 将月份转为索引（1月 -> 0）
    if (monthIndex >= 0 && monthIndex < 12) {
        myChart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: monthIndex
        });
    }
}

// 更新饼图显示指定月份数据
function updatePieChartForMonth(month) {
    if (!pieChart) return;
    
    const pieData = [];
    itemConfig.forEach(item => {
        const monthElec = $(`#${item.key}_dianliang_m${month}_val`).text().replace(/,/g, '');
        if (monthElec && Number(monthElec) > 0) {
            pieData.push({
                name: item.name,
                value: Number(monthElec)
            });
        }
    });
    
    // 更新饼图标题和数据
    $('#pie-chart-title').text(`${month}月份各单元用电占比`);
    pieChart.setOption({
        series: [{
            data: pieData
        }]
    });
}
```

**说明：**
- 点击表格月份时，同时更新三个内容：头部摘要、饼图数据、曲线图tooltip
- 饼图可以切换显示总体占比或指定月份占比
- 曲线图自动显示对应月份的数据提示

#### 4.5 在数据更新后调用

在 `updateDashboard()` 函数的**末尾**添加：

```javascript
function updateDashboard(data) {
    // ... 原有的表格数据填充代码 ...
    
    // 初始化图表（仅首次）
    if (!myChart) {
        setTimeout(() => {
            if (initChart()) {
                updateChart();
            }
        }, 200);
    } else {
        updateChart();
    }
}
```

**说明：**
- 首次加载时延迟200ms确保DOM就绪
- 后续更新直接调用 `updateChart()`
- 移除了复选框相关逻辑，简化代码

---

## 🎯 核心逻辑说明

### 数据流

```
页面加载
  ↓
fetchData() → updateDashboard()
  ↓
填充表格 → 初始化图表（仅首次）
  ↓
从表格读取数据 → 同时渲染曲线图和饼图
  ↓
等待用户交互
```

### 交互逻辑

```
用户点击表格月份
  ↓
触发 table.on('click') 事件
  ↓
同时执行三个操作：
  ├─ 更新头部摘要信息
  ├─ 更新饼图显示该月数据
  └─ 显示曲线图该月tooltip
```

### 图表联动

```
默认状态：
├─ 曲线图：显示12个月趋势
└─ 饼图：显示总体占比

点击月份后：
├─ 曲线图：高亮该月数据点
└─ 饼图：切换为该月占比
```

---

## 📝 关键点说明

### 1. 数据来源
从表格单元格读取数据，格式：
```javascript
// 曲线图数据（单台用电）
$(`#${item.key}_dantai_m${m}_val`)

// 饼图数据（总电量）
$(`#${item.key}_dianliang_total`)

// 月度数据（饼图切换）
$(`#${item.key}_dianliang_m${month}_val`)
```

### 2. 左右布局的优势
```html
<!-- 3:2 的黄金比例 -->
<div style="display: flex; gap: 15px;">
    <div style="flex: 3;">曲线图</div>  <!-- 60% -->
    <div style="flex: 2;">饼图</div>    <!-- 40% -->
</div>
```

**优势：**
- 充分利用屏幕空间
- 两种图表互补展示
- 视觉层次更丰富

### 3. 表格与图表联动
```javascript
// 一次点击，三重响应
table.on('click', 'td, th', function() {
    const month = $(this).data('month');
    if (month) {
        updateHeaderSummaryForMonth(month);    // 更新摘要
        updatePieChartForMonth(month);         // 更新饼图
        showLineChartTooltipForMonth(month);   // 显示tooltip
    }
});
```

### 4. 滚动条统一美化
所有滚动条使用统一的渐变样式，与UI主题保持一致：
- 蓝色渐变滑块
- 深色渐变轨道
- 悬停效果增强

---

## 🔄 移植到其他页面

### 前置条件检查

1. **是否有 `itemConfig` 数组？**
   - 包含 `key` 和 `name` 字段
   
2. **表格单元格 ID 格式是否一致？**
   - 单台数据：`${key}_dantai_m${month}_val`
   - 总电量：`${key}_dianliang_total`
   - 月度电量：`${key}_dianliang_m${month}_val`

3. **是否使用 jQuery？**
   - 需要 `$()` 选择器和事件绑定

### 移植步骤

1. **复制 HTML 结构**（步骤2）- 左右布局容器
2. **复制 CSS 样式**（步骤3）- 包含滚动条美化
3. **复制 JavaScript 代码**（步骤4）- 5个核心函数
4. **检查数据格式**（如果单元格ID格式不同需要修改）
5. **在 `updateDashboard()` 末尾添加初始化调用**

### 快速移植清单

- [ ] HTML：左右布局容器 + 两个图表容器
- [ ] CSS：滚动条样式 + 布局样式
- [ ] JS：5个函数（initChart, updateChart, 3个交互函数）
- [ ] 调用：在数据更新后调用图表初始化
- [ ] 测试：点击表格月份，检查三重响应

---

## ⚠️ 常见问题

### Q1: 图表不显示？
**检查：**
- DOM 元素 `#trend-chart` 和 `#pie-chart` 是否存在
- 是否在 `updateDashboard()` 后调用
- 控制台是否有错误
- 容器是否有足够的高度

### Q2: 饼图数据为空？
**检查：**
- 表格单元格ID格式是否正确
- 数据是否已填充到表格中
- `itemConfig` 中的 `key` 是否与表格ID匹配

### Q3: 点击表格没有反应？
**检查：**
- 表格单元格是否有 `data-month` 属性
- 事件绑定是否在表格渲染之后
- `updateHeaderSummaryForMonth` 函数是否存在

### Q4: 报错 "Cannot read properties of undefined"？
**原因：** 数据未准备好就初始化图表
**解决：** 使用 `setTimeout` 延迟初始化（200ms）

### Q5: 滚动条样式不生效？
**检查：**
- 是否为 Webkit 内核浏览器（Chrome/Safari）
- CSS 是否正确复制
- 容器是否有滚动内容

---

## 📦 完整示例（v2.0 简化版）

```javascript
layui.use(['laydate', 'layer', 'jquery'], function() {
    const $ = layui.jquery;
    
    let myChart = null;
    let pieChart = null;
    
    // 1. 初始化双图表
    function initChart() {
        const lineDom = document.getElementById('trend-chart');
        const pieDom = document.getElementById('pie-chart');
        if (!lineDom || !pieDom) return false;
        
        myChart = echarts.init(lineDom);
        pieChart = echarts.init(pieDom);
        
        myChart.setOption({ /* 曲线图配置 */ });
        pieChart.setOption({ /* 饼图配置 */ });
        
        window.addEventListener('resize', () => {
            myChart && myChart.resize();
            pieChart && pieChart.resize();
        });
        return true;
    }
    
    // 2. 更新双图表
    function updateChart() {
        if (!myChart || !pieChart) return;
        
        const lineSeries = [], pieData = [];
        itemConfig.forEach(item => {
            // 曲线图数据（单台）
            const lineData = [];
            for (let m = 1; m <= 12; m++) {
                const val = $(`#${item.key}_dantai_m${m}_val`).text().replace(/,/g, '');
                lineData.push(val ? Number(val) : 0);
            }
            lineSeries.push({ name: item.name, type: 'line', data: lineData, smooth: true });
            
            // 饼图数据（总量）
            const total = $(`#${item.key}_dianliang_total`).text().replace(/,/g, '');
            if (total && Number(total) > 0) {
                pieData.push({ name: item.name, value: Number(total) });
            }
        });
        
        myChart.setOption({ series: lineSeries });
        pieChart.setOption({ series: [{ data: pieData }] });
    }
    
    // 3. 表格交互
    $('#data-table').on('click', 'td, th', function() {
        const month = $(this).data('month');
        if (month) {
            // 三重响应
            updateHeaderSummaryForMonth(month);
            updatePieChartForMonth(month);
            showLineChartTooltipForMonth(month);
        }
    });
    
    // 4. 在数据更新后调用
    function updateDashboard(data) {
        // ... 填充表格数据 ...
        
        if (!myChart) {
            setTimeout(() => {
                if (initChart()) updateChart();
            }, 200);
        } else {
            updateChart();
        }
    }
});
```

---

## ✅ 总结 (v2.0)

### 🎯 核心改进
1. **双图表布局**：左侧曲线图 + 右侧饼图，3:2黄金比例
2. **交互增强**：点击表格月份，三重响应（摘要+饼图+tooltip）
3. **UI统一**：美化滚动条，与整体主题一致
4. **代码简化**：移除复选框，直接使用ECharts图例交互

### 📋 移植要点
1. **HTML**：左右布局容器 + 双图表容器
2. **CSS**：布局样式 + 滚动条美化
3. **JS**：5个核心函数
   - `initChart()`：初始化双图表
   - `updateChart()`：更新双图表数据
   - `showLineChartTooltipForMonth()`：显示曲线图tooltip
   - `updatePieChartForMonth()`：更新饼图月度数据
   - 表格点击事件：三重响应联动

### 🚀 优势特点
- **视觉丰富**：两种图表互补展示
- **交互流畅**：一次点击，多重反馈
- **移植简单**：代码模块化，易于复用
- **性能优化**：一次性加载，按需更新

**代码更简洁，功能更强大，移植更方便！** 🎉

