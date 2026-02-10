/**
 * 能源统计系统 - 统一配置文件（精简版）
 * 
 * 包含配置：
 * 1. 总统计_各区域用电量及占比统计12月统计无损_new.html (电量)
 * 2. 各区域用气量及占比统计12月统计.html (气量)
 * 
 * 数据结构：
 * - 每个分类包含两组NO：includeNos（要统计的）和 excludeNos（要减去的）
 * - 最终值 = SUM(includeNos) - SUM(excludeNos)
 * 
 * 使用方式：
 * 1. 在HTML中引入：<script src="../js/utils/energy-config-v2.js"></script>
 * 2. 访问电量配置：const config = window.EnergyConfig.pages.regionalElecStats;
 * 3. 访问气量配置：const config = window.EnergyConfig.pages.regionalGasStats;
 * 4. 获取分类配置：config.categories
 * 
 * 创建日期：2025-11-14
 * 版本：3.1.0 (精简版 - 支持电量和气量区域统计)
 */

(function(window) {
  'use strict';

  // ===================================================================
  // 页面配置1：各区域用电量及占比统计
  // ===================================================================

  const REGIONAL_ELEC_STATS = {
    title: '总统计_各区域用电量及占比统计12月统计无损',
    description: '各区域用电量及占比统计（支持减法运算）',
    dataType: 'electricity',  // 数据类型标识
    
    /**
     * 分类配置说明：
     * 
     * - key: 分类的唯一标识符（用于SQL列名）
     * - title: 分类的显示名称
     * - includeNos: 要统计的NO数组（这些NO的电量会被加总）
     * - excludeNos: 要减去的NO数组（这些NO的电量会从includeNos的总和中减去）
     * - 计算公式：分类电量 = SUM(includeNos) - SUM(excludeNos)
     * 
     * 表头结构：
     * - 第一行：工厂本部（跨6列：工厂总用电量+占比、设备+占比、辅助+占比）| 动力设施课 | 开发本部 | 经营企划部 | 品质本部 | 营业本部 | 公司总用电量
     * - 第二行：具体的用电量和占比列
     * 
     * 数据逻辑：
     * - 工厂总用电量 = 设备用电量 + 辅助用电量（页面计算）
     * - 公司总用电量 = 全厂79个设备的总和（SQL查询"合计"列）
     */
      categories: [
      // ========== 工厂本部（3个子项） ==========
        {
          key: 'factory',
          title: '工厂',
        // 工厂总用电量由页面计算（设备+辅助），这里为空
        includeNos: [],
        excludeNos: []
        },
        {
          key: 'equipment',
          title: '设备',
        // 设备用电 = 组装车间 + 机加工车间 + 电机车间
        includeNos: [
            // 组装车间（12个）
            110009, 110008, 110012, 110013, 120006, 230009, 230010, 110006, 120013, 480001, 480002, 480003,
            // 机加工车间（4个）
            13, 14, 15, 240003,
            // 电机车间（14个）
            110007, 18, 19, 220004, 220005, 220006, 240007, 240008, 240005, 240006, 120017, 480004, 480005, 480006
        ],
        excludeNos: []  // 无需减去任何设备
        },
        {
          key: 'auxiliary',
          title: '辅助',
        // 辅助用电 = 新成品车间
        includeNos: [320013, 320008, 320014, 320015, 320005],
        excludeNos: []  // 无需减去任何设备
        },
      
      // ========== 开发本部 ==========
        {
          key: 'dev_dept',
          title: '开发本部',
        // 开发本部 = 研发中心
        includeNos: [320020, 320018, 230004, 230005, 6, 5, 7, 9, 10, 320009, 8, 320019, 320010, 120014, 110005],
        excludeNos: []  // 无需减去任何设备
        },
      
      // ========== 经营企划部 ==========
        {
          key: 'planning_dept',
          title: '经营企划部',
        // 经营企划部 = 经营
        includeNos: [240004, 110003, 110002, 320004],
        excludeNos: []  // 无需减去任何设备
        },
      
      // ========== 品质本部 ==========
        {
          key: 'quality_dept',
          title: '品质本部',
        // 品质本部 = 质管
        includeNos: [480007, 480008, 480009, 480010, 480011],
        excludeNos: []  // 无需减去任何设备
        },
      
      // ========== 营业本部 ==========
        {
          key: 'sales_dept',
          title: '营业本部',
        // 营业本部 = 营业
        includeNos: [110004],
        excludeNos: []  // 无需减去任何设备
        },
      
      // ========== 动力设施课 ==========
        {
          key: 'power_facility',
          title: '动力设施课',
        // 动力设施课 = 生产用电 + 辅助用电（排除冰山帕特230003）
        includeNos: [
          120010, 120011, 120005, 120016, 120008, 230006, 230007, 320017, 230008, 3, 
          120015, 480012, 2, 320022, 320024, 480013, 480014, 480015
        ],
        excludeNos: []  // 无需减去任何设备
      },
      
      // ========== 公司总用电量（合计） ==========
        {
          key: 'total',
          title: '合计',
          // 全厂总用电（所有79个设备，排除冰山帕特230003）
        includeNos: [
          // 组装车间（12个）
          110009, 110008, 110012, 110013, 120006, 230009, 230010, 110006, 120013, 480001, 480002, 480003,
          // 机加工车间（4个）
          13, 14, 15, 240003,
          // 电机车间（14个）
          110007, 18, 19, 220004, 220005, 220006, 240007, 240008, 240005, 240006, 120017, 480004, 480005, 480006,
          // 研发中心（15个）
          320020, 320018, 230004, 230005, 6, 5, 7, 9, 10, 320009, 8, 320019, 320010, 120014, 110005,
          // 新成品车间（5个）
          320013, 320008, 320014, 320015, 320005,
          // 营业（1个）
          110004,
          // 经营（4个）
          240004, 110003, 110002, 320004,
          // 质管（5个）
          480007, 480008, 480009, 480010, 480011,
          // 动力设施课（18个）- 排除冰山帕特230003
          120010, 120011, 120005, 120016, 120008, 230006, 230007, 320017, 230008, 3,
          120015, 480012, 2, 320022, 320024, 480013, 480014, 480015
        ],
        excludeNos: []  // 无需减去任何设备
      }
    ],
    
    /**
     * 工具方法：获取分类的所有有效NO（包含includeNos和excludeNos，用于SQL查询）
     */
      getAllNOs: function() {
      const allNos = new Set();
      this.categories.forEach(cat => {
        cat.includeNos.forEach(no => allNos.add(no));
        cat.excludeNos.forEach(no => allNos.add(no));
      });
      return Array.from(allNos).sort((a, b) => a - b);
    },

    /**
     * 工具方法：根据key获取分类配置
     */
    getCategoryByKey: function(key) {
      return this.categories.find(cat => cat.key === key);
    },

    /**
     * 工具方法：生成SQL的CASE WHEN语句（支持减法）
     * 返回格式：SUM(CASE WHEN sub.no IN (...) THEN sub.total_elec ELSE 0 END) - SUM(CASE WHEN sub.no IN (...) THEN sub.total_elec ELSE 0 END) AS xxx_elec
     */
    generateSQLCaseClauses: function() {
      const clauses = [];
      
      this.categories.forEach(cat => {
        // 处理 includeNos
        const includeList = cat.includeNos.length > 0 ? cat.includeNos.join(',') : '-1';
        const includeClause = `SUM(CASE WHEN sub.no IN (${includeList}) THEN sub.total_elec ELSE 0 END)`;
        
        // 处理 excludeNos
        let fullClause;
        if (cat.excludeNos.length > 0) {
          const excludeList = cat.excludeNos.join(',');
          const excludeClause = `SUM(CASE WHEN sub.no IN (${excludeList}) THEN sub.total_elec ELSE 0 END)`;
          fullClause = `(${includeClause} - ${excludeClause}) AS ${cat.key}_elec`;
        } else {
          fullClause = `${includeClause} AS ${cat.key}_elec`;
        }
        
        clauses.push(fullClause);
      });
      
      return clauses;
    },

    /**
     * 工具方法：验证配置完整性
     */
    validate: function() {
      const errors = [];
      
      // 检查必需的分类是否存在
      const requiredKeys = ['factory', 'equipment', 'auxiliary', 'dev_dept', 'planning_dept', 'quality_dept', 'sales_dept', 'power_facility', 'total'];
      requiredKeys.forEach(key => {
        if (!this.getCategoryByKey(key)) {
          errors.push(`缺少必需的分类: ${key}`);
        }
      });
      
      // 检查是否有重复的key
      const keys = this.categories.map(cat => cat.key);
      const uniqueKeys = new Set(keys);
      if (keys.length !== uniqueKeys.size) {
        errors.push('存在重复的分类key');
      }
      
      return {
        valid: errors.length === 0,
        errors: errors
      };
    }
  };

  // ===================================================================
  // 页面配置2：各区域用气量及占比统计
  // ===================================================================

  const REGIONAL_GAS_STATS = {
    title: '各区域用气量及占比统计12月统计',
    description: '各区域用气量及占比统计（支持减法运算）',
    dataType: 'gas',  // 数据类型标识
    
    /**
     * 气量分类配置说明（2025-11-14 更新）：
     * 
     * - key: 分类的唯一标识符（用于SQL列名）
     * - title: 分类的显示名称
     * - includeNos: 要统计的NO数组（这些NO的气量会被加总）
     * - excludeNos: 要减去的NO数组（这些NO的气量会从includeNos的总和中减去）
     * - 计算公式：分类气量 = SUM(includeNos) - SUM(excludeNos)
     * 
     * 表头结构：平铺显示各车间，没有工厂本部分组
     * - 开发本部 | 新成品车间 | 机加工车间 | 组装车间 | 壳体车间 | 电机车间 | 公司总用气量
     * 
     * 数据逻辑：
     * - 公司总用气量 = 全厂所有气表的总和（SQL查询"合计"列）
     */
    categories: [
      // ========== 开发本部 ==========
      {
        key: 'dev_dept',
        title: '开发本部',
        // 开发本部 = NO.3
        includeNos: [3],
        excludeNos: []
      },
      
      // ========== 新成品车间 ==========
      {
        key: 'new_product',
        title: '新成品车间',
        // 新成品车间 = NO.2 - NO.3
        includeNos: [2],
        excludeNos: [3]
      },
      
      // ========== 机加工车间 ==========
      {
        key: 'machining',
        title: '机加工车间',
        // 机加工车间 = NO.4 - NO.5
        includeNos: [4],
        excludeNos: [5]
      },
      
      // ========== 组装车间 ==========
      {
        key: 'assembly',
        title: '组装车间',
        // 组装车间 = NO.6 + NO.8
        includeNos: [6, 8],
        excludeNos: []
      },
      
      // ========== 壳体车间 ==========
      {
        key: 'shell',
        title: '壳体车间',
        // 壳体车间 = NO.7 - NO.9 - NO.8
        includeNos: [7],
        excludeNos: [9, 8]
      },
      
      // ========== 电机车间 ==========
      {
        key: 'motor',
        title: '电机车间',
        // 电机车间 = NO.5 + NO.9
        includeNos: [5, 9],
        excludeNos: []
      },
      
      // ========== 公司总用气量（合计） ==========
      {
        key: 'total',
        title: '合计',
        // 全厂总用气：所有气表NO（2-9）
        includeNos: [2, 3, 4, 5, 6, 7, 8, 9],
        excludeNos: []
      }
    ],
    
    /**
     * 工具方法：获取分类的所有有效NO（包含includeNos和excludeNos，用于SQL查询）
     */
      getAllNOs: function() {
        const allNos = new Set();
      this.categories.forEach(cat => {
        cat.includeNos.forEach(no => allNos.add(no));
        cat.excludeNos.forEach(no => allNos.add(no));
        });
        return Array.from(allNos).sort((a, b) => a - b);
      },
      
    /**
     * 工具方法：根据key获取分类配置
     */
    getCategoryByKey: function(key) {
      return this.categories.find(cat => cat.key === key);
    },
    
    /**
     * 工具方法：生成SQL的CASE WHEN语句（支持减法）
     * 返回格式：SUM(CASE WHEN sub.no IN (...) THEN sub.total_gas ELSE 0 END) - SUM(CASE WHEN sub.no IN (...) THEN sub.total_gas ELSE 0 END) AS xxx_gas
     */
    generateSQLCaseClauses: function() {
      const clauses = [];
      
      this.categories.forEach(cat => {
        // 处理 includeNos
        const includeList = cat.includeNos.length > 0 ? cat.includeNos.join(',') : '-1';
        const includeClause = `SUM(CASE WHEN sub.no IN (${includeList}) THEN sub.total_gas ELSE 0 END)`;
        
        // 处理 excludeNos
        let fullClause;
        if (cat.excludeNos.length > 0) {
          const excludeList = cat.excludeNos.join(',');
          const excludeClause = `SUM(CASE WHEN sub.no IN (${excludeList}) THEN sub.total_gas ELSE 0 END)`;
          fullClause = `(${includeClause} - ${excludeClause}) AS ${cat.key}_gas`;
        } else {
          fullClause = `${includeClause} AS ${cat.key}_gas`;
        }
        
        clauses.push(fullClause);
      });
      
      return clauses;
    },
    
    /**
     * 工具方法：验证配置完整性
     */
    validate: function() {
      const errors = [];
      
      // 检查必需的分类是否存在（气量版本：6个车间+合计）
      const requiredKeys = ['dev_dept', 'new_product', 'machining', 'assembly', 'shell', 'motor', 'total'];
      requiredKeys.forEach(key => {
        if (!this.getCategoryByKey(key)) {
          errors.push(`缺少必需的分类: ${key}`);
        }
      });
      
      // 检查是否有重复的key
      const keys = this.categories.map(cat => cat.key);
      const uniqueKeys = new Set(keys);
      if (keys.length !== uniqueKeys.size) {
        errors.push('存在重复的分类key');
      }
      
      return {
        valid: errors.length === 0,
        errors: errors
      };
    }
  };

  // ===================================================================
  // 配置4: 各区域用水量及占比统计（水量版本）
  // ===================================================================
  const REGIONAL_WATER_STATS = {
    title: '各区域用水量及占比统计12月统计',
    description: '各区域用水量及占比统计（支持减法运算）',
    dataType: 'water',
      categories: [
      // ========== 工厂本部 ==========
        {
          key: 'factory',
          title: '工厂',
        // 工厂总用水 = 设备用水 + 辅助用水（在前端计算）
        includeNos: [],
        excludeNos: []
        },
      
      // ========== 设备用水 ==========
        {
          key: 'equipment',
          title: '设备',
        // 设备用水量 = 待配置具体水表NO
        includeNos: [],
        excludeNos: []
      },
      
      // ========== 辅助用水 ==========
        {
          key: 'auxiliary',
          title: '辅助',
        // 辅助用水量 = 待配置具体水表NO
        includeNos: [],
        excludeNos: []
        },
      
      // ========== 开发本部 ==========
        {
          key: 'dev_dept',
          title: '开发本部',
        includeNos: [],
        excludeNos: []
        },
      
      // ========== 经营企划部 ==========
        {
          key: 'planning_dept',
          title: '经营企划部',
        includeNos: [],
        excludeNos: []
        },
      
      // ========== 品质本部 ==========
        {
          key: 'quality_dept',
          title: '品质本部',
        includeNos: [],
        excludeNos: []
        },
      
      // ========== 营业本部 ==========
        {
          key: 'sales_dept',
          title: '营业本部',
        includeNos: [],
        excludeNos: []
        },
      
      // ========== 动力设施课 ==========
        {
          key: 'power_facility',
          title: '动力设施课',
        includeNos: [],
        excludeNos: []
        },
      
      // ========== 公司总用水量（合计） ==========
        {
          key: 'total',
          title: '合计',
        // 全厂总用水：water_1（全厂，对应NO=1）
        includeNos: [1],
        excludeNos: []
      }
    ],
    
    /**
     * 工具方法：获取分类的所有有效NO
     */
    getAllNOs: function() {
      const allNos = new Set();
      this.categories.forEach(cat => {
        cat.includeNos.forEach(no => allNos.add(no));
        cat.excludeNos.forEach(no => allNos.add(no));
      });
      return Array.from(allNos).sort((a, b) => a - b);
    },
    
    /**
     * 工具方法：根据key获取分类配置
     */
    getCategoryByKey: function(key) {
      return this.categories.find(cat => cat.key === key);
    },
    
    /**
     * 工具方法：生成SQL CASE WHEN子句
     */
    generateSQLCaseClauses: function(sumField = 'sum_water_flow_total') {
      return this.categories.map(cat => {
        const includeNos = cat.includeNos || [];
        const excludeNos = cat.excludeNos || [];
        
        const includeList = includeNos.length > 0 ? includeNos.join(',') : '-1';
        const includeClause = `SUM(CASE WHEN sub.no IN (${includeList}) THEN sub.total_water ELSE 0 END)`;
        
        if (excludeNos.length > 0) {
          const excludeList = excludeNos.join(',');
          const excludeClause = `SUM(CASE WHEN sub.no IN (${excludeList}) THEN sub.total_water ELSE 0 END)`;
          return `(${includeClause} - ${excludeClause}) AS ${cat.key}_water`;
        } else {
          return `${includeClause} AS ${cat.key}_water`;
        }
      });
    },
    
    /**
     * 工具方法：验证配置完整性
     */
    validate: function() {
      const errors = [];
      
      if (!this.categories || this.categories.length === 0) {
        errors.push('categories为空');
        return { valid: false, errors };
      }
      
      this.categories.forEach((cat, index) => {
        if (!cat.key) errors.push(`分类${index}缺少key`);
        if (!cat.title) errors.push(`分类${cat.key}缺少title`);
        if (!Array.isArray(cat.includeNos)) errors.push(`分类${cat.key}的includeNos不是数组`);
        if (!Array.isArray(cat.excludeNos)) errors.push(`分类${cat.key}的excludeNos不是数组`);
      });
      
      return { valid: errors.length === 0, errors };
    }
  };

  // ===================================================================
  // 导出到全局
  // ===================================================================
  window.EnergyConfig = {
    // 页面配置
    pages: {
      regionalElecStats: REGIONAL_ELEC_STATS,  // 电量统计
      regionalGasStats: REGIONAL_GAS_STATS,    // 气量统计
      regionalWaterStats: REGIONAL_WATER_STATS, // 水量统计
      // 兼容旧版本
      regionalStats: REGIONAL_ELEC_STATS
    },
    
    // 元信息
    version: '3.2.0',
    description: '精简版配置文件 - 支持电量、气量和水量区域统计（支持减法运算）'
  };

  // 配置验证
  console.log('✅ EnergyConfig v3.1 已加载');
  console.log('');
  
  // 验证电量配置
  const elecValidation = REGIONAL_ELEC_STATS.validate();
  if (!elecValidation.valid) {
    console.error('❌ 电量配置验证失败:');
    elecValidation.errors.forEach(err => console.error('  -', err));
  } else {
    console.log('📊 [电量统计] regionalElecStats');
    console.log('   标题:', REGIONAL_ELEC_STATS.title);
    console.log('   分类数量:', REGIONAL_ELEC_STATS.categories.length, '个');
    console.log('   涉及设备NO:', REGIONAL_ELEC_STATS.getAllNOs().length, '个');
    
    // 打印各分类的NO数量统计
    console.log('   各分类统计:');
    REGIONAL_ELEC_STATS.categories.forEach(cat => {
      const includeCount = cat.includeNos.length;
      const excludeCount = cat.excludeNos.length;
      const operation = excludeCount > 0 ? `${includeCount} - ${excludeCount}` : `${includeCount}`;
      console.log(`     ${cat.title} (${cat.key}): ${operation} 个NO`);
    });
  }
  
  console.log('');
  
  // 验证气量配置
  const gasValidation = REGIONAL_GAS_STATS.validate();
  if (!gasValidation.valid) {
    console.error('❌ 气量配置验证失败:');
    gasValidation.errors.forEach(err => console.error('  -', err));
  } else {
    console.log('💨 [气量统计] regionalGasStats');
    console.log('   标题:', REGIONAL_GAS_STATS.title);
    console.log('   分类数量:', REGIONAL_GAS_STATS.categories.length, '个');
    console.log('   涉及气表NO:', REGIONAL_GAS_STATS.getAllNOs().length, '个');
    console.log('   ⚠️  注意: 气表NO需要根据实际情况填写到各分类的 includeNos 中');
    
    // 打印各分类的NO数量统计
    console.log('   各分类统计:');
    REGIONAL_GAS_STATS.categories.forEach(cat => {
      const includeCount = cat.includeNos.length;
      const excludeCount = cat.excludeNos.length;
      const operation = excludeCount > 0 ? `${includeCount} - ${excludeCount}` : `${includeCount}`;
      console.log(`     ${cat.title} (${cat.key}): ${operation} 个NO`);
    });
  }
  
  console.log('');
  
  // 验证水量配置
  const waterValidation = REGIONAL_WATER_STATS.validate();
  if (!waterValidation.valid) {
    console.error('❌ 水量配置验证失败:');
    waterValidation.errors.forEach(err => console.error('  -', err));
  } else {
    console.log('💧 [水量统计] regionalWaterStats');
    console.log('   标题:', REGIONAL_WATER_STATS.title);
    console.log('   分类数量:', REGIONAL_WATER_STATS.categories.length, '个');
    console.log('   涉及水表NO:', REGIONAL_WATER_STATS.getAllNOs().length, '个');
    console.log('   ⚠️  注意: 水表NO需要根据实际情况填写到各分类的 includeNos 中');
    
    // 打印各分类的NO数量统计
    console.log('   各分类统计:');
    REGIONAL_WATER_STATS.categories.forEach(cat => {
      const includeCount = cat.includeNos.length;
      const excludeCount = cat.excludeNos.length;
      const operation = excludeCount > 0 ? `${includeCount} - ${excludeCount}` : `${includeCount}`;
      console.log(`     ${cat.title} (${cat.key}): ${operation} 个NO`);
    });
  }
  
  console.log('');
  console.log('✨ 新特性: 支持减法运算 (includeNos - excludeNos)');
  console.log('📖 使用说明:');
  console.log('   电量页面: const config = window.EnergyConfig.pages.regionalElecStats;');
  console.log('   气量页面: const config = window.EnergyConfig.pages.regionalGasStats;');
  console.log('   水量页面: const config = window.EnergyConfig.pages.regionalWaterStats;');

})(window);
