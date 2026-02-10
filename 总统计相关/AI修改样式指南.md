# 能源统计表格样式修改指南

## 概述
本指南用于指导AI如何修改能源统计HTML页面中的表格列配置和样式。这些页面使用Layui框架，具有动态列宽计算和多级表头结构。

## 文件结构说明

### 关键函数位置
所有表格列的配置都在 `getAdaptiveCols()` 函数中，该函数负责：
1. 动态计算可用宽度
2. 定义表格列的显示顺序
3. 计算每列的宽度比例
4. 生成两级表头结构

### 配置数据源
- 数据分类配置来自 `energy-config-v2.js` 文件
- 通过 `pageConfig.categories` 获取所有分类
- 每个分类包含 `key`（唯一标识）和 `title`（显示名称）

---

## 修改步骤详解

### 步骤1：过滤要显示的分类

**位置**：`getAdaptiveCols()` 函数开始部分

**示例**：删除某个分类（如"动力设施课"）

```javascript
// 原代码
const allCategories = pageConfig.categories.filter(cat => cat.key !== 'total');

// 修改后（排除 total 和 power_facility）
const allCategories = pageConfig.categories.filter(cat => 
    cat.key !== 'total' && cat.key !== 'power_facility'
);
```

**常用分类key值**：
- `total` - 合计
- `factory` - 工厂
- `equipment` - 设备
- `auxiliary` - 辅助
- `power_facility` - 动力设施课
- `dev_dept` - 开发本部
- `planning_dept` - 经营企划部
- `quality_dept` - 品质本部
- `sales_dept` - 营业本部

---

### 步骤2：定义列的显示顺序

**位置**：`orderedCategories` 数组定义

**示例**：调整列的显示顺序

```javascript
// 原代码（包含8个分类）
const orderedCategories = [
    allCategories[0], // 工厂
    allCategories[1], // 设备
    allCategories[2], // 辅助
    allCategories[7], // 动力设施课
    allCategories[3], // 开发本部
    allCategories[4], // 经营企划部
    allCategories[5], // 品质本部
    allCategories[6]  // 营业本部
];

// 修改后（删除动力设施课，只保留7个）
const orderedCategories = [
    allCategories[0], // 工厂
    allCategories[1], // 设备
    allCategories[2], // 辅助
    allCategories[3], // 开发本部
    allCategories[4], // 经营企划部
    allCategories[5], // 品质本部
    allCategories[6]  // 营业本部
];
```

**注意事项**：
- 索引基于 `allCategories` 数组（已过滤后的）
- 顺序决定了列在表格中从左到右的显示顺序

---

### 步骤3：调整列宽计算

**位置**：`totalBaseWidth` 计算部分

**目的**：用于计算缩放比例，确保所有列能均匀分配可用空间

**示例**：删除一个分类后调整

```javascript
// 原代码
let totalBaseWidth = 120; // total column（公司总用电量列）
totalBaseWidth += 100 + 80; // 工厂总用电量 + 占比
totalBaseWidth += 100 + 80; // 设备用电量 + 占比
totalBaseWidth += 100 + 80; // 辅助用电量 + 占比
totalBaseWidth += 5 * (100 + 80); // 其他5个部门（每部门2列：用电量+占比）

// 修改后（删除动力设施课，从5个部门变为4个）
let totalBaseWidth = 120; // total column
totalBaseWidth += 100 + 80; // 工厂总用电量 + 占比
totalBaseWidth += 100 + 80; // 设备用电量 + 占比
totalBaseWidth += 100 + 80; // 辅助用电量 + 占比
totalBaseWidth += 4 * (100 + 80); // 其他4个部门
```

**计算规则**：
- 每个"用电量"列基础宽度：100
- 每个"占比"列基础宽度：80
- 总用电量列宽度：120
- 月份列（固定）宽度：80（不计入totalBaseWidth）

---

### 步骤4：修改第一级表头（跨列表头）

**位置**：`finalCols[0]` 数组构建部分

**示例**：调整分组表头

```javascript
// 工厂本部：固定跨6列（工厂+设备+辅助，每个2列）
finalCols[0].push({ title: '工厂本部', colspan: 6, align: 'center' });

// 其他分类：每个跨2列（用电量+占比）
// 原代码：5个部门（包含动力设施课）
for (let i = 3; i < orderedCategories.length; i++) {
    finalCols[0].push({ title: orderedCategories[i].title, colspan: 2, align: 'center' });
}

// 修改后：4个部门（不含动力设施课）
for (let i = 3; i < orderedCategories.length; i++) {
    finalCols[0].push({ title: orderedCategories[i].title, colspan: 2, align: 'center' });
}
// 注：循环逻辑相同，但因为orderedCategories长度变化，实际生成的列数减少
```

---

### 步骤5：修改第二级表头（具体列）

**位置**：`finalCols[1]` 数组构建部分

**示例**：调整具体列定义

```javascript
// 第二级表头包含所有具体的列
// 工厂本部的6列（固定）
finalCols[1].push({ field: '工厂_val', title: '工厂总用电量', align: 'center', width: ... });
finalCols[1].push({ field: '工厂_pct', title: '占比', align: 'center', width: ... });
finalCols[1].push({ field: '设备_val', title: '设备用电量', align: 'center', width: ... });
finalCols[1].push({ field: '设备_pct', title: '占比', align: 'center', width: ... });
finalCols[1].push({ field: '辅助_val', title: '辅助用电量', align: 'center', width: ... });
finalCols[1].push({ field: '辅助_pct', title: '占比', align: 'center', width: ... });

// 其他分类（动态循环生成）
// 原代码注释：动力设施课、开发本部、经营企划部、品质本部、营业本部
// 修改后注释：开发本部、经营企划部、品质本部、营业本部（不含动力设施课）
for (let i = 3; i < orderedCategories.length; i++) {
    const cat = orderedCategories[i];
    finalCols[1].push({
        field: `${cat.title}_val`,
        title: '用电量',
        align: 'center',
        width: Math.max(Math.floor(100 * scale), 55)
    });
    finalCols[1].push({
        field: `${cat.title}_pct`,
        title: '占比',
        align: 'center',
        width: Math.max(Math.floor(80 * scale), 45)
    });
}
```

---

### 步骤6：更新图表显示逻辑

**位置**：`updateCharts()` 函数中的分类过滤

**目的**：确保图表（曲线图和饼图）也排除已删除的分类

```javascript
// 原代码
const allCats = pageConfig.categories.filter(cat => 
    cat.key !== 'total' && cat.key !== 'factory'
);
const orderedChartCategories = [
    allCats.find(c => c.key === 'equipment')?.title,      // 设备
    allCats.find(c => c.key === 'auxiliary')?.title,      // 辅助
    allCats.find(c => c.key === 'power_facility')?.title, // 动力设施课
    allCats.find(c => c.key === 'dev_dept')?.title,       // 开发本部
    // ...
].filter(Boolean);

// 修改后（删除动力设施课）
const allCats = pageConfig.categories.filter(cat => 
    cat.key !== 'total' && cat.key !== 'factory' && cat.key !== 'power_facility'
);
const orderedChartCategories = [
    allCats.find(c => c.key === 'equipment')?.title,      // 设备
    allCats.find(c => c.key === 'auxiliary')?.title,      // 辅助
    allCats.find(c => c.key === 'dev_dept')?.title,       // 开发本部
    // ...（不包含 power_facility）
].filter(Boolean);
```

---

### 步骤7：更新导出功能

**位置**：导出按钮点击事件中的分类过滤

```javascript
// 原代码
const categories = pageConfig.categories
    .filter(cat => cat.key !== 'total')
    .map(cat => cat.title);

// 修改后（排除动力设施课）
const categories = pageConfig.categories
    .filter(cat => cat.key !== 'total' && cat.key !== 'power_facility')
    .map(cat => cat.title);
```

---

## 修改检查清单

完成修改后，请检查以下位置是否都已更新：

- [ ] **步骤1**：`getAdaptiveCols()` 开始的 `allCategories` 过滤
- [ ] **步骤2**：`orderedCategories` 数组定义
- [ ] **步骤3**：`totalBaseWidth` 计算（部门数量）
- [ ] **步骤4**：第一级表头 `finalCols[0]` 的注释
- [ ] **步骤5**：第二级表头 `finalCols[1]` 循环的注释
- [ ] **步骤6**：`updateCharts()` 函数中的两处过滤
  - `allCats` 过滤条件
  - `orderedChartCategories` 数组定义
- [ ] **步骤7**：导出功能中的 `categories` 过滤

---

## 常见修改场景

### 场景1：删除某个部门列

1. 在所有过滤器中添加该部门的key：`cat.key !== 'xxx'`
2. 从 `orderedCategories` 中移除该索引
3. 调整 `totalBaseWidth` 中的部门数量（-1）
4. 更新注释说明

### 场景2：调整列的显示顺序

只需修改 `orderedCategories` 数组中的索引顺序即可

### 场景3：添加新的部门列

1. 确保 `energy-config-v2.js` 中已定义该分类
2. 不在过滤器中排除该分类
3. 在 `orderedCategories` 中添加对应索引
4. 调整 `totalBaseWidth` 中的部门数量（+1）
5. 在图表逻辑中添加该分类

### 场景4：修改列宽比例

调整 `totalBaseWidth` 计算中的基础宽度值：
- 用电量列：默认 100
- 占比列：默认 80
- 总用电量列：默认 120

例如，让占比列更宽：
```javascript
totalBaseWidth += 100 + 100; // 占比列从80改为100
```

---

## 调试技巧

1. **查看控制台日志**：代码中有多处 `console.log`，可以查看分类配置和数据处理过程

2. **检查列数匹配**：
   - 第一级表头的 `colspan` 总和应等于第二级表头的列数
   - 月份列为 `rowspan: 2`，跨越两级表头

3. **宽度计算验证**：
   - `scale = availableWidth / totalBaseWidth`
   - 每列实际宽度 = `Math.max(Math.floor(baseWidth * scale), minWidth)`

4. **数据字段命名规则**：
   - 用电量字段：`${分类名称}_val`
   - 占比字段：`${分类名称}_pct`

---

## 注意事项

1. **保持一致性**：所有相关位置必须同步修改，否则会出现数据不匹配
2. **注释维护**：修改代码后要同步更新注释，便于后续维护
3. **测试验证**：修改后应测试表格显示、图表显示、导出功能是否正常
4. **备份文件**：修改前建议备份原文件

---

## 示例：完整的删除"动力设施课"修改

以下是删除"动力设施课"列的完整修改示例，可作为模板参考：

### 修改点1：过滤分类
```javascript
// 位置：getAdaptiveCols() 函数第462行附近
const allCategories = pageConfig.categories.filter(cat => 
    cat.key !== 'total' && cat.key !== 'power_facility'  // 新增 power_facility 过滤
);
```

### 修改点2：调整顺序
```javascript
// 位置：第468行附近
const orderedCategories = [
    allCategories[0], // 工厂
    allCategories[1], // 设备
    allCategories[2], // 辅助
    // allCategories[7], // 动力设施课 - 删除此行
    allCategories[3], // 开发本部
    allCategories[4], // 经营企划部
    allCategories[5], // 品质本部
    allCategories[6]  // 营业本部
];
```

### 修改点3：列宽计算
```javascript
// 位置：第479行附近
totalBaseWidth += 4 * (100 + 80); // 从5改为4
```

### 修改点4：注释更新
```javascript
// 原注释：其他5个部门
// 新注释：其他4个部门
```

### 修改点5：图表过滤
```javascript
// 位置：updateCharts() 函数第836行附近
const allCats = pageConfig.categories.filter(cat => 
    cat.key !== 'total' && 
    cat.key !== 'factory' && 
    cat.key !== 'power_facility'  // 新增此行
);

const orderedChartCategories = [
    allCats.find(c => c.key === 'equipment')?.title,
    allCats.find(c => c.key === 'auxiliary')?.title,
    // allCats.find(c => c.key === 'power_facility')?.title,  // 删除此行
    allCats.find(c => c.key === 'dev_dept')?.title,
    allCats.find(c => c.key === 'planning_dept')?.title,
    allCats.find(c => c.key === 'quality_dept')?.title,
    allCats.find(c => c.key === 'sales_dept')?.title
].filter(Boolean);
```

### 修改点6：导出过滤
```javascript
// 位置：导出按钮事件第764行附近
const categories = pageConfig.categories
    .filter(cat => cat.key !== 'total' && cat.key !== 'power_facility')  // 新增过滤
    .map(cat => cat.title);
```

---

---

## 数据来源标识（人工录入标红）

### 适用页面
机加工电量及占比统计等需要区分数据来源的页面。

### 功能说明
- **红色文字**：表示数据来源为人工录入
- **正常白色**：表示数据来源为MES系统采集
- **加粗显示**：单台用电数据加粗显示（便于查看）

### 实现步骤

#### 步骤1：添加CSS样式

在 `<style>` 标签中添加样式定义：

```css
/* --- 人工录入数据标红样式 --- */
.manual-input-cell {
    color: #ff4d4f !important; /* 红色 */
}

/* --- 单台数据加粗样式 --- */
.bold-cell {
    font-weight: bold !important;
}
```

#### 步骤2：添加数据来源配置

在JavaScript代码中，`layui.use` 内部、`itemConfig` 定义之前添加配置对象：

```javascript
// ===== 【数据来源配置】 =====
// 配置每个单元的数据来源：true = 人工录入（标红），false = MES采集（正常显示）
// 细化到每个单元的电量和产量
const dataSourceConfig = {
    shizihuan: { electricity: true, production: true },   // 十字环：电量和产量都是人工录入
    quzhou: { electricity: true, production: true },      // 曲轴：电量和产量都是人工录入
    b_zhicheng: { electricity: true, production: true },  // B支撑：电量和产量都是人工录入
    b_ding: { electricity: true, production: true },      // B定：电量和产量都是人工录入
    b_dong: { electricity: true, production: true },      // B动：电量和产量都是人工录入
    c_ding: { electricity: true, production: true },      // C定：电量和产量都是人工录入
    c_dong: { electricity: true, production: true },      // C动：电量和产量都是人工录入
    c_zhicheng: { electricity: true, production: true },  // C支撑：电量和产量都是人工录入
    xin_keti: { electricity: true, production: true }     // 新壳体：电量和产量都是人工录入
};
// 注：根据实际情况，可以将某个单元改为 false（MES采集）
// 例如：shizihuan: { electricity: false, production: false } 表示十字环的电量和产量都是MES采集
// ===== 【配置结束】 =====
```

#### 步骤3：修改数据更新逻辑

在 `updateDashboard()` 函数中，修改清空样式的代码：

```javascript
function updateDashboard(data) {
    // 清空数据和样式类
    $('.data-cell').html('').removeClass('manual-input-cell bold-cell');
    $('#header-summary-text').text('');
    // ... 其他代码
}
```

#### 步骤4：应用样式到月度数据

在月度数据填充的循环中（`for (let m = 1; m <= 12; m++)`），修改数据显示逻辑：

```javascript
groupKeys.forEach(key => {
    const elec_val = mockData.groups[key]?.electricity[m] || 0;
    const prod_val = mockData.groups[key]?.production[m] || 0;
    const per_unit_val = prod_val > 0 ? (elec_val / prod_val) : 0;
    const elec_pct = month_prod_total > 0 ? (elec_val / month_prod_total * 100) : 0;

    // 电量单元格
    const elecValCell = $(`#${key}_dianliang_m${m}_val`);
    const elecPctCell = $(`#${key}_dianliang_m${m}_pct`);
    elecValCell.text(elec_val.toLocaleString());
    elecPctCell.text(elec_pct.toFixed(2) + '%');
    
    // 根据配置标红电量值（人工录入），百分比不标红（计算得出）
    if (dataSourceConfig[key]?.electricity) {
        elecValCell.addClass('manual-input-cell');
    }
    
    // 产量单元格
    const prodCell = $(`#${key}_chanliang_m${m}`);
    prodCell.text(prod_val.toLocaleString());
    
    // 根据配置标红产量（人工录入）
    if (dataSourceConfig[key]?.production) {
        prodCell.addClass('manual-input-cell');
    }
    
    // 单台单元格（加粗）
    const unitCell = $(`#${key}_dantai_m${m}_val`);
    unitCell.text(per_unit_val.toFixed(1));
    unitCell.addClass('bold-cell');
    
    totals[`${key}_elec_total`] += elec_val;
    totals[`${key}_prod_total`] += prod_val;
});
```

#### 步骤5：应用样式到合计列（注意：最右侧合计列不标红）

在合计数据填充的代码中，**不添加标红样式**（因为合计是汇总计算得出）：

```javascript
groupKeys.forEach(key => {
    const total_elec = totals[`${key}_elec_total`];
    const total_prod = totals[`${key}_prod_total`];
    const total_per_unit = total_prod > 0 ? (total_elec / total_prod) : 0;
    const total_elec_pct = totals.prod_total > 0 ? (total_elec / totals.prod_total * 100) : 0;

    // 合计列的电量单元格（合计列不标红，因为是汇总计算得出）
    const totalElecCell = $(`#${key}_dianliang_total`);
    const totalElecPctCell = $(`#${key}_dianliang_total_pct`);
    totalElecCell.text(total_elec.toLocaleString());
    totalElecPctCell.text(total_elec_pct.toFixed(2) + '%');
    
    // 合计列的产量单元格（合计列不标红，因为是汇总计算得出）
    const totalProdCell = $(`#${key}_chanliang_total`);
    totalProdCell.text(total_prod.toLocaleString());
    
    // 合计列的单台单元格（加粗）
    const totalUnitCell = $(`#${key}_dantai_total_val`);
    totalUnitCell.text(total_per_unit.toFixed(1));
    totalUnitCell.addClass('bold-cell');
});
```

**重要说明**：最右侧的"合计"和"占比"列不应用红色样式，因为它们是对各月份数据的汇总计算。

### 重要规则

1. **百分比不标红**：所有百分比（占比）都是计算得出的，不应标红
2. **最右侧合计列不标红**：最右侧的"合计"和"占比"列不标红（因为是汇总计算得出）
3. **顶部汇总行不标红**：以下行不标红（因为是计算得到的）：
   - 合计电量行
   - 辅助合计电量及占比行
   - 生产合计电量及占比行
4. **单台数据加粗**：所有单台用电数据都应加粗显示
5. **灵活配置**：通过修改 `dataSourceConfig` 对象可以灵活控制每个单元的显示样式

**标红总结**：
- ✅ **会标红**：1-12月份的电量值和产量值（根据配置）
- ❌ **不标红**：所有百分比、最右侧合计列、顶部三行汇总数据
- 💪 **加粗**：所有单台用电数据

### 配置示例

```javascript
// 示例1：所有单元都是人工录入
const dataSourceConfig = {
    shizihuan: { electricity: true, production: true },
    quzhou: { electricity: true, production: true },
    // ...
};

// 示例2：十字环改为MES采集，其他仍为人工录入
const dataSourceConfig = {
    shizihuan: { electricity: false, production: false },  // MES采集，不标红
    quzhou: { electricity: true, production: true },       // 人工录入，标红
    // ...
};

// 示例3：电量MES采集，产量人工录入
const dataSourceConfig = {
    shizihuan: { electricity: false, production: true },   // 电量不标红，产量标红
    // ...
};
```

---

## 表格样式优化指南

### 适用页面
电机电量及占比统计、机加工电量及占比统计等类似页面。

### 1. 交错背景色设置

#### 目的
为不同的数据行设置交错的背景色，提高数据可读性。

#### 实现步骤

**步骤1：定义CSS背景色样式**

在 `<style>` 标签中添加背景色定义：

```css
/* 顶部三行的背景色 - 交错显示 */
.table-container .layui-table tr.total-elec-row td:not(.left-header):not(.col-hover) { 
    background-color: #143a6b !important; 
    color: #ffffff !important; 
}
.table-container .layui-table .layui-bg-yellow td:not(.left-header):not(.col-hover) { 
    background-color: #ffff00 !important; 
    color: #000000 !important; 
}
.table-container .layui-table .layui-bg-green td:not(.left-header):not(.col-hover) { 
    background-color: #0f4470 !important; 
    color: #ffffff !important; 
}

/* 数据行交错背景色 */
.table-container .layui-table tr.unit-bg-1 td:not(.left-header):not(.col-hover) { 
    background-color: #1e4e89 !important; 
    color: #ffffff !important; 
}
.table-container .layui-table tr.unit-bg-2 td:not(.left-header):not(.col-hover) { 
    background-color: #143a6b !important; 
    color: #ffffff !important; 
}

/* 所有左侧表头统一背景色 */
.table-container .layui-table tr.total-elec-row td.left-header,
.table-container .layui-table .layui-bg-yellow td.left-header, 
.table-container .layui-table .layui-bg-green td.left-header, 
.table-container .layui-table tr.unit-bg-1 td.left-header, 
.table-container .layui-table tr.unit-bg-2 td.left-header { 
    background-color: #0c6ed3 !important; 
    color: #ffffff !important; 
    font-weight: bold; 
}
```

**步骤2：在表格生成代码中应用样式类**

在JavaScript的 `generateDynamicContent()` 函数中：

```javascript
// 顶部三行
tableBody.html(`
    <tr class="total-elec-row">
        <td colspan="2" class="left-header">合计电量</td>
        ...
    </tr>
    <tr class="layui-bg-yellow">
        <td colspan="2" class="left-header">辅助(检测)合计<br>电量及占比</td>
        ...
    </tr>
    <tr class="layui-bg-green">
        <td colspan="2" class="left-header">生产合计<br>电量及占比</td>
        ...
    </tr>
`);

// 数据行交错背景
itemConfig.forEach((item, index) => {
    const bgClass = index % 2 === 0 ? 'unit-bg-1' : 'unit-bg-2';
    
    let tableRows = `
        <tr class="${bgClass} dynamic-row">
            <td rowspan="3" class="left-header">${item.name}</td>
            <td class="left-header">电量</td>
            ...
        </tr>
        <tr class="${bgClass} dynamic-row">
            <td class="left-header">产量</td>
            ...
        </tr>
        <tr class="${bgClass} dynamic-row">
            <td class="left-header">单台</td>
            ...
        </tr>
    `;
    tableBody.append(tableRows);
});
```

#### 配色方案（统一标准）

| 行类型 | CSS类名 | 背景色 | 文字色 | 说明 |
|--------|---------|--------|--------|------|
| 合计电量 | `total-elec-row` | #143a6b | #ffffff | 深蓝色 |
| 辅助合计 | `layui-bg-yellow` | #ffff00 | #000000 | 荧光黄（黑字）|
| 生产合计 | `layui-bg-green` | #0f4470 | #ffffff | 深蓝绿色 |
| 数据行1（偶数）| `unit-bg-1` | #1e4e89 | #ffffff | 浅蓝色 |
| 数据行2（奇数）| `unit-bg-2` | #143a6b | #ffffff | 深蓝色 |
| 所有左侧表头 | `left-header` | #0c6ed3 | #ffffff | 标题蓝色 |

---

### 2. 鼠标悬停高亮效果

#### 目的
当鼠标悬停在某一列时，整列高亮显示，方便用户查看数据。

#### 关键技巧：使用 `:not(.col-hover)` 排除法

**问题**：如果背景色样式的优先级过高，会覆盖hover效果。

**解决方案**：在所有背景色选择器中添加 `:not(.col-hover)`，让背景色样式排除有hover类的元素。

```css
/* ❌ 错误写法 - hover效果会被覆盖 */
.table-container .layui-table tr.unit-bg-1 td { 
    background-color: #1e4e89 !important; 
}

/* ✅ 正确写法 - 排除hover元素 */
.table-container .layui-table tr.unit-bg-1 td:not(.col-hover) { 
    background-color: #1e4e89 !important; 
}
```

#### 完整的hover样式定义

```css
/* 鼠标悬停效果 - 放在所有背景色样式之后 */
.table-container .layui-table tr th.col-hover,
.table-container .layui-table tr td.col-hover:not(.sticky-col-1) { 
    background-color: rgb(112, 167, 255) !important; 
}

.table-container .layui-table tr .sticky-col-1.col-hover { 
    background-color: #0c6ed3 !important; 
}
```

#### JavaScript事件处理

```javascript
const table = $('#data-table');

// 鼠标悬停时添加高亮类
table.on('mouseover', 'td, th', function() {
    const month = $(this).data('month');
    if (month) {
        table.find('.col-hover').removeClass('col-hover');
        table.find(`[data-month="${month}"]`).addClass('col-hover');
    }
});

// 鼠标移出表格时移除高亮类
table.on('mouseleave', function() {
    table.find('.col-hover').removeClass('col-hover');
});
```

---

### 3. 人工录入数据标识（组装一课等页面特有）

#### 目的
区分人工录入数据和系统计算数据，提高数据可读性和可信度。

#### 实现方式

**步骤1：定义CSS样式**

```css
/* 数据行交错背景色 - 排除人工录入单元格 */
.table-container .layui-table tr.unit-bg-1 td:not(.left-header):not(.col-hover):not(.manual-input) { 
    background-color: #1e4e89 !important; 
    color: #ffffff !important; 
}
.table-container .layui-table tr.unit-bg-2 td:not(.left-header):not(.col-hover):not(.manual-input) { 
    background-color: #143a6b !important; 
    color: #ffffff !important; 
}

/* 人工录入单元格的背景色 - 保持红色文字 */
.table-container .layui-table tr.unit-bg-1 td.manual-input:not(.col-hover) { 
    background-color: #1e4e89 !important; 
    color: #ff0000 !important; 
}
.table-container .layui-table tr.unit-bg-2 td.manual-input:not(.col-hover) { 
    background-color: #143a6b !important; 
    color: #ff0000 !important; 
}

/* 人工录入数据标红 - 最高优先级 */
.table-container .layui-table td.manual-input { 
    color: #ff0000 !important; 
}

/* 鼠标悬停时人工录入数据依然保持红色 */
.table-container .layui-table td.manual-input.col-hover { 
    color: #ff0000 !important; 
}

/* 计算数据加粗显示（如单台用电）*/
.table-container .layui-table td.calculated-bold { 
    font-weight: 900 !important; 
}

/* 单台行左侧表头文字大一号 */
.table-container .layui-table tr.dantai-row td.left-header { 
    font-size: 13px !important; 
}
```

**步骤2：在HTML生成中应用样式类**

```javascript
itemConfig.forEach((item, index) => {
    const bgClass = index % 2 === 0 ? 'unit-bg-1' : 'unit-bg-2';
    
    let tableRows = `
        <tr class="${bgClass} dynamic-row electricity-row">
            <td rowspan="3" class="left-header">${item.name}</td>
            <td class="left-header">电量</td>
            ${Array.from({length: 12}, (_, i) => `
                <td id="${item.key}_dianliang_m${i+1}_val" class="data-cell manual-input" data-month="${i+1}"></td>
                <td id="${item.key}_dianliang_m${i+1}_pct" class="data-cell" data-month="${i+1}"></td>
            `).join('')}
            <td id="${item.key}_dianliang_total" class="data-cell"></td>
            <td id="${item.key}_dianliang_total_pct" class="data-cell"></td>
        </tr>
        <tr class="${bgClass} dynamic-row">
            <td class="left-header">产量</td>
            ${Array.from({length: 12}, (_, i) => `
                <td colspan="2" id="${item.key}_chanliang_m${i+1}" class="data-cell manual-input" data-month="${i+1}"></td>
            `).join('')}
            <td colspan="2" id="${item.key}_chanliang_total" class="data-cell"></td>
        </tr>
        <tr class="${bgClass} dynamic-row dantai-row">
            <td class="left-header">单台</td>
            ${Array.from({length: 12}, (_, i) => `
                <td colspan="2" id="${item.key}_dantai_m${i+1}_val" class="data-cell calculated-bold" data-month="${i+1}"></td>
            `).join('')}
            <td colspan="2" id="${item.key}_dantai_total_val" class="data-cell calculated-bold"></td>
        </tr>
    `;
    tableBody.append(tableRows);
});
```

#### 关键要点

| 数据类型 | 应用位置 | CSS类 | 显示效果 | 说明 |
|---------|---------|-------|---------|------|
| **电量值** | 12个月数据 | `manual-input` | 🔴 红色 | 人工填写 |
| **电量值** | 最右合计/占比 | 无特殊类 | ⚪ 白色 | 系统汇总，不是红色 |
| **产量** | 12个月数据 | `manual-input` | 🔴 红色 | 人工填写 |
| **产量** | 最右合计 | 无特殊类 | ⚪ 白色 | 系统汇总，不是红色 |
| **单台** | 所有数据 | `calculated-bold` | ⚪ 白色加粗 | 系统计算，不是红色 |
| **百分比** | 所有 | 无特殊类 | ⚪ 白色 | 系统计算 |

**⚠️ 重要提醒**：
1. **只对12个月的月度数据应用 `manual-input` 类**，不要对最右边的"合计"和"占比"列应用
2. **单台数据不是人工录入**，使用 `calculated-bold` 类加粗，不使用红色
3. 需要在 `:not()` 选择器中同时排除 `.manual-input`，避免白色文字样式覆盖红色

---

### 4. 删除单台百分比列

#### 目的
简化表格，只显示单台用电值，不显示百分比。

#### 修改步骤

**步骤1：修改表格HTML结构**

```javascript
// 原代码（有百分比）
<td id="${item.key}_dantai_m${i+1}_val"></td>
<td id="${item.key}_dantai_m${i+1}_pct"></td>

// 修改后（无百分比，使用colspan）
<td colspan="2" id="${item.key}_dantai_m${i+1}_val"></td>
```

**步骤2：删除JavaScript中的百分比计算和填充**

```javascript
// 删除这些代码
const per_unit_pct = prod_val > 0 ? (elec_pct / prod_val).toFixed(4) + '%' : '0.0000%';
const unitPctCell = $(`#${key}_dantai_m${m}_pct`);
unitPctCell.text(per_unit_pct);
```

---

### 5. CSS样式优先级管理

#### 核心原则

**优先级从低到高的顺序：**

1. **基础样式**（全局td/th样式）
2. **数据行背景色**（unit-bg-1, unit-bg-2）
3. **特殊行背景色**（total-elec-row, layui-bg-yellow, layui-bg-green）
4. **左侧表头样式**（left-header）
5. **鼠标悬停效果**（col-hover）- 最高优先级

#### CSS书写顺序示例

```css
/* 1. 基础样式 */
.table-container .layui-table td { 
    background-color: #1e4e89 !important; 
}

/* 2. 数据行背景色 */
.table-container .layui-table tr.unit-bg-1 td:not(.left-header):not(.col-hover) { 
    background-color: #1e4e89 !important; 
}

/* 3. 特殊行背景色 */
.table-container .layui-table tr.layui-bg-yellow td:not(.left-header):not(.col-hover) { 
    background-color: #ffff00 !important; 
}

/* 4. 左侧表头（覆盖数据背景色）*/
.table-container .layui-table td.left-header { 
    background-color: #0c6ed3 !important; 
}

/* 5. 鼠标悬停（最高优先级，放在最后）*/
.table-container .layui-table td.col-hover { 
    background-color: rgb(112, 167, 255) !important; 
}
```

#### 关键技巧

1. **使用 `:not()` 排除法**：让低优先级样式不影响高优先级元素
2. **选择器具体化**：增加选择器的具体性来提高优先级
3. **合理使用 `!important`**：确保关键样式不被覆盖
4. **CSS顺序**：高优先级样式放在后面

---

### 6. 机加工页面特殊处理

#### sticky列（固定列）处理

机加工页面使用了sticky定位的固定列，需要特殊处理：

```css
/* 固定列排除 */
.table-container .layui-table tr.unit-bg-1 td:not(.sticky-col-1):not(.sticky-col-2):not(.col-hover) { 
    background-color: #1e4e89 !important; 
}

/* 固定列单独设置 */
.table-container .layui-table tbody .sticky-col-1 { 
    background-color: #0c6ed3 !important; 
}
```

#### 避免unit-bg类冲突

辅助合计行同时有 `layui-bg-yellow` 和 `unit-bg-1` 两个类，需要排除：

```css
/* 排除特殊行，避免被unit-bg样式覆盖 */
.table-container .layui-table tr.unit-bg-1:not(.layui-bg-yellow):not(.layui-bg-green) td { 
    background-color: #1e4e89 !important; 
}
```

---

---

### 7. 人工录入数据与计算数据的区分（重要）

#### 常见页面类型

**A. 电机/机加工页面（数据来自系统）**
- 所有数据都是系统采集，不需要标红
- 只使用交错背景色和左侧表头样式

**B. 组装一课页面（部分人工录入）**
- 电量、产量：人工填写 → 🔴 红色（仅12个月数据，不包括合计）
- 单台：系统计算 → ⚪ 白色加粗
- 百分比、合计列：系统计算 → ⚪ 白色

#### 实现清单

| 需求 | CSS类 | 应用位置 | 效果 |
|------|-------|---------|------|
| 人工录入标红 | `manual-input` | 12个月的电量值、产量 | 红色文字 |
| 计算数据加粗 | `calculated-bold` | 所有单台数据 | 白色超粗（900）|
| 单台行表头放大 | `dantai-row` | 单台行tr | 左侧表头13px |

**⚠️ 关键注意事项**：
1. **合计列不要标红**：只有12个月的人工录入数据才标红，最右边的合计/占比列保持白色
2. **单台不是红色**：单台是计算值，应该加粗而不是标红
3. **排除选择器**：在背景色样式中使用 `:not(.manual-input)` 排除人工录入单元格，避免白色覆盖红色
4. **hover保护**：人工录入数据在鼠标悬停时依然保持红色

---

---

## 8. 动态生成表格的列宽调整（经营企划本部等页面）

### 适用场景
适用于使用JavaScript动态生成表格HTML的页面，如经营企划本部电量占比及统计页面。这类页面有两个表格，第二个表格需要特殊的列宽设置。

### 问题描述
经营企划本部页面有两个表格：
- **第一个表格**：项目电量统计（食堂、机房等）
- **第二个表格**：食堂详细数据（用水、就餐人数等）

第二个表格的前两列文字较长（如"食堂就餐人数 人次"），容易换行，需要加宽。

### 核心问题
1. **CSS样式不生效**：由于表格使用 `table-layout: fixed` 和 `width: 100%`，CSS中设置的列宽会被自动分配覆盖
2. **选择器问题**：`td:nth-child(2)` 在有 `rowSpan` 的表格中会选错元素

### 解决方案

#### 方案1：修改表格布局（推荐）

**步骤1：在CSS中为test1表格设置 `table-layout: auto`**

```css
/* ========== 第二个表格（test1）专属样式 - 最高优先级 ========== */
/* 第二个表格本身 */
#test1 {
    table-layout: auto !important;
    width: auto !important;
}
```

**关键点**：
- `table-layout: auto` 让表格根据内容和设置的宽度自动调整
- `width: auto` 让表格不再填充100%宽度，而是根据列宽自动计算

#### 方案2：在JavaScript中设置内联样式（最可靠）

在 `renderNativeTable2()` 函数中，为每个单元格设置内联样式：

```javascript
function renderNativeTable2(data) {
    const thead = document.getElementById('test1-thead');
    const tbody = document.getElementById('test1-tbody');
    
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // 生成表头 - 单行
    const tr1 = document.createElement('tr');
    const thProject = document.createElement('th');
    thProject.textContent = '食堂';
    thProject.colSpan = 2;
    thProject.style.width = '310px';        // 设置合并表头宽度
    thProject.style.minWidth = '310px';
    tr1.appendChild(thProject);
    
    // 12个月份列
    for (let m = 1; m <= 12; m++) {
        const th = document.createElement('th');
        th.textContent = m + '月份';
        th.dataset.month = m;
        th.style.width = '78px';            // 设置月份列宽度
        th.style.minWidth = '78px';
        tr1.appendChild(th);
    }
    
    // 合计列
    const thSum = document.createElement('th');
    thSum.textContent = '合计';
    thSum.style.width = '78px';
    thSum.style.minWidth = '78px';
    tr1.appendChild(thSum);
    
    thead.appendChild(tr1);
    
    // 生成数据行
    data.forEach((row, idx) => {
        const tr = document.createElement('tr');
        const bgClass = idx % 2 === 0 ? 'unit-bg-1' : 'unit-bg-2';
        tr.className = bgClass;
        
        if (row.place !== lastPlace) {
            const tdPlace = document.createElement('td');
            tdPlace.textContent = row.place || '';
            tdPlace.className = 'left-header';
            tdPlace.rowSpan = placeRowSpan;
            tdPlace.style.width = '80px';          // 设置第一列宽度
            tdPlace.style.minWidth = '80px';
            tr.appendChild(tdPlace);
        }
        
        // 项目名称 + 单位列
        const tdName = document.createElement('td');
        // ... 设置内容 ...
        tdName.className = 'left-header';
        tdName.style.width = '230px';              // 设置第二列宽度
        tdName.style.minWidth = '230px';
        tr.appendChild(tdName);
        
        // 12个月的数据列
        for (let m = 1; m <= 12; m++) {
            const tdValue = document.createElement('td');
            // ... 设置内容 ...
            tdValue.style.width = '78px';          // 设置月份数据列宽度
            tdValue.style.minWidth = '78px';
            tr.appendChild(tdValue);
        }
        
        // 合计列
        const tdSum = document.createElement('td');
        // ... 设置内容 ...
        tdSum.style.width = '78px';
        tdSum.style.minWidth = '78px';
        tr.appendChild(tdSum);
        
        tbody.appendChild(tr);
    });
}
```

### 推荐的列宽配置

| 列类型 | 宽度 | 说明 |
|--------|------|------|
| 第一列（食堂） | 80px | 文字较短，不需要太宽 |
| 第二列（项目名称+单位） | 230px | 需要显示"食堂就餐人数 人次"等长文字 |
| 月份数据列（12列） | 78px | 显示5-6位数字 |
| 合计列 | 78px | 与月份列一致 |

**总宽度**：80 + 230 + (78 × 13) = 310 + 1014 = **1324px**

### 重要提醒：人工录入数据标识

在食堂详细数据表格中，只有**月度数据**需要标红（如果是人工录入）：

✅ **需要标红**：
- 12个月份的"食堂用水"和"食堂就餐人数"数据

❌ **不要标红**：
- 表头行（"食堂"这一行）
- 最右侧的"合计"列
- 所有计算得出的数据（如"每人次用水"、"每人次用电"等）

```javascript
// 配置哪些项目是人工录入
const manualInputItems = ['食堂用水', '食堂就餐人数'];

// 在生成数据行时，只对月份数据添加 manual-input 类
for (let m = 1; m <= 12; m++) {
    const tdValue = document.createElement('td');
    const value = row['month' + m + '_value'];
    tdValue.textContent = value != null ? (Number.isInteger(value) ? value : value.toFixed(2)) : '';
    tdValue.dataset.month = m;
    
    // 只对人工录入的项目标红（食堂用水、食堂就餐人数）
    if (isManualInput) {
        tdValue.className = 'manual-input';
    }
    tr.appendChild(tdValue);
}

// 合计列不要添加 manual-input 类
const tdSum = document.createElement('td');
const sumValue = row.sum_value;
tdSum.textContent = sumValue != null ? (Number.isInteger(sumValue) ? sumValue : sumValue.toFixed(2)) : '';
tdSum.style.width = '78px';
tdSum.style.minWidth = '78px';
// 注意：这里不添加 manual-input 类，因为合计是计算得出的
tr.appendChild(tdSum);
```

### 为什么CSS样式会失效

#### 原因1：table-layout: fixed 的限制

```css
table {
    width: 100%;
    table-layout: fixed;  /* 这会导致列宽被均匀分配 */
}
```

当表格使用 `table-layout: fixed` 时：
- 表格会均匀分配所有列的宽度
- 即使设置了 `width`，也可能被覆盖
- 需要设置 `table-layout: auto` 才能使用自定义列宽

#### 原因2：nth-child 选择器在 rowspan 表格中的陷阱

**核心问题**：当表格使用 `rowspan` 时，CSS的 `:nth-child()` 选择器会基于DOM结构而不是视觉位置，导致选中错误的列。

**问题场景**：
```html
<!-- 第一行：有第一列 -->
<tr>
    <td rowspan="5">组装</td>  <!-- DOM第1列，视觉第1列 -->
    <td>组装合计</td>           <!-- DOM第2列，视觉第2列 -->
    <td>一月份数据</td>         <!-- DOM第3列，视觉第3列 -->
</tr>

<!-- 第二行：第一列被rowspan覆盖 -->
<tr>
    <!-- 第一列不存在（被rowspan覆盖） -->
    <td>1#柜</td>              <!-- DOM第1列，但视觉上是第2列！ -->
    <td>一月份数据</td>         <!-- DOM第2列，但视觉上是第3列！ -->
</tr>
```

**CSS选择器的错误行为**：
```css
/* ❌ 错误：会选中不同的列 */
td:nth-child(2) {
    width: 150px;
}
/* 第一行：选中"组装合计"（正确） */
/* 第二行：选中"一月份数据"（错误！） */
```

**问题根源**：
- `nth-child()` 基于DOM树中的位置
- `rowspan` 使某些行缺少前面的列
- 导致后面列的 DOM位置前移

**典型错误现象**：
- 想加宽"项目名称"列，结果"一月份"列变宽了
- 设置第二列样式，结果影响到数据列
- 列宽设置完全不生效或作用到错误位置

---

#### 解决方案：使用类名选择器代替位置选择器

**方案1：为每一列添加专用类名**

```javascript
// 在JavaScript中生成单元格时添加类名
function createDataRow(category, name, key) {
    const tr = document.createElement('tr');
    
    // 第一列：大分类
    if (category) {
        const tdCategory = document.createElement('td');
        tdCategory.className = 'category-cell';  // 专用类名
        tdCategory.textContent = category;
        tdCategory.style.width = '50px';
        tdCategory.style.minWidth = '50px';
        tr.appendChild(tdCategory);
    }
    
    // 第二列：项目名称
    const tdName = document.createElement('td');
    tdName.className = 'project-name-cell';  // 专用类名
    tdName.textContent = name;
    tdName.style.width = '150px';
    tdName.style.minWidth = '150px';
    tdName.style.whiteSpace = 'nowrap';
    tr.appendChild(tdName);
    
    // 数据列
    for (let m = 1; m <= 12; m++) {
        const tdData = document.createElement('td');
        tdData.className = 'data-cell';  // 专用类名
        tdData.style.width = '65px';
        tdData.style.minWidth = '65px';
        tr.appendChild(tdData);
    }
    
    return tr;
}
```

**方案2：CSS中使用类名选择器**

```css
/* ✅ 正确：使用类名，不受rowspan影响 */
td.category-cell {
    width: 50px !important;
    min-width: 50px !important;
}

td.project-name-cell {
    width: 150px !important;
    min-width: 150px !important;
    white-space: nowrap !important;
}

td.data-cell {
    width: 65px !important;
    min-width: 65px !important;
}
```

**方案3：内联样式（最可靠，优先级最高）**

```javascript
// 直接在JavaScript中设置内联样式
const tdName = document.createElement('td');
tdName.className = 'project-name-cell';
// 内联样式优先级最高，100%生效
tdName.style.width = '150px';
tdName.style.minWidth = '150px';
tdName.style.whiteSpace = 'nowrap';
```

---

#### 完整的类名体系建议

为表格建立清晰的列类型体系：

| 列类型 | 类名 | 用途 | 宽度建议 |
|--------|------|------|----------|
| 大分类列 | `category-cell` | 组装、成品等 | 50px |
| 项目名称列 | `project-name-cell` | 组装合计、1#柜等 | 120-150px |
| 数据列 | `data-cell` | 月份数据、合计、占比 | 65-78px |
| 左侧表头 | `left-header` | 所有非数据列 | 不固定 |

---

#### 特殊情况：跨列单元格（colspan）

当单元格跨多列时，宽度应为所有列宽之和：

```javascript
// "辅助合计"跨2列（大分类 + 项目名称）
if (name === '辅助合计' || name === '生产合计') {
    tdName.setAttribute('colspan', '2');
    tdName.style.width = '200px';  // 50px + 150px
    tdName.style.minWidth = '200px';
} else {
    tdName.style.width = '150px';
    tdName.style.minWidth = '150px';
}
```

---

#### 避免使用的选择器（在rowspan表格中）

❌ **禁止使用**：
- `td:first-child` - 会选中不同列
- `td:nth-child(2)` - 会选中不同列  
- `td:nth-child(n)` - 所有基于位置的选择器都不可靠
- `th:not(:first-child)` - 在rowspan情况下不可靠

✅ **推荐使用**：
- `td.class-name` - 类名选择器（推荐）
- `td[id^="prefix"]` - 属性选择器
- `element.style.property` - 内联样式（最可靠）

---

#### 调试技巧

如果列宽设置不生效或应用到错误的列：

1. **检查是否有rowspan**：查看表格HTML结构
2. **检查CSS选择器**：是否使用了 `:nth-child()`
3. **检查table-layout**：是否设置为 `fixed`
4. **使用开发者工具**：查看实际应用的样式和选择器
5. **改用类名**：将所有基于位置的选择器改为类名选择器
6. **添加内联样式**：作为最后的保险措施

---

#### 真实案例

**问题**：想加宽第二列（项目名称），结果一月份的数据列变宽了

```css
/* ❌ 错误的CSS */
td:nth-child(2) {
    width: 150px;  /* 这会应用到不同的列！ */
}
```

**解决过程**：
1. 识别问题：表格有rowspan，导致nth-child选择错误
2. 改用类名：为项目名称列添加 `project-name-cell` 类
3. CSS改写：使用 `td.project-name-cell` 选择器
4. 添加内联样式：确保100%生效

```css
/* ✅ 正确的CSS */
td.project-name-cell {
    width: 150px !important;
    min-width: 150px !important;
}
```

```javascript
// ✅ JavaScript中添加类名和内联样式
const tdName = document.createElement('td');
tdName.className = 'project-name-cell';
tdName.style.width = '150px';
tdName.style.minWidth = '150px';
```

---

#### 食堂详细数据表格示例

```html
<!-- 示例表格结构 -->
<tr>
    <td rowspan="5" class="category-cell">食堂</td>
    <td class="project-name-cell">食堂用水 吨</td>
    <td>食堂就餐人数 人次</td>   <!-- 这是第1个td！不是第2个 -->
    <td>数据2</td>              <!-- 这是第2个td！ -->
</tr>
```

**问题**：
```css
#test1 td:nth-child(2) {
    width: 180px;  /* 这会选中第二行的"数据2"单元格，而不是"食堂就餐人数"！*/
}
```

**解决方案**：使用类选择器而不是 nth-child
```css
#test1 td.left-header {
    width: 180px;  /* 正确选中所有项目名称列 */
}
```

### 调试技巧

1. **使用浏览器开发者工具**：
   - 检查元素，查看实际应用的样式
   - 查看是否有其他样式覆盖
   - 验证 `table-layout` 属性

2. **检查选择器是否选中正确元素**：
   ```javascript
   // 在控制台测试选择器
   console.log($('#test1 td.left-header').length);  // 应该输出正确的列数
   ```

3. **验证内联样式是否生效**：
   ```javascript
   // 查看元素的 style 属性
   const td = document.querySelector('#test1 td.left-header');
   console.log(td.style.width);  // 应该输出 "230px"
   ```

### 常见错误

❌ **错误1：只修改CSS，不修改table-layout**
```css
#test1 td.left-header {
    width: 200px !important;  /* 无效，因为table-layout: fixed */
}
```

✅ **正确1：同时修改table-layout**
```css
#test1 {
    table-layout: auto !important;
}
#test1 td.left-header {
    width: 200px !important;
}
```

❌ **错误2：使用nth-child选择器**
```css
#test1 td:nth-child(2) {
    width: 200px;  /* 会选错元素 */
}
```

✅ **正确2：使用类选择器**
```css
#test1 td.left-header {
    width: 200px;
}
```

❌ **错误3：只设置表头，不设置数据单元格**
```javascript
// 只设置表头宽度
thProject.style.width = '310px';
// 忘记设置数据单元格宽度
tdPlace.style.width = '80px';  // 这行被忘记了！
```

✅ **正确3：表头和数据单元格都要设置**
```javascript
// 表头
thProject.style.width = '310px';
// 数据单元格
tdPlace.style.width = '80px';
tdName.style.width = '230px';
```

---

## 总结

修改这类表格样式的核心原则是：
1. **统一过滤**：在所有使用分类的地方保持过滤逻辑一致
2. **顺序对应**：表头顺序、数据顺序、图表顺序保持一致
3. **宽度平衡**：调整列数后重新计算基础宽度，让系统自动均分
4. **全面测试**：表格、图表、导出功能都要验证
5. **数据来源标识**：
   - 人工录入：红色文字（`manual-input`）
   - 计算数据：白色加粗（`calculated-bold`）
   - **仅对月度数据应用，合计列保持白色**
6. **样式优先级管理**：使用 `:not()` 排除法和合理的CSS顺序确保样式正确应用
7. **hover效果保护**：所有背景色样式都要排除 `.col-hover` 类，人工录入数据要保持红色
8. **动态表格列宽调整**：
   - 优先使用 `table-layout: auto` + CSS样式
   - 必要时使用JavaScript内联样式（最可靠）
   - 避免使用 `nth-child` 选择器（在有rowSpan时会出错）
   - 表头和数据单元格的宽度要同步设置

按照本指南的步骤操作，可以安全、准确地完成表格列的增删改操作和样式优化。

