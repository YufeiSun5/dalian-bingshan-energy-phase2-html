# ECharts 月度电量趋势图集成指南

## 📋 功能说明
在电量统计表格下方添加一个折线图，展示各单元每月电量趋势。
- 支持多条曲线同时显示
- 复选框控制曲线显示/隐藏
- 自动标注最高值和最低值
- Y轴自动缩放

---

## 🔧 集成步骤

### 步骤1：引入 ECharts 库

在 `<head>` 部分添加：

```html
<script src="../js/echarts.js"></script>
```

---

### 步骤2：添加 HTML 结构

在表格卡片下方添加图表卡片：

```html
<!-- 表格卡片 -->
<div class="card-block table-card">
    <div class="card-header">
        <span class="card-title">机加工各单元月度电量统计表</span>
        <!-- 表格内容 -->
    </div>
</div>

<!-- 图表卡片（新增） -->
<div class="card-block chart-card">
    <div class="card-header">
        <span class="card-title">月度电量趋势图</span>
        <div class="chart-toolbar">
            <span style="margin-right: 10px;">选择单元：</span>
            <div id="unit-checkboxes" style="display: flex; gap: 15px;"></div>
        </div>
    </div>
    <div class="chart-container">
        <div id="trend-chart" style="width: 100%; height: 100%;"></div>
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
    height: 400px;
    padding: 15px;
}

/* 图表工具栏 */
.chart-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.chart-toolbar label {
    margin: 0;
}
```

---

### 步骤4：JavaScript 核心代码

在 `layui.use()` 内部添加以下代码：

#### 4.1 全局变量

```javascript
let myChart = null;  // 图表实例
```

#### 4.2 初始化图表函数

```javascript
// 初始化图表
function initChart() {
    const dom = document.getElementById('trend-chart');
    if (!dom) return false;
    
    myChart = echarts.init(dom);
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
            name: '电量(kWh)',
            nameTextStyle: { color: '#d0d2e0' },
            axisLine: { lineStyle: { color: '#2a6dc8' } },
            axisLabel: { color: '#d0d2e0' },
            splitLine: { lineStyle: { color: '#2a6dc8', opacity: 0.3 } }
        },
        series: []
    });
    
    window.addEventListener('resize', () => myChart && myChart.resize());
    return true;
}
```

#### 4.3 生成复选框函数

```javascript
// 生成复选框
function generateUnitCheckboxes() {
    const html = itemConfig.map((item, i) => 
        `<div><input type="checkbox" name="unit" value="${item.key}" title="${item.name}" 
         lay-skin="primary" lay-filter="unit-filter" ${i < 3 ? 'checked' : ''}></div>`
    ).join('');
    
    $('#unit-checkboxes').html(html);
    form.render('checkbox');
    
    // 复选框触发图例点击
    form.on('checkbox(unit-filter)', function(data) {
        const item = itemConfig.find(i => i.key === data.value);
        if (item && myChart) {
            myChart.dispatchAction({ type: 'legendToggleSelect', name: item.name });
        }
    });
}
```

**说明：**
- `itemConfig` 是已存在的配置数组，包含 `key` 和 `name` 字段
- 默认勾选前3个单元
- 复选框操作直接触发 ECharts 的图例切换事件

#### 4.4 更新图表函数

```javascript
// 更新图表
function updateChart() {
    if (!myChart) return;
    
    const series = [];
    const legends = [];
    const selected = {};
    
    itemConfig.forEach((item, index) => {
        // 读取12个月数据
        const data = [];
        for (let m = 1; m <= 12; m++) {
            const val = $(`#${item.key}_dianliang_m${m}_val`).text().replace(/,/g, '');
            data.push(val ? Number(val) : 0);
        }
        
        // 添加系列
        series.push({
            name: item.name,
            type: 'line',
            data: data,
            smooth: true,
            markPoint: {
                data: [{ type: 'max', name: '最高' }, { type: 'min', name: '最低' }]
            }
        });
        
        legends.push(item.name);
        selected[item.name] = index < 3; // 默认显示前3个
    });
    
    myChart.setOption({
        legend: { data: legends, selected: selected },
        series: series
    });
}
```

**说明：**
- 从表格单元格中读取数据（格式：`#单元key_dianliang_m月份_val`）
- 一次性加载所有单元数据
- 使用 `selected` 控制默认显示前3个

#### 4.5 在数据更新后调用

在 `updateDashboard()` 函数的**末尾**添加：

```javascript
function updateDashboard(data) {
    // ... 原有的表格数据填充代码 ...
    
    // 初始化图表（仅首次）
    if (!myChart) {
        setTimeout(() => {
            if (initChart()) {
                generateUnitCheckboxes();
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
从表格读取数据 → 渲染图表
  ↓
生成复选框（默认勾选前3个）
```

### 交互逻辑

```
用户点击复选框
  ↓
触发 Layui checkbox 事件
  ↓
调用 myChart.dispatchAction()
  ↓
触发 ECharts 图例切换
  ↓
图表显示/隐藏对应曲线
```

---

## 📝 关键点说明

### 1. 数据来源
从表格单元格读取数据，格式：
```javascript
$(`#${item.key}_dianliang_m${m}_val`)
```
其中：
- `item.key`：单元标识（如 `shizihuan`）
- `m`：月份（1-12）

### 2. 为什么不用动态添加/删除 series？
```javascript
// ❌ 复杂方案：根据复选框动态修改 series
selectedUnits.forEach(key => {
    series.push(...)  // 需要维护选中状态
});

// ✅ 简单方案：一次性加载所有，用图例控制显示
itemConfig.forEach((item, index) => {
    series.push(...)  // 全部加载
    selected[item.name] = index < 3;  // 图例控制显示
});
```

**优势：**
- 只调用一次 `setOption`，性能更好
- 避免坐标系重绘错误
- 代码更简洁易维护

### 3. 复选框与图例联动
```javascript
// 复选框点击 → 触发图例点击
myChart.dispatchAction({ 
    type: 'legendToggleSelect',  // 图例切换事件
    name: item.name              // 对应系列名称
});
```

---

## 🔄 移植到其他页面

### 前置条件检查

1. **是否有 `itemConfig` 数组？**
   - 包含 `key` 和 `name` 字段
   
2. **表格单元格 ID 格式是否一致？**
   - 格式：`${key}_dianliang_m${month}_val`

3. **是否使用 Layui？**
   - 需要 `form.render()` 和 `form.on()`

### 移植步骤

1. 复制 HTML 结构（步骤2）
2. 复制 CSS 样式（步骤3）
3. 复制 JavaScript 代码（步骤4）
4. 修改数据读取逻辑（如果单元格ID格式不同）
5. 在 `updateDashboard()` 末尾添加初始化调用

---

## ⚠️ 常见问题

### Q1: 图表不显示？
**检查：**
- DOM 元素 `#trend-chart` 是否存在
- 是否在 `updateDashboard()` 后调用
- 控制台是否有错误

### Q2: Y轴不自动缩放？
**答：** `yAxis: { type: 'value' }` 会自动缩放，无需特殊配置

### Q3: 复选框不生效？
**检查：**
- `lay-filter="unit-filter"` 是否正确
- `form.on('checkbox(unit-filter)', ...)` 是否调用
- `itemConfig` 中的 `key` 与表格单元格ID是否匹配

### Q4: 报错 "Cannot read properties of undefined (reading 'get')"？
**原因：** 数据未准备好就初始化图表
**解决：** 使用 `setTimeout` 延迟初始化（200ms）

---

## 📦 完整示例（简化版）

```javascript
layui.use(['form', 'laydate', 'layer', 'jquery'], function() {
    const form = layui.form;
    const $ = layui.jquery;
    
    let myChart = null;
    
    // 1. 初始化图表
    function initChart() {
        const dom = document.getElementById('trend-chart');
        if (!dom) return false;
        myChart = echarts.init(dom);
        myChart.setOption({ /* 配置 */ });
        window.addEventListener('resize', () => myChart && myChart.resize());
        return true;
    }
    
    // 2. 生成复选框
    function generateUnitCheckboxes() {
        const html = itemConfig.map((item, i) => 
            `<input type="checkbox" value="${item.key}" title="${item.name}" 
             lay-filter="unit-filter" ${i < 3 ? 'checked' : ''}>`
        ).join('');
        $('#unit-checkboxes').html(html);
        form.render('checkbox');
        form.on('checkbox(unit-filter)', function(data) {
            const item = itemConfig.find(i => i.key === data.value);
            if (item && myChart) {
                myChart.dispatchAction({ type: 'legendToggleSelect', name: item.name });
            }
        });
    }
    
    // 3. 更新图表
    function updateChart() {
        if (!myChart) return;
        const series = [], legends = [], selected = {};
        itemConfig.forEach((item, index) => {
            const data = [];
            for (let m = 1; m <= 12; m++) {
                const val = $(`#${item.key}_dianliang_m${m}_val`).text().replace(/,/g, '');
                data.push(val ? Number(val) : 0);
            }
            series.push({ name: item.name, type: 'line', data, smooth: true, 
                markPoint: { data: [{ type: 'max' }, { type: 'min' }] } });
            legends.push(item.name);
            selected[item.name] = index < 3;
        });
        myChart.setOption({ legend: { data: legends, selected }, series });
    }
    
    // 4. 在数据更新后调用
    function updateDashboard(data) {
        // ... 填充表格数据 ...
        
        if (!myChart) {
            setTimeout(() => {
                if (initChart()) {
                    generateUnitCheckboxes();
                    updateChart();
                }
            }, 200);
        } else {
            updateChart();
        }
    }
});
```

---

## ✅ 总结

1. **HTML**：添加图表容器和复选框容器
2. **CSS**：设置卡片和图表高度
3. **JS**：三个核心函数 + 一次调用
   - `initChart()`：初始化图表（仅一次）
   - `generateUnitCheckboxes()`：生成复选框
   - `updateChart()`：更新图表数据
4. **核心思路**：加载所有数据，用图例控制显示

代码简洁，逻辑清晰，易于移植！

