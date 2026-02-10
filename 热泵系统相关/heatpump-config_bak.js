window.HEATPUMP_CONFIG = {
    chartInstance: null,
    apiBaseUrl: 'http://192.168.7.229:8004',

    init: function(domId) {
        var dom = document.getElementById(domId);
        if(dom) this.chartInstance = echarts.init(dom);
    },

    // HTTP 请求封装
    async request(url, options = {}) {
        try {
            const res = await fetch(url, { 
                ...options, 
                headers: { 'Content-Type': 'application/json' } 
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error('[请求错误]', e);
            throw e;
        }
    },

    async sendSQL(sql) {
        return await this.request(`${this.apiBaseUrl}/api/sql/run-sql`, {
            method: 'POST',
            body: JSON.stringify({ sql })
        });
    },

    updateChart: function(data, paramType) {
        if(!this.chartInstance) return;

        // 根据参数类型设置Y轴配置 - 全部自适应
        var yAxisConfig = {};
        var unit = '';
        
        if (paramType === 'power') {
            yAxisConfig = {
                type: 'value', 
                name: '耗电量(kWh)', 
                nameTextStyle: { color: '#fff' },
                nameLocation: 'end',  // 标签位置：end(顶部)
                nameGap: -30,  // 标签与轴线的距离
                scale: true,  // 自适应缩放
                axisLine: { lineStyle: { color: '#2a6dc8' } },
                axisLabel: { color: '#b9d3f4' },
                splitLine: { lineStyle: { color: '#2a6dc8', opacity: 0.15 } }
            };
            unit = ' kWh';
        } else if (paramType === 'heat') {
            yAxisConfig = {
                type: 'value', 
                name: '热量(GJ)', 
                nameTextStyle: { color: '#fff' },
                nameLocation: 'end',  // 标签位置：end(顶部)
                nameGap: -30,  // 标签与轴线的距离
                scale: true,  // 自适应缩放
                axisLine: { lineStyle: { color: '#2a6dc8' } },
                axisLabel: { color: '#b9d3f4' },
                splitLine: { lineStyle: { color: '#2a6dc8', opacity: 0.15 } }
            };
            unit = ' GJ';
        } else {
            yAxisConfig = {
                type: 'value', 
                name: '能效COP', 
                nameTextStyle: { color: '#fff' },
                nameLocation: 'end',  // 标签位置：end(顶部)
                nameGap: -30,  // 标签与轴线的距离
                scale: true,  // 自适应缩放
                axisLine: { lineStyle: { color: '#2a6dc8' } },
                axisLabel: { color: '#b9d3f4' },
                splitLine: { lineStyle: { color: '#2a6dc8', opacity: 0.15 } }
            };
            unit = '';
        }

        var option = {
            backgroundColor: 'transparent',
            tooltip: { 
                trigger: 'axis', 
                backgroundColor: 'rgba(29, 56, 111, 0.9)', 
                borderColor: '#2a6dc8', 
                textStyle: { color: '#fff' },
                formatter: function(params) {
                    var result = params[0].axisValue + '<br/>';
                    params.forEach(function(item) {
                        // 只显示有值的数据
                        if (item.value !== null && item.value !== undefined && item.value !== '') {
                            result += item.marker + ' ' + item.seriesName + ': ' + item.value + unit + '<br/>';
                        }
                    });
                    return result;
                }
            },
            legend: { data: data.series.map(s => s.name), textStyle: { color: '#b9d3f4' }, top: 5 },
            grid: { top: 35, left: 50, right: 30, bottom: 20, containLabel: true },
            xAxis: {
                type: 'category', 
                boundaryGap: false, 
                data: data.axis,
                axisLine: { lineStyle: { color: '#2a6dc8' } },
                axisLabel: { 
                    color: '#b9d3f4', 
                    fontSize: 10,
                    rotate: data.axis.length > 50 ? 45 : 0,  // 数据点多时旋转标签
                    interval: data.axis.length > 100 ? 'auto' : 0,  // 自动隐藏部分标签
                    formatter: function(value) {
                        // 如果标签太长，可以进一步截断
                        if (value && value.length > 12) {
                            return value.substring(0, 11);
                        }
                        return value;
                    }
                },
                splitLine: { show: true, lineStyle: { color: '#2a6dc8', opacity: 0.15 } }
            },
            yAxis: yAxisConfig,
            series: data.series.map(item => {
                var seriesConfig = {
                    name: item.name, 
                    type: 'line', 
                    smooth: true,
                    symbol: 'circle', 
                    symbolSize: 6,
                    itemStyle: { color: item.color },
                    data: item.data
                };

                // 根据数据类型设置线型
                if (item.lineStyle === 'dashed') {
                    // 分组汇总：虚线，加粗
                    seriesConfig.lineStyle = { 
                        width: 3, 
                        type: 'dashed',
                        color: item.color
                    };
                    seriesConfig.symbolSize = 8;
                } else if (item.lineStyle === 'bold') {
                    // 全厂汇总：实线，加粗
                    seriesConfig.lineStyle = { 
                        width: 4,
                        color: item.color
                    };
                    seriesConfig.symbolSize = 10;
                } else {
                    // 普通设备：普通线
                    seriesConfig.lineStyle = { 
                        width: 2,
                        color: item.color
                    };
                }

                return seriesConfig;
            })
        };
        this.chartInstance.setOption(option, true);
    },

    resize: function() { if(this.chartInstance) this.chartInstance.resize(); },

    generateTimeAxis: function() {
        var axis = [];
        for(var i=7; i<=23; i++) axis.push(i + ':00');
        for(var i=0; i<=6; i++) axis.push('次日0' + i + ':00');
        return axis;
    },

    randCurve: function(base, count) {
        var arr = [];
        for(var i=0; i<count; i++) {
            var val = base + (Math.random() * 0.8 - 0.4);
            arr.push(val.toFixed(2));
        }
        return arr;
    },

    // 生成按设备查询的SQL
    generateSQL_ByEquipment: function(startDate, endDate, dateMode) {
        // 根据日期模式选择时间格式
        var timeFormat = dateMode === 'month' ? '%Y-%m-%d' : '%Y-%m-%d %H:00:00';
        
        // 调整查询时间范围：7:00 AM 到次日 7:00 AM
        var adjustedStartDate = startDate;
        var adjustedEndDate = endDate;
        
        if (dateMode === 'day') {
            // 日模式：从 startDate 07:00:00 到 endDate+1天 07:00:00
            adjustedStartDate = startDate + ' 07:00:00';
            // 结束日期需要+1天的07:00:00
            var endDateObj = new Date(endDate);
            endDateObj.setDate(endDateObj.getDate() + 1);
            var nextDay = endDateObj.toISOString().substring(0, 10);
            adjustedEndDate = nextDay + ' 06:59:59';
        } else {
            // 月模式：从月初第一天07:00:00 到月末最后一天+1的06:59:59
            adjustedStartDate = startDate + ' 07:00:00';
            var endDateObj = new Date(endDate);
            endDateObj.setDate(endDateObj.getDate() + 1);
            var nextDay = endDateObj.toISOString().substring(0, 10);
            adjustedEndDate = nextDay + ' 06:59:59';
        }
        
        // 判断是否包含今天
        var today = new Date();
        var todayStr = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
        var includesToday = (endDate >= todayStr);
        
        // 如果包含今天，计算今天7点和当前时间
        var todaySevenAM = todayStr + ' 07:00:00';
        var nowTime = today.getFullYear() + '-' + 
                      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(today.getDate()).padStart(2, '0') + ' ' +
                      String(today.getHours()).padStart(2, '0') + ':' +
                      String(today.getMinutes()).padStart(2, '0') + ':' +
                      String(today.getSeconds()).padStart(2, '0');
        
        return `
WITH 
-- =========================================================
-- 部分 1: 电能基础计算
-- =========================================================
elec_raw_calc AS (
    SELECT
        t.no,
        t.query_date_hour AS query_date,
        IF(
            lead(t.no, 1, 0) OVER (ORDER BY t.no, t.query_date_hour) = t.no,
            lead(t.min_val, 1, 0) OVER (ORDER BY t.no, t.query_date_hour) - t.min_val,
            t.max_val - t.min_val
        ) AS hourly_usage
    FROM (
        SELECT 
            no, 
            date_format(date, '${timeFormat}') AS query_date_hour, 
            MIN(KWH) as min_val, 
            MAX(KWH) as max_val
        FROM data_all 
        WHERE 
            no IN (320022, 420001, 420002, 420003, 420004, 420005, 420006, 420007, 420008, 420009, 420011, 420012, 420013, 420014, 420015)
            AND KWH > 0
            AND date >= '${adjustedStartDate}' 
            AND date <= '${adjustedEndDate}'
        GROUP BY no, date_format(date, '${timeFormat}')
    ) t
),

elec_final_view AS (
    SELECT 
        rd.query_date,
        cfg.NO AS no,
        cfg.name AS item_name,
        CASE 
            WHEN cfg.NO IN (420001, 420002) THEN '1-天加组'
            WHEN cfg.NO IN (420003, 420007, 420008, 420010) THEN '2-冷机组'
            WHEN cfg.NO IN (420004, 420005, 420006, 420011) THEN '3-欧亚组'
            WHEN cfg.NO IN (420009) THEN '4-冰山2组'
            WHEN cfg.NO IN (420012, 420015) THEN '5-冰山组'
            WHEN cfg.NO IN (420013, 420014) THEN '6-扬子组'
            ELSE '9-其他'
        END AS group_name,
        CASE 
            
            WHEN cfg.NO = 420010 THEN 
                 GREATEST(0, COALESCE((SELECT hourly_usage FROM elec_raw_calc WHERE no = 320022 AND query_date = rd.query_date), 0) - 
                             COALESCE((SELECT hourly_usage FROM elec_raw_calc WHERE no = 420001 AND query_date = rd.query_date), 0) -
							 COALESCE((SELECT hourly_usage FROM elec_raw_calc WHERE no = 420002 AND query_date = rd.query_date), 0) -
							 COALESCE((SELECT hourly_usage FROM elec_raw_calc WHERE no = 420009 AND query_date = rd.query_date), 0)
						)
            ELSE COALESCE(rd.hourly_usage, 0)
        END AS elec_val
    FROM info_config cfg
    JOIN elec_raw_calc rd ON cfg.NO = rd.no OR (cfg.NO = 420010 AND rd.no = 320022)
    WHERE cfg.NO BETWEEN 420001 AND 420015
    GROUP BY rd.query_date, cfg.NO 
),

-- =========================================================
-- 部分 2: 热能基础计算
-- =========================================================
${includesToday ? `
-- 查询包含今天：分两部分
-- 2.1: 从汇总表查询（结束时间 < 今天7点）
heat_from_summary AS (
    SELECT
        no,
        date_format(date, '${timeFormat}') AS query_date,
        SUM(sum_heat) AS hourly_usage
    FROM sum_heat_group_by_hour
    WHERE no BETWEEN 420001 AND 420015
      AND date >= '${adjustedStartDate}'
      AND date < '${todaySevenAM}'
    GROUP BY no, date_format(date, '${timeFormat}')
),

-- 2.2: 从原始表查询今天7点到现在
heat_from_original AS (
    SELECT
        t.no AS no,
        t.query_date_hour AS query_date,
        IF(
            lead(t.no, 1, 0) OVER (ORDER BY t.no, t.query_date_hour) = t.no,
            lead(t.min_val, 1, 0) OVER (ORDER BY t.no, t.query_date_hour) - t.min_val,
            t.max_val - t.min_val
        ) AS hourly_usage
    FROM (
        SELECT
            no, 
            date_format(date, '${timeFormat}') AS query_date_hour, 
            MIN(heat_quantity) AS min_val, 
            MAX(heat_quantity) AS max_val
        FROM data_heat_quantity
        WHERE no BETWEEN 420001 AND 420015 
          AND heat_quantity != 0
          AND heat_quantity != 99999999
          AND date >= '${todaySevenAM}'
          AND date <= '${nowTime}'
        GROUP BY no, date_format(date, '${timeFormat}')
    ) t
),

-- 2.3: 合并两部分数据
heat_combined AS (
    SELECT no, query_date, hourly_usage FROM heat_from_summary
    UNION ALL
    SELECT no, query_date, hourly_usage FROM heat_from_original
),

heat_final_view AS (
    SELECT 
        hc.query_date,
        cfg.NO AS no,
        cfg.name AS item_name,
        CASE 
            WHEN cfg.NO IN (420001, 420002) THEN '1-天加组'
            WHEN cfg.NO IN (420003, 420007, 420008, 420010) THEN '2-冷机组'
            WHEN cfg.NO IN (420004, 420005, 420006, 420011) THEN '3-欧亚组'
            WHEN cfg.NO IN (420009) THEN '4-冰山2组'
            WHEN cfg.NO IN (420012, 420015) THEN '5-冰山组'
            WHEN cfg.NO IN (420013, 420014) THEN '6-扬子组'
            ELSE '9-其他'
        END AS group_name,
        hc.hourly_usage AS heat_val
    FROM info_config cfg
    JOIN heat_combined hc ON cfg.NO = hc.no
    WHERE cfg.NO BETWEEN 420001 AND 420015
),
` : `
-- 查询不包含今天：全部从汇总表
heat_final_view AS (
    SELECT 
        calc_data.query_date,
        cfg.NO AS no,
        cfg.name AS item_name,
        CASE 
            WHEN cfg.NO IN (420001, 420002) THEN '1-天加组'
            WHEN cfg.NO IN (420003, 420007, 420008, 420010) THEN '2-冷机组'
            WHEN cfg.NO IN (420004, 420005, 420006, 420011) THEN '3-欧亚组'
            WHEN cfg.NO IN (420009) THEN '4-冰山2组'
            WHEN cfg.NO IN (420012, 420015) THEN '5-冰山组'
            WHEN cfg.NO IN (420013, 420014) THEN '6-扬子组'
            ELSE '9-其他'
        END AS group_name,
        calc_data.hourly_usage AS heat_val
    FROM info_config cfg
    JOIN (
        SELECT
            no,
            date_format(date, '${timeFormat}') AS query_date,
            SUM(sum_heat) AS hourly_usage
        FROM sum_heat_group_by_hour
        WHERE no BETWEEN 420001 AND 420015
          AND date >= '${adjustedStartDate}'
          AND date <= '${adjustedEndDate}'
        GROUP BY no, date_format(date, '${timeFormat}')
    ) calc_data ON cfg.NO = calc_data.no
    WHERE cfg.NO BETWEEN 420001 AND 420015
),
`}

-- =========================================================
-- 部分 3: 数据合并
-- =========================================================
combined_data AS (
    SELECT query_date, group_name, item_name, no, elec_val AS electricity, 0 AS heat FROM elec_final_view
    UNION ALL
    SELECT query_date, group_name, item_name, no, 0 AS electricity, heat_val AS heat FROM heat_final_view
)

-- =========================================================
-- 部分 4: 最终汇总输出 (含 COP 计算)
-- =========================================================
SELECT
    stats.query_date AS date,
    COALESCE(stats.group_name, '=== 全厂综合能效 ===') AS category,
    CASE
        WHEN stats.group_name IS NOT NULL AND stats.no IS NULL THEN CONCAT(stats.group_name, ' 总计')
        WHEN stats.group_name IS NULL THEN '---'
        ELSE stats.item_name
    END AS name_display,
    stats.no,
    SUM(stats.electricity) AS elec_kwh,
    SUM(stats.heat) AS heat_qty,

    -- 【修改点】：COP计算公式改为 热量(MJ) / (3.6 * 电量)
    -- 使用 IFNULL(..., 0) 包裹整个计算结果
    -- 当电量为0导致 NULLIF 返回 NULL，进而导致结果为 NULL 时，显示为 0
    IFNULL(
        ROUND(
            SUM(stats.heat)*1000 / NULLIF((SUM(stats.electricity) * 3.6), 0), 
        2), 
    0) AS cop_value

FROM combined_data stats

GROUP BY 
    stats.query_date, 
    stats.group_name, 
    stats.no WITH ROLLUP

HAVING stats.query_date IS NOT NULL

ORDER BY 
    stats.query_date DESC, 
    stats.group_name ASC, 
    stats.no ASC;
        `;
    },

    // 按设备查询（真实数据）
    getMockData_ByEquipment: async function(params) {
        // 如果没有传参数，返回模拟数据
        if (!params || !params.startDate || !params.endDate) {
            var axis = this.generateTimeAxis();
            var baseValue = params && params.param === 'power' ? 50 : 1.8;
            return {
                axis: axis,
                series: [
                    { name: '欧亚机组', color: '#3c8ce7', data: this.randCurve(baseValue, axis.length) },
                    { name: '杨子机组', color: '#e74c3c', data: this.randCurve(baseValue + 0.4, axis.length) },
                    { name: '格力机组', color: '#00e676', data: this.randCurve(baseValue - 0.3, axis.length) }
                ]
            };
        }

        try {
            const dateMode = params.dateMode || 'day';
            const sql = this.generateSQL_ByEquipment(params.startDate, params.endDate, dateMode);
            
            // 输出SQL到控制台
            console.log('='.repeat(80));
            console.log('【按设备查询 SQL】');
            console.log('查询参数:', {
                startDate: params.startDate,
                endDate: params.endDate,
                dateMode: dateMode,
                param: params.param
            });
            console.log('SQL语句:');
            console.log(sql);
            console.log('='.repeat(80));
            
            const response = await this.sendSQL(sql);
            
            // 输出查询结果
            console.log('查询结果数量:', response?.data?.length || 0);
            if (response?.data && response.data.length > 0) {
                console.log('全部查询数据:', response.data);
                
                // 【新增】检查 420003 和 420004 的数据
                console.log('\n【重点检查】420003(电机_冷机) 和 420004(电机_欧亚) 的数据:');
                const data420003 = response.data.filter(r => r.no === 420003);
                const data420004 = response.data.filter(r => r.no === 420004);
                console.log('420003 数据条数:', data420003.length);
                console.log('420004 数据条数:', data420004.length);
                
                if (data420003.length > 0) {
                    console.log('\n420003 样例数据（前5条）:');
                    console.table(data420003.slice(0, 5));
                }
                if (data420004.length > 0) {
                    console.log('\n420004 样例数据（前5条）:');
                    console.table(data420004.slice(0, 5));
                }
            }
            console.log('='.repeat(80));
            
            if (!response || !response.data || response.data.length === 0) {
                throw new Error('没有查询到数据');
            }

            const paramType = params.param || 'cop';
            return this.processEquipmentData(response.data, paramType, dateMode, params.startDate, params.endDate);
        } catch (error) {
            console.error('查询失败:', error);
            throw error;
        }
    },

    // 生成完整的时间轴（多天的小时 或 多天的日期）
    generateCompleteTimeAxis: function(startDate, endDate, dateMode) {
        const timeAxis = [];
        
        if (dateMode === 'day') {
            // 日模式：生成从startDate到endDate的所有小时（每天7:00到次日6:00）
            const start = new Date(startDate + ' 07:00:00');
            const end = new Date(endDate + ' 07:00:00');
            end.setDate(end.getDate() + 1); // 结束日期要到次日7:00
            
            let current = new Date(start);
            while (current < end) {
                const year = current.getFullYear();
                const month = String(current.getMonth() + 1).padStart(2, '0');
                const day = String(current.getDate()).padStart(2, '0');
                const hour = String(current.getHours()).padStart(2, '0');
                const timeStr = `${year}-${month}-${day} ${hour}:00`;
                timeAxis.push(timeStr);
                current.setHours(current.getHours() + 1);
            }
        } else {
            // 月模式：生成从startDate到endDate的所有日期（YYYY-MM-DD）
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            let current = new Date(start);
            while (current <= end) {
                const year = current.getFullYear();
                const month = String(current.getMonth() + 1).padStart(2, '0');
                const day = String(current.getDate()).padStart(2, '0');
                timeAxis.push(`${year}-${month}-${day}`);
                current.setDate(current.getDate() + 1);
            }
        }
        
        return timeAxis;
    },

    // 处理按设备查询的数据
    processEquipmentData: function(rawData, paramType, dateMode, startDate, endDate) {
        paramType = paramType || 'cop'; // 默认为COP
        dateMode = dateMode || 'day';   // 默认为日模式
        
        // 定义所有设备配置（包括可能没有数据的设备）
        const allEquipments = [
            { no: 420001, name: '大办_天加02', group: '1-天加组' },
            { no: 420002, name: '大办_天加01', group: '1-天加组' },
            { no: 420003, name: '电机_冷机', group: '2-冷机组' },
            { no: 420007, name: '研发_冷机1', group: '2-冷机组' },
            { no: 420008, name: '研发_欧亚1', group: '2-冷机组' },
            { no: 420010, name: '大办_冷机', group: '2-冷机组' },
            { no: 420004, name: '电机_欧亚', group: '3-欧亚组' },
            { no: 420005, name: '研发_冷机2', group: '3-欧亚组' },
            { no: 420006, name: '研发_欧亚2', group: '3-欧亚组' },
            { no: 420011, name: '大办_欧亚', group: '3-欧亚组' },
            { no: 420009, name: '大办_冰山2', group: '4-冰山2组' },
            { no: 420012, name: '大办_冰山', group: '5-冰山组' },
            { no: 420015, name: '电机_冰山', group: '5-冰山组' },
            { no: 420013, name: '电机_扬子1', group: '6-扬子组' },
            { no: 420014, name: '电机_扬子2', group: '6-扬子组' }
        ];
        
        // 初始化所有设备的 equipmentMap
        const equipmentMap = {};
        allEquipments.forEach(equip => {
            equipmentMap[equip.name] = {
                name: equip.name,
                no: equip.no,
                group: equip.group,
                dataMap: {}
            };
        });
        
        const timeSet = new Set();

        rawData.forEach(row => {
            // 只处理单个设备数据，跳过汇总行
            if (!row.no || row.category.includes('全厂') || (row.name_display && row.name_display.includes('总计'))) {
                return;
            }
            
            // 根据日期模式提取不同格式的时间
            let timeKey;
            if (dateMode === 'month') {
                // 月模式：取完整日期 YYYY-MM-DD
                timeKey = row.date ? row.date : '';
            } else {
                // 日模式：取日期+小时 YYYY-MM-DD HH:mm
                timeKey = row.date ? row.date.substring(0, 16) : '';
            }
            
            if (!timeKey) return;
            
            timeSet.add(timeKey);
            
            // 根据参数类型选择数据
            let value = null;
            if (paramType === 'power') {
                value = row.elec_kwh !== null && row.elec_kwh !== undefined ? parseFloat(row.elec_kwh) : null;
            } else if (paramType === 'heat') {
                value = row.heat_qty !== null && row.heat_qty !== undefined ? parseFloat(row.heat_qty) : null;
            } else {
                value = row.cop_value !== null && row.cop_value !== undefined ? parseFloat(row.cop_value) : null;
            }

            if (value === null) return;
            
            var decimals = (paramType === 'power') ? 1 : 2;
            var formattedValue = value.toFixed(decimals);

            // 处理设备数据
            const equipmentName = row.name_display || row.item_name;
            
            // 如果设备不在预定义列表中，动态添加
            if (!equipmentMap[equipmentName]) {
                equipmentMap[equipmentName] = {
                    name: equipmentName,
                    no: row.no,
                    group: row.category,
                    dataMap: {}
                };
            }
            equipmentMap[equipmentName].dataMap[timeKey] = formattedValue;
        });

        // 生成完整的时间轴（包含所有时间点，即使没有数据）
        const axis = this.generateCompleteTimeAxis(startDate, endDate, dateMode);
        
        console.log('【按设备数据处理】');
        console.log('dateMode:', dateMode);
        console.log('startDate:', startDate, 'endDate:', endDate);
        console.log('生成的时间轴数量:', axis.length);
        console.log('完整时间轴（前10个）:', axis.slice(0, 10));
        console.log('完整时间轴（后10个）:', axis.slice(-10));
        console.log('设备数量:', Object.keys(equipmentMap).length);
        
        // 输出每个设备的dataMap的key
        Object.keys(equipmentMap).forEach(equipName => {
            const equipment = equipmentMap[equipName];
            const keys = Object.keys(equipment.dataMap).sort();
            console.log(`设备 ${equipName}:`);
            console.log(`  - 数据key数量: ${keys.length}`);
            console.log(`  - 数据key（全部）:`, keys);
            console.log(`  - 数据值（全部）:`, keys.map(k => equipment.dataMap[k]));
        });
        
        // 测试：检查时间轴和数据key是否匹配
        console.log('时间轴和数据key匹配测试:');
        Object.keys(equipmentMap).forEach(equipName => {
            const equipment = equipmentMap[equipName];
            const matchCount = axis.filter(timeKey => equipment.dataMap[timeKey] !== undefined).length;
            console.log(`  ${equipName}: ${matchCount}/${axis.length} 个时间点有数据`);
        });

        // 格式化X轴标签
        let axisLabels;
        if (dateMode === 'month') {
            // 月模式：显示日期 MM-DD
            axisLabels = axis.map(dt => {
                const month = dt.substring(5, 7);
                const day = dt.substring(8, 10);
                return `${month}-${day}`;
            });
        } else {
            // 日模式：根据是否跨天决定显示格式
            const dates = new Set();
            axis.forEach(dt => {
                const date = dt.substring(0, 10);
                dates.add(date);
            });
            
            const isMultiDay = dates.size > 1;
            axisLabels = axis.map(dt => {
                const time = dt.substring(11, 16);
                if (isMultiDay) {
                    // 多天：显示 MM-DD HH:mm
                    const month = dt.substring(5, 7);
                    const day = dt.substring(8, 10);
                    return `${month}-${day} ${time}`;
                } else {
                    // 单天：只显示 HH:mm
                    return time;
                }
            });
        }

        // 为每个设备分配唯一的高对比度颜色（15个设备对应15种颜色）
        const deviceColors = [
            '#FF0000',  // 1. 红
            '#00FF00',  // 2. 绿
            '#0000FF',  // 3. 蓝
            '#FFFF00',  // 4. 黄
            '#FF00FF',  // 5. 洋红
            '#00FFFF',  // 6. 青
            '#FF8000',  // 7. 橙
            '#8000FF',  // 8. 紫
            '#FF0080',  // 9. 玫红
            '#00FF80',  // 10. 春绿
            '#0080FF',  // 11. 天蓝
            '#FF80FF',  // 12. 粉紫
            '#80FF00',  // 13. 黄绿
            '#FFFFFF',  // 14. 白
            '#FF8080'   // 15. 浅红
        ];

        const series = [];

        // 为每个设备按顺序分配唯一颜色
        let colorIndex = 0;
        Object.values(equipmentMap).forEach(equipment => {
            // 直接按顺序分配颜色，确保每个设备都有独特的颜色
            const color = deviceColors[colorIndex % deviceColors.length];
            colorIndex++;

            const data = axis.map(timeKey => {
                const value = equipment.dataMap[timeKey];
                return value !== undefined ? value : '';  // 改为空字符串
            });

            series.push({
                name: equipment.name,
                color: color,
                data: data
            });
            
            // 输出每个设备的详细数据
            const validCount = data.filter(v => v !== '').length;
            const emptyCount = data.filter(v => v === '').length;
            console.log(`设备 ${equipment.name}:`);
            console.log(`  - 有效数据=${validCount}, 空数据=${emptyCount}`);
            console.log(`  - 完整数据数组:`, data);
            console.log(`  - 原始数据映射:`, equipment.dataMap);
        });
        
        console.log('最终返回的系列数量:', series.length);
        console.log('='.repeat(80));

        return {
            axis: axisLabels,  // 使用格式化后的标签
            series: series
        };
    },

    // 按时间查询（使用相同的SQL，但按日期分组展示）
    getMockData_ByTime: async function(params) {
        // 如果没有传参数，返回模拟数据
        if (!params || !params.startDate || !params.endDate) {
            var axis = this.generateTimeAxis();
            var baseValue = params && params.param === 'power' ? 45 : 2.0;
            return {
                axis: axis,
                series: [
                    { name: '2025-11-01', color: '#f39c12', data: this.randCurve(baseValue, axis.length) },
                    { name: '2025-11-02', color: '#9b59b6', data: this.randCurve(baseValue - 0.1, axis.length) },
                    { name: '2025-11-03', color: '#3498db', data: this.randCurve(baseValue + 0.1, axis.length) }
                ]
            };
        }

        try {
            const dateMode = params.dateMode || 'day';
            const sql = this.generateSQL_ByEquipment(params.startDate, params.endDate, dateMode);
            
            // 输出SQL到控制台
            console.log('='.repeat(80));
            console.log('【按时间查询 SQL】');
            console.log('查询参数:', {
                startDate: params.startDate,
                endDate: params.endDate,
                dateMode: dateMode,
                unit: params.unit,
                param: params.param
            });
            console.log('SQL语句:');
            console.log(sql);
            console.log('='.repeat(80));
            
            const response = await this.sendSQL(sql);
            
            // 输出查询结果
            console.log('查询结果数量:', response?.data?.length || 0);
            if (response?.data && response.data.length > 0) {
                console.log('全部查询数据:', response.data);
            }
            console.log('='.repeat(80));
            
            if (!response || !response.data || response.data.length === 0) {
                throw new Error('没有查询到数据');
            }

            // 获取选中的设备和参数类型
            const selectedUnit = params.unit || 'all';
            const paramType = params.param || 'cop';
            return this.processTimeData(response.data, selectedUnit, paramType, dateMode, params.startDate, params.endDate);
        } catch (error) {
            console.error('查询失败:', error);
            throw error;
        }
    },

    // 处理按时间查询的数据
    processTimeData: function(rawData, selectedUnit, paramType, dateMode, startDate, endDate) {
        paramType = paramType || 'cop'; // 默认为COP
        dateMode = dateMode || 'day';   // 默认为日模式
        
        // 按日期分组
        const dateMap = {};
        const timeSet = new Set();

        // 分组名称映射
        const groupNameMap = {
            'group_ouya': '3-欧亚组',
            'group_yangzi': '6-扬子组',
            'group_tianjia': '1-天加组',
            'group_yashi': '4-雅士组',
            'group_bingshan': '5-冰山组',
            'group_lengji': '2-冷机组'
        };

        rawData.forEach(row => {
            let dateKey, time;
            
            if (dateMode === 'month') {
                // 月模式：dateKey是月份（yyyy-MM），time是日期（DD）
                const fullDate = row.date ? row.date.substring(0, 10) : ''; // YYYY-MM-DD
                if (!fullDate) return;
                
                dateKey = fullDate.substring(0, 7); // 提取 YYYY-MM (用于分组，每个月一条线)
                time = fullDate.substring(8, 10);   // 提取 DD (日期，X轴坐标)
            } else {
                // 日模式：按日期和小时
                // 重要：7:00-次日6:59算一天，需要调整dateKey
                const fullDateTime = row.date ? row.date : '';
                if (!fullDateTime) return;
                
                const currentDate = fullDateTime.substring(0, 10); // YYYY-MM-DD
                const currentHour = parseInt(fullDateTime.substring(11, 13)); // HH
                time = fullDateTime.substring(11, 16); // HH:mm
                
                // 如果是0:00-6:59，属于前一天的逻辑日
                if (currentHour < 7) {
                    const dateObj = new Date(currentDate);
                    dateObj.setDate(dateObj.getDate() - 1);
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    dateKey = `${year}-${month}-${day}`;
                } else {
                    dateKey = currentDate;
                }
            }
            
            if (!dateKey || !time) return;
            
            // 根据参数类型选择数据
            let value = null;
            if (paramType === 'power') {
                value = row.elec_kwh !== null && row.elec_kwh !== undefined ? parseFloat(row.elec_kwh) : null;
            } else if (paramType === 'heat') {
                value = row.heat_qty !== null && row.heat_qty !== undefined ? parseFloat(row.heat_qty) : null;
            } else {
                value = row.cop_value !== null && row.cop_value !== undefined ? parseFloat(row.cop_value) : null;
            }

            if (value === null) return;

            // 判断数据类型
            const isTotal = row.category && row.category.includes('全厂');
            const isGroupSummary = row.name_display && row.name_display.includes('总计');
            const isEquipment = row.no && !isTotal && !isGroupSummary;

            // 根据选择过滤数据
            let shouldInclude = false;
            
            if (selectedUnit === 'total') {
                // 只显示全厂综合
                shouldInclude = isTotal;
            } else if (selectedUnit.startsWith('group_')) {
                // 显示指定分组的汇总
                const targetGroup = groupNameMap[selectedUnit];
                shouldInclude = isGroupSummary && row.category === targetGroup;
            } else if (selectedUnit) {
                // 显示指定设备（通过no匹配）
                shouldInclude = isEquipment && row.no === parseInt(selectedUnit);
            }

            if (!shouldInclude) return;

            // 构建dateKey（月模式下dateKey就是月份）
            let displayName = '';
            
            if (isTotal) {
                displayName = '全厂综合';
            } else if (isGroupSummary) {
                displayName = row.name_display;
            } else if (isEquipment) {
                displayName = row.name_display || row.item_name;
            }

            if (!dateMap[dateKey]) {
                dateMap[dateKey] = { 
                    displayName: displayName,
                    summaryType: isTotal ? 'total' : (isGroupSummary ? 'group' : 'normal'),
                    data: {}
                };
            }

            if (!dateMap[dateKey].data[time]) {
                dateMap[dateKey].data[time] = { sum: 0, count: 0 };
            }
            dateMap[dateKey].data[time].sum += value;
            dateMap[dateKey].data[time].count += 1;
            timeSet.add(time);
        });

        // 生成完整的时间轴
        let axis;
        if (dateMode === 'month') {
            // 月模式：X轴为日期（DD格式，匹配数据存储的格式）
            axis = [];
            for (let day = 1; day <= 31; day++) {
                axis.push(String(day).padStart(2, '0'));
            }
        } else {
            // 日模式：生成7:00到次日7:00的完整小时
            // 只取时间部分 HH:mm 用于匹配数据
            axis = [];
            for (let hour = 7; hour <= 23; hour++) {
                axis.push((hour < 10 ? '0' + hour : hour) + ':00');
            }
            for (let hour = 0; hour <= 6; hour++) {
                axis.push((hour < 10 ? '0' + hour : hour) + ':00');
            }
        }

        // X轴标签
        let axisLabels;
        if (dateMode === 'month') {
            // 月模式：显示日期（1-31号）
            axisLabels = axis.map(day => parseInt(day) + '日');
        } else {
            // 日模式：显示时间
            axisLabels = axis;
        }

        // 日期颜色 - 高对比度纯色系
        const colors = [
            '#FF0000',  // 红
            '#00FF00',  // 绿
            '#0000FF',  // 蓝
            '#FFFF00',  // 黄
            '#FF00FF',  // 洋红
            '#00FFFF',  // 青
            '#FF8000',  // 橙
            '#8000FF',  // 紫
            '#FF0080',  // 玫红
            '#00FF80',  // 春绿
            '#0080FF',  // 天蓝
            '#FF80FF',  // 粉紫
            '#80FF00',  // 黄绿
            '#FFFFFF',  // 白
            '#FF8080',  // 浅红
            '#80FF80',  // 浅绿
            '#8080FF',  // 浅蓝
            '#FFFF80',  // 浅黄
            '#FF80C0',  // 粉红
            '#80FFC0'   // 浅青绿
        ];

        // 生成系列数据
        const series = [];
        let colorIndex = 0;

        Object.keys(dateMap).sort().forEach((dateKey) => {
            const dateInfo = dateMap[dateKey];
            
            // 生成该月/日的数据点
            const data = axis.map(time => {
                const timeData = dateInfo.data[time];
                if (timeData) {
                    const avg = timeData.sum / timeData.count;
                    var decimals = (paramType === 'power' || paramType === 'heat') ? 1 : 2;
                    return avg.toFixed(decimals);
                }
                return '';  // 改为空字符串
            });

            // 月模式：dateKey是yyyy-MM格式，显示为月份
            // 日模式：dateKey是yyyy-MM-DD格式，显示为日期
            let displayKey = dateKey;
            if (dateMode === 'month') {
                // 月模式：显示为 "2024-01月"
                displayKey = dateKey + '月';
            }

            let seriesItem = {
                name: displayKey + (dateInfo.displayName ? ' (' + dateInfo.displayName + ')' : ''),
                data: data
            };

            // 根据类型设置样式
            if (dateInfo.summaryType === 'total') {
                seriesItem.color = '#f44336';
                seriesItem.lineStyle = 'bold';
            } else if (dateInfo.summaryType === 'group') {
                seriesItem.color = '#ff9800';
                seriesItem.lineStyle = 'dashed';
            } else {
                seriesItem.color = colors[colorIndex % colors.length];
                colorIndex++;
            }

            series.push(seriesItem);
        });

        return {
            axis: axisLabels,  // 返回格式化的标签
            series: series
        };
    }
};