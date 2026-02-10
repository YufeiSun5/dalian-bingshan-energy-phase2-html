/**
 * 污水处理数据配置中心
 * 包含：图表初始化、模拟数据生成
 */
window.PAGE_CONFIG = {
    charts: {}, // 存储图表实例

    // 初始化空图表
    initCharts: function() {
        const ids = ['chart-water-usage', 'chart-power-usage', 'chart-per-unit', 'chart-cost-trend', 'chart-sludge'];
        ids.forEach(id => {
            const dom = document.getElementById(id);
            if(dom) {
                this.charts[id] = echarts.init(dom);
            }
        });
    },

    // 调整大小
    resizeCharts: function() {
        Object.values(this.charts).forEach(c => c.resize());
    },

    /**
     * 模拟后端接口
     * @param {string} type 'month' | 'year'
     * @param {string} value '2025-10' | '2025'
     */
    fetchData: function(type, value) {
        return new Promise((resolve) => {
            console.log(`[模拟SQL触发] SELECT * FROM sewage_data WHERE type='${type}' AND date='${value}'`);
            
            setTimeout(() => {
                if (type === 'month') {
                    resolve(this.getMockData_Month(value));
                } else {
                    resolve(this.getMockData_Year(value));
                }
            }, 600); // 模拟网络延迟
        });
    },

    // 更新图表数据
    updateCharts: function(data) {
        // 通用样式
        const commonGrid = { top: 35, right: 10, bottom: 25, left: 45 };
        const textColor = '#b9d3f4';
        const axisLineColor = '#2a6dc8';
        const tooltip = { trigger: 'axis', backgroundColor: 'rgba(29, 56, 111, 0.9)', borderColor: '#2a6dc8', textStyle: { color: '#fff' } };

        // 1. 月处理水量
        this.charts['chart-water-usage'].setOption({
            backgroundColor: 'transparent',
            tooltip: tooltip,
            title: { text: data.titles.water, left: 'center', textStyle: { color: '#fff', fontSize: 13 } },
            grid: commonGrid,
            xAxis: { type: 'category', data: data.xAxis, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor } },
            yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { color: textColor } },
            series: [{ type: 'bar', data: data.series.water, itemStyle: { color: '#c23531' }, barWidth: '40%' }]
        });

        // 2. 月用电量
        this.charts['chart-power-usage'].setOption({
            backgroundColor: 'transparent',
            tooltip: tooltip,
            title: { text: data.titles.power, left: 'center', textStyle: { color: '#fff', fontSize: 13 } },
            grid: commonGrid,
            xAxis: { type: 'category', data: data.xAxis, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor } },
            yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { color: textColor } },
            series: [{ type: 'bar', data: data.series.power, itemStyle: { color: '#c23531' }, barWidth: '40%' }]
        });

        // 3. 每台污水量
        this.charts['chart-per-unit'].setOption({
            backgroundColor: 'transparent',
            tooltip: tooltip,
            title: { text: '每台污水量 (吨/台)', left: 'center', textStyle: { color: '#fff', fontSize: 13 } },
            grid: commonGrid,
            xAxis: { type: 'category', data: data.xAxis, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor } },
            yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { color: textColor } },
            series: [{ type: 'bar', data: data.series.perUnit, itemStyle: { color: '#7b58a7' }, barWidth: '40%' }]
        });

        // 4. 费用趋势
        this.charts['chart-cost-trend'].setOption({
            backgroundColor: 'transparent',
            tooltip: tooltip,
            title: { text: '每吨污水费用 (元)', left: 'center', textStyle: { color: '#fff', fontSize: 13 } },
            grid: commonGrid,
            xAxis: { type: 'category', data: data.xAxis, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor } },
            yAxis: { type: 'value', min: 0, splitLine: { show: false }, axisLabel: { color: textColor } },
            series: [{ type: 'bar', data: data.series.cost, itemStyle: { color: '#32a6cb' }, barWidth: '40%' }]
        });

        // 5. 污泥量
        this.charts['chart-sludge'].setOption({
            backgroundColor: 'transparent',
            tooltip: tooltip,
            title: { text: '污泥量 (吨)', left: 'center', textStyle: { color: '#fff', fontSize: 13 } },
            grid: commonGrid,
            xAxis: { type: 'category', data: data.xAxis, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor } },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: '#2a6dc8', type: 'dashed', opacity: 0.3 } }, axisLabel: { color: textColor } },
            series: [{ type: 'line', data: data.series.sludge, itemStyle: { color: '#81d4fa' }, lineStyle: { width: 3 }, symbol: 'circle', symbolSize: 6 }]
        });
    },

    // ===================================
    // 数据集 A：月度数据 (X轴: 天)
    // ===================================
    getMockData_Month: function(dateStr) {
        // 生成 1-30 的数组
        const days = Array.from({length: 30}, (_, i) => `${i + 1}日`);
        
        return {
            // 表格数据 (单价低，用量适中)
            tableData: {
                drugs: [
                    { price: '¥1.77', usage: '1650', cost: '¥2,920.50' },
                    { price: '¥5.44', usage: '0', cost: '¥0.00' },
                    { price: '¥12.84', usage: '16', cost: '¥205.44' },
                    { price: '¥22.13', usage: '22', cost: '¥486.86' }
                ],
                water: { price: '¥4.51', usage: '55.7', cost: '¥251.21' },
                power: { price: '¥0.62', usage: '19885', cost: '¥12,328.70' },
                totalCost: '¥16,192.71',
                metrics: { processAmount: '3005', costPerTon: '0.19', productAmount: '63512', waterPerUnit: '0.0473', sludge: '2' }
            },
            // 图表数据 (波动细节多)
            chartData: {
                titles: { water: '日处理水量 (吨)', power: '日用电量 (度)' },
                xAxis: days,
                series: {
                    water: this.randArr(30, 80, 150),   // 每天几十吨
                    power: this.randArr(30, 500, 800),  // 每天几百毒
                    perUnit: this.randArr(30, 0.03, 0.06, 3),
                    cost: this.randArr(30, 0.15, 0.25, 2),
                    sludge: this.randArr(30, 0.05, 0.2, 2)
                }
            }
        };
    },

    // ===================================
    // 数据集 B：年度数据 (X轴: 月)
    // ===================================
    getMockData_Year: function(yearStr) {
        // 生成 1-12 的数组
        const months = Array.from({length: 12}, (_, i) => `${i + 1}月`);

        return {
            // 表格数据 (累积值，数字很大)
            tableData: {
                drugs: [
                    { price: '¥1.77', usage: '19,800', cost: '¥35,046.00' },
                    { price: '¥5.44', usage: '120', cost: '¥652.80' },
                    { price: '¥12.84', usage: '192', cost: '¥2,465.28' },
                    { price: '¥22.13', usage: '264', cost: '¥5,842.32' }
                ],
                water: { price: '¥4.51', usage: '668.4', cost: '¥3,014.50' },
                power: { price: '¥0.62', usage: '238,620', cost: '¥147,944.40' },
                totalCost: '¥194,312.50', // 年度总费用
                metrics: { processAmount: '36,060', costPerTon: '0.18', productAmount: '762,144', waterPerUnit: '0.0470', sludge: '24' }
            },
            // 图表数据 (宏观趋势)
            chartData: {
                titles: { water: '月处理水量 (吨)', power: '月用电量 (度)' },
                xAxis: months,
                series: {
                    water: this.randArr(12, 2800, 3500),    // 每月几千吨
                    power: this.randArr(12, 20000, 30000),  // 每月几万度
                    perUnit: this.randArr(12, 0.4, 0.6, 2),
                    cost: this.randArr(12, 5.0, 5.8, 2),
                    sludge: this.randArr(12, 1.5, 3.0, 1)
                }
            }
        };
    },

    // 随机数生成器
    randArr: function(count, min, max, fixed=0) {
        return Array.from({length: count}, () => {
            let val = Math.random() * (max - min) + min;
            return fixed ? val.toFixed(fixed) : Math.floor(val);
        });
    }
};