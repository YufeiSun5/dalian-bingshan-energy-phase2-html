// ================================
// 能源系统管理工具 - 纯工具类
// 数据存储在 energy-data.json
// ================================

class EnergyManager {
  constructor() {
    this.data = null;
    this.indexes = {
      byNo: {},
      bySymbol: {},
      byName: {},
      byPlace: {},
      byDepartment: {},
      byCategory: {},
      byUnit: {}
    };
  }

  // ==================== 初始化 ====================
  
  /**
   * 加载数据（从全局 EnergyData 对象）
   * @returns {Object} 数据对象
   */
  loadData() {
    if (typeof EnergyData === 'undefined') {
      console.error('✗ 未找到 EnergyData，请确保已引入 energy-data.js');
      throw new Error('EnergyData is not defined');
    }
    this.data = EnergyData;
    this.buildIndexes();
    console.log('✓ 能源数据加载完成');
    console.log(`  - 电表总数: ${this.data.meters.length}`);
    console.log(`  - 部门数量: ${Object.keys(this.data.departments).length}`);
    return this.data;
  }

  /**
   * 直接设置数据（用于传入已加载的数据）
   * @param {Object} data - 能源数据对象
   */
  setData(data) {
    this.data = data;
    this.buildIndexes();
  }

  /**
   * 构建索引
   */
  buildIndexes() {
    // 重置索引
    this.indexes = {
      byNo: {},
      bySymbol: {},
      byName: {},
      byPlace: {},
      byDepartment: {},
      byCategory: {},
      byUnit: {}
    };

    this.data.meters.forEach(meter => {
      // 按 no 索引
      if (meter.no !== null) {
        this.indexes.byNo[meter.no] = meter;
      }
      
      // 按 symbol 索引
      this.indexes.bySymbol[meter.symbol] = meter;
      
      // 按名称索引
      this.indexes.byName[meter.name] = meter;
      
      // 按地点索引
      if (!this.indexes.byPlace[meter.place]) {
        this.indexes.byPlace[meter.place] = [];
      }
      this.indexes.byPlace[meter.place].push(meter);
      
      // 按部门索引
      if (meter.department) {
        if (!this.indexes.byDepartment[meter.department]) {
          this.indexes.byDepartment[meter.department] = [];
        }
        this.indexes.byDepartment[meter.department].push(meter);
      }
      
      // 按分类索引
      if (meter.category) {
        if (!this.indexes.byCategory[meter.category]) {
          this.indexes.byCategory[meter.category] = [];
        }
        this.indexes.byCategory[meter.category].push(meter);
      }
      
      // 按单元索引
      if (meter.unit) {
        if (!this.indexes.byUnit[meter.unit]) {
          this.indexes.byUnit[meter.unit] = [];
        }
        this.indexes.byUnit[meter.unit].push(meter);
      }
    });
  }

  // ==================== 电表查询方法 ====================
  
  /**
   * 根据 no 获取电表
   */
  getMeterByNo(no) {
    return this.indexes.byNo[no] || null;
  }

  /**
   * 根据 symbol 获取电表
   */
  getMeterBySymbol(symbol) {
    return this.indexes.bySymbol[symbol] || null;
  }

  /**
   * 根据名称获取电表
   */
  getMeterByName(name) {
    return this.indexes.byName[name] || null;
  }

  /**
   * 根据地点获取所有电表
   */
  getMetersByPlace(place) {
    return this.indexes.byPlace[place] || [];
  }

  /**
   * 获取所有电表
   */
  getAllMeters() {
    return this.data.meters;
  }

  /**
   * 搜索电表（支持模糊搜索）
   */
  searchMeters(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.data.meters.filter(m => 
      m.no?.toString().includes(lowerKeyword) ||
      m.symbol?.toLowerCase().includes(lowerKeyword) ||
      m.name?.toLowerCase().includes(lowerKeyword) ||
      m.place?.toLowerCase().includes(lowerKeyword)
    );
  }

  // ==================== 电表增删改 ====================
  
  /**
   * 添加电表
   */
  addMeter(meter) {
    // 验证必填字段
    if (!meter.symbol) {
      throw new Error('symbol 是必填字段');
    }
    
    // 检查 symbol 是否已存在
    if (this.indexes.bySymbol[meter.symbol]) {
      throw new Error(`symbol ${meter.symbol} 已存在`);
    }
    
    // 生成新 id
    const maxId = Math.max(...this.data.meters.map(m => m.id || 0));
    meter.id = maxId + 1;
    
    this.data.meters.push(meter);
    this.buildIndexes();
    return meter;
  }

  /**
   * 更新电表
   */
  updateMeter(symbol, updates) {
    const meter = this.getMeterBySymbol(symbol);
    if (!meter) {
      throw new Error(`找不到 symbol: ${symbol}`);
    }
    
    Object.assign(meter, updates);
    this.buildIndexes();
    return meter;
  }

  /**
   * 删除电表
   */
  deleteMeter(symbol) {
    const index = this.data.meters.findIndex(m => m.symbol === symbol);
    if (index === -1) {
      throw new Error(`找不到 symbol: ${symbol}`);
    }
    
    const deleted = this.data.meters.splice(index, 1)[0];
    this.buildIndexes();
    return deleted;
  }

  // ==================== 部门查询方法 ====================
  
  /**
   * 获取所有部门
   */
  getAllDepartments() {
    return this.data.departments;
  }

  /**
   * 获取部门
   */
  getDepartment(deptName) {
    return this.data.departments[deptName] || null;
  }

  /**
   * 获取部门的分类
   */
  getDepartmentCategory(deptName, categoryName) {
    const dept = this.getDepartment(deptName);
    return dept?.categories[categoryName] || null;
  }

  /**
   * 获取部门某个分类的所有 symbol
   */
  getDepartmentCategorySymbols(deptName, categoryName) {
    const dept = this.getDepartment(deptName);
    if (!dept || !dept.categories[categoryName]) return [];
    
    const category = dept.categories[categoryName];
    const allSymbols = [];
    
    // 收集 units 中的 symbols
    if (category.units) {
      for (let unitName in category.units) {
        const unit = category.units[unitName];
        if (unit.symbols) {
          allSymbols.push(...unit.symbols);
        }
      }
    }
    
    // 收集 equipments 中的 symbols
    if (category.equipments) {
      for (let eqName in category.equipments) {
        const equipment = category.equipments[eqName];
        if (equipment.symbols) {
          allSymbols.push(...equipment.symbols);
        }
      }
    }
    
    // 收集 category 直接的 symbols
    if (category.symbols) {
      allSymbols.push(...category.symbols);
    }
    
    return [...new Set(allSymbols)]; // 去重
  }

  /**
   * 获取部门某个分类的所有 no
   */
  getDepartmentCategoryNos(deptName, categoryName) {
    const symbols = this.getDepartmentCategorySymbols(deptName, categoryName);
    return symbols.map(symbol => {
      const meter = this.getMeterBySymbol(symbol);
      return meter?.no;
    }).filter(no => no !== null && no !== undefined);
  }

  /**
   * 获取部门所有的 symbols
   */
  getDepartmentAllSymbols(deptName) {
    const dept = this.getDepartment(deptName);
    if (!dept) return [];
    
    const allSymbols = [];
    for (let catName in dept.categories) {
      allSymbols.push(...this.getDepartmentCategorySymbols(deptName, catName));
    }
    
    return [...new Set(allSymbols)]; // 去重
  }

  /**
   * 获取部门所有的 no
   */
  getDepartmentAllNos(deptName) {
    const symbols = this.getDepartmentAllSymbols(deptName);
    return symbols.map(symbol => {
      const meter = this.getMeterBySymbol(symbol);
      return meter?.no;
    }).filter(no => no !== null && no !== undefined);
  }

  /**
   * 获取单元/设备的 symbols
   */
  getUnitSymbols(deptName, categoryName, unitOrEqName) {
    const category = this.getDepartmentCategory(deptName, categoryName);
    if (!category) return [];
    
    // 查找 unit
    if (category.units && category.units[unitOrEqName]) {
      return category.units[unitOrEqName].symbols || [];
    }
    
    // 查找 equipment
    if (category.equipments && category.equipments[unitOrEqName]) {
      return category.equipments[unitOrEqName].symbols || [];
    }
    
    return [];
  }

  /**
   * 获取单元/设备的 no
   */
  getUnitNos(deptName, categoryName, unitOrEqName) {
    const symbols = this.getUnitSymbols(deptName, categoryName, unitOrEqName);
    return symbols.map(symbol => {
      const meter = this.getMeterBySymbol(symbol);
      return meter?.no;
    }).filter(no => no !== null && no !== undefined);
  }

  // ==================== 部门增删改 ====================
  
  /**
   * 添加部门
   */
  addDepartment(deptName, deptData) {
    if (this.data.departments[deptName]) {
      throw new Error(`部门 ${deptName} 已存在`);
    }
    
    this.data.departments[deptName] = deptData;
    return deptData;
  }

  /**
   * 删除部门
   */
  deleteDepartment(deptName) {
    if (!this.data.departments[deptName]) {
      throw new Error(`部门 ${deptName} 不存在`);
    }
    
    const deleted = this.data.departments[deptName];
    delete this.data.departments[deptName];
    return deleted;
  }

  /**
   * 添加分类
   */
  addCategory(deptName, categoryName, categoryData) {
    const dept = this.getDepartment(deptName);
    if (!dept) {
      throw new Error(`部门 ${deptName} 不存在`);
    }
    
    if (dept.categories[categoryName]) {
      throw new Error(`分类 ${categoryName} 已存在`);
    }
    
    dept.categories[categoryName] = categoryData;
    return categoryData;
  }

  /**
   * 删除分类
   */
  deleteCategory(deptName, categoryName) {
    const dept = this.getDepartment(deptName);
    if (!dept || !dept.categories[categoryName]) {
      throw new Error(`分类 ${categoryName} 不存在`);
    }
    
    const deleted = dept.categories[categoryName];
    delete dept.categories[categoryName];
    return deleted;
  }

  /**
   * 添加单元/设备
   */
  addUnit(deptName, categoryName, unitName, unitData, type = 'units') {
    const category = this.getDepartmentCategory(deptName, categoryName);
    if (!category) {
      throw new Error(`分类 ${categoryName} 不存在`);
    }
    
    if (!category[type]) {
      category[type] = {};
    }
    
    if (category[type][unitName]) {
      throw new Error(`${unitName} 已存在`);
    }
    
    category[type][unitName] = unitData;
    return unitData;
  }

  /**
   * 删除单元/设备
   */
  deleteUnit(deptName, categoryName, unitName, type = 'units') {
    const category = this.getDepartmentCategory(deptName, categoryName);
    if (!category || !category[type] || !category[type][unitName]) {
      throw new Error(`${unitName} 不存在`);
    }
    
    const deleted = category[type][unitName];
    delete category[type][unitName];
    return deleted;
  }

  /**
   * 为单元/设备分配电表（添加 symbol）
   */
  assignMeterToUnit(deptName, categoryName, unitName, symbol, type = 'units') {
    const category = this.getDepartmentCategory(deptName, categoryName);
    if (!category) {
      throw new Error(`分类 ${categoryName} 不存在`);
    }
    
    // 验证 symbol 是否存在
    if (!this.getMeterBySymbol(symbol)) {
      throw new Error(`symbol ${symbol} 不存在`);
    }
    
    // 处理 category 直接有 symbols 的情况
    if (!category[type]) {
      if (!category.symbols) {
        category.symbols = [];
      }
      if (!category.symbols.includes(symbol)) {
        category.symbols.push(symbol);
      }
      return;
    }
    
    const unit = category[type][unitName];
    if (!unit) {
      throw new Error(`${unitName} 不存在`);
    }
    
    if (!unit.symbols) {
      unit.symbols = [];
    }
    
    if (!unit.symbols.includes(symbol)) {
      unit.symbols.push(symbol);
    }
  }

  /**
   * 从单元/设备移除电表（移除 symbol）
   */
  removeMeterFromUnit(deptName, categoryName, unitName, symbol, type = 'units') {
    const category = this.getDepartmentCategory(deptName, categoryName);
    if (!category) {
      throw new Error(`分类 ${categoryName} 不存在`);
    }
    
    // 处理 category 直接有 symbols 的情况
    if (!category[type]) {
      if (category.symbols) {
        const index = category.symbols.indexOf(symbol);
        if (index > -1) {
          category.symbols.splice(index, 1);
        }
      }
      return;
    }
    
    const unit = category[type][unitName];
    if (!unit || !unit.symbols) {
      return;
    }
    
    const index = unit.symbols.indexOf(symbol);
    if (index > -1) {
      unit.symbols.splice(index, 1);
    }
  }

  // ==================== 数据导出 ====================
  
  /**
   * 导出为 JS 字符串
   */
  exportToJS() {
    let code = '// ================================\n';
    code += '// 能源系统数据配置文件\n';
    code += '// 此文件可直接修改，支持热重载\n';
    code += '// ================================\n\n';
    code += 'const EnergyData = ';
    code += JSON.stringify(this.data, null, 2);
    code += ';\n\n';
    code += '// 导出\n';
    code += 'if (typeof module !== \'undefined\' && module.exports) {\n';
    code += '  module.exports = EnergyData;\n';
    code += '}\n';
    return code;
  }

  /**
   * 下载配置文件
   */
  downloadConfig(filename = 'energy-data.js') {
    const code = this.exportToJS();
    const blob = new Blob([code], { type: 'text/javascript; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  /**
   * 复制配置到剪贴板
   */
  async copyToClipboard() {
    const code = this.exportToJS();
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const stats = {
      totalMeters: this.data.meters.length,
      metersWithNo: this.data.meters.filter(m => m.no !== null).length,
      totalDepartments: Object.keys(this.data.departments).length,
      departmentDetails: {}
    };
    
    for (let deptName in this.data.departments) {
      const symbols = this.getDepartmentAllSymbols(deptName);
      const nos = this.getDepartmentAllNos(deptName);
      stats.departmentDetails[deptName] = {
        symbols: symbols.length,
        nos: nos.length
      };
    }
    
    return stats;
  }
}

// 创建全局实例
const energyManager = new EnergyManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnergyManager;
}

