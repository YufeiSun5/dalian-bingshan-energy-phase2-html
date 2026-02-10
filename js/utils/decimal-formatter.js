/**
 * 通用小数位数格式化工具
 * @description 用于格式化表格列的小数位数
 */

/**
 * 格式化数字的小数位数
 * @param {number|string} value - 要格式化的数值
 * @param {number} decimalPlaces - 保留的小数位数，0表示不保留小数
 * @returns {string} 格式化后的字符串
 */
function formatDecimal(value, decimalPlaces) {
    // 如果值为空、"-"、undefined或null，直接返回原值
    if (value === '' || value === '-' || value === undefined || value === null) {
        return value;
    }
    
    // 转换为数字
    const num = parseFloat(value);
    
    // 如果转换失败，返回原值
    if (isNaN(num)) {
        return value;
    }
    
    // 根据小数位数进行格式化
    if (decimalPlaces === 0) {
        return Math.round(num).toString();
    } else {
        return num.toFixed(decimalPlaces);
    }
}

/**
 * 格式化表格数据中指定列的小数位数
 * @param {Array} data - 表格数据数组
 * @param {Object} columnConfig - 列配置对象，格式：{ 列字段名: 小数位数 }
 *                                 例如：{ 'today_elec': 2, 'ratio': 1 }
 * @returns {Array} 格式化后的数据数组
 */
function formatTableColumns(data, columnConfig) {
    if (!data || !Array.isArray(data) || !columnConfig) {
        return data;
    }
    
    return data.map(row => {
        const newRow = { ...row };
        
        // 遍历列配置
        for (const [field, decimalPlaces] of Object.entries(columnConfig)) {
            if (newRow.hasOwnProperty(field)) {
                newRow[field] = formatDecimal(newRow[field], decimalPlaces);
            }
        }
        
        return newRow;
    });
}

/**
 * 批量设置多个列为相同的小数位数
 * @param {Array} data - 表格数据数组
 * @param {Array} fields - 要格式化的列字段名数组
 * @param {number} decimalPlaces - 统一的小数位数
 * @returns {Array} 格式化后的数据数组
 */
function formatMultipleColumns(data, fields, decimalPlaces) {
    if (!data || !Array.isArray(data) || !fields || !Array.isArray(fields)) {
        return data;
    }
    
    const columnConfig = {};
    fields.forEach(field => {
        columnConfig[field] = decimalPlaces;
    });
    
    return formatTableColumns(data, columnConfig);
}

/**
 * 为layui表格的templet提供格式化函数
 * @param {number} decimalPlaces - 保留的小数位数
 * @returns {Function} 返回一个templet函数，可直接用于layui表格列配置
 */
function createLayuiFormatter(decimalPlaces) {
    return function(d) {
        const value = d[this.field];
        return formatDecimal(value, decimalPlaces);
    };
}

// 导出函数（如果使用ES6模块）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDecimal,
        formatTableColumns,
        formatMultipleColumns,
        createLayuiFormatter
    };
}

