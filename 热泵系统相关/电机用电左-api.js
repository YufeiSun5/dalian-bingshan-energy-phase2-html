// =========================================
// 电力监控 - 25点整点对比 (修复版)
// =========================================

class TotalPowerFinal {
    constructor() {
        this.config = {
            apiBaseUrl: 'http://192.168.7.229:8004',
            updateInterval: 60000, 
            retryTimes: 3
        };

        this.state = {
            timer: null,
            isUpdating: false,
            currentIndex: 0,
            autoPlayTimer: null,
            totalPoints: 0
        };
    }

    // =========================================
    // HTTP 请求
    // =========================================
    async request(url, options = {}) {
        try {
            const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error('[请求错误]', e);
            throw e;
        }
    }

    async sendSQL(sql) {
        return await this.request(`${this.config.apiBaseUrl}/api/sql/run-sql`, {
            method: 'POST',
            body: JSON.stringify({ sql })
        });
    }


    // =========================================
    // SQL 生成
    // =========================================
    generateSQL() {
        const sql = `
            SELECT
                DATE_FORMAT(STR_TO_DATE('07:00:00', '%T') + INTERVAL t.i HOUR, '%H:00') AS time_label,
                ROUND(IFNULL(y.usage_val, 0), 2) AS yesterday,
                ROUND(IFNULL(d.usage_val, 0), 2) AS today
            FROM sys_ints t

            -- 【昨天数据】
            LEFT JOIN (
                SELECT 
                    TIMESTAMPDIFF(HOUR, DATE_ADD(DATE(NOW() - INTERVAL 7 HOUR) - INTERVAL 1 DAY, INTERVAL 7 HOUR), STR_TO_DATE(group_h, '%Y-%m-%d %H')) as hour_idx,
                    SUM(hour_usage) as usage_val
                FROM (
                    SELECT no, DATE_FORMAT(date, '%Y-%m-%d %H') as group_h, 
                           if(LEAD(no,1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) = no and TIMESTAMPDIFF(day, DATE_FORMAT(date, '%Y-%m-%d %H:00:00') ,LEAD(DATE_FORMAT(date, '%Y-%m-%d %H:00:00'),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00'))) <=1 , LEAD(MIN(KWH),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')),   MAX(KWH)) - MIN(KWH) as hour_usage
                    FROM data_all FORCE INDEX (date_no_KWH)
                    WHERE date >= DATE_ADD(DATE(NOW() - INTERVAL 7 HOUR) - INTERVAL 1 DAY, INTERVAL 7 HOUR)
                      AND date <  DATE_ADD(DATE(NOW() - INTERVAL 7 HOUR), INTERVAL 7 HOUR)
                      AND no IN (420003, 420004, 420013, 420014, 420015)
                      AND kwh != 0
                    GROUP BY no, group_h
                ) raw_y
                GROUP BY hour_idx
            ) y ON t.i = y.hour_idx

            -- 【今天数据】
            LEFT JOIN (
                SELECT 
                    TIMESTAMPDIFF(HOUR, DATE_ADD(DATE(NOW() - INTERVAL 7 HOUR), INTERVAL 7 HOUR), STR_TO_DATE(group_h, '%Y-%m-%d %H')) as hour_idx,
                    SUM(hour_usage) as usage_val
                FROM (
                    SELECT no, DATE_FORMAT(date, '%Y-%m-%d %H') as group_h, 
                           if(LEAD(no,1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) = no and TIMESTAMPDIFF(day, DATE_FORMAT(date, '%Y-%m-%d %H:00:00') ,LEAD(DATE_FORMAT(date, '%Y-%m-%d %H:00:00'),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00'))) <=1 , LEAD(MIN(KWH),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')),   MAX(KWH)) - MIN(KWH) as hour_usage
                    FROM data_all FORCE INDEX (date_no_KWH)
                    WHERE date >= DATE_ADD(DATE(NOW() - INTERVAL 7 HOUR), INTERVAL 7 HOUR)
                      AND date <  DATE_ADD(DATE(NOW() - INTERVAL 7 HOUR) + INTERVAL 1 DAY, INTERVAL 7 HOUR)
                      AND no IN (420003, 420004, 420013, 420014, 420015)
                      AND kwh != 0
                    GROUP BY no, group_h
                ) raw_d
                GROUP BY hour_idx
            ) d ON t.i = d.hour_idx

            WHERE t.i <= 24
            ORDER BY t.i
        `;
        return sql;
    }

    // =========================================
    // 数据对齐转换 (适配新SQL结构)
    // =========================================
    processNewDataFormat(rows) {
        const labels = [];
        const todayArr = [];
        const yestArr = [];

        rows.forEach(row => {
            labels.push(row.time_label);
            todayArr.push(row.today > 0 ? row.today : null);
            yestArr.push(row.yesterday > 0 ? row.yesterday : null);
        });

        return { labels, todayArr, yestArr };
    }


    async fetchData() {
        try {
            const sql = this.generateSQL();
            const res = await this.sendSQL(sql);
            if (!res || !res.data) return { labels: [], todayArr: [], yestArr: [] };

            return this.processNewDataFormat(res.data);
        } catch (e) {
            console.error('[数据获取失败]', e);
            // 返回测试数据
            return {
                labels: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
                todayArr: [100, 200, 150, 180, 220, 190, 210, null, null, null],
                yestArr: [80, 120, 180, 160, 200, 190, 220, 240, 230, 250]
            };
        }
    }

    // =========================================
    // [关键修复] 直接设置 ECharts 配置
    // =========================================
    async updateChart() {
        if (this.state.isUpdating) return;
        this.state.isUpdating = true;

        try {
            const { labels, todayArr, yestArr } = await this.fetchData();
            const chart = window._chartInstance;
            
            if (!chart) {
                console.error('[错误] 图表实例不存在');
                this.state.isUpdating = false;
                return;
            }

            this.state.totalPoints = labels.length;

            // 直接设置完整的 ECharts 配置（不使用 updateChart 函数）
            chart.setOption({
                backgroundColor: '#395998',
                tooltip: {
                    trigger: 'axis',
                    show: true,
                    confine: true,
                    formatter: function(params) {
                        if (!params || !params.length) return '';
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(item => {
                            if (item.value != null) {
                                result += item.marker + ' ' + item.seriesName + ': ' + item.value + ' kWh<br/>';
                            }
                        });
                        return result;
                    },
                    axisPointer: { type: 'line', lineStyle: { type: 'dashed', color: '#fff' } }
                },
                legend: {
                    top: 10,
                    left: 'center',
                    textStyle: { color: '#fff' },
                    data: ['电机今日', '电机昨日']
                },
                grid: { top: 50, bottom: 30, left: 50, right: 50 },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: labels,
                    axisLabel: { color: '#fff' },
                    axisLine: { lineStyle: { color: '#fff' } }
                },
                yAxis: {
                    type: 'value',
                    name: '用电量 (kWh)',
                    nameTextStyle: { color: '#fff' },
                    axisLabel: { color: '#fff' },
                    axisLine: { lineStyle: { color: '#fff' } },
                    splitLine: { lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.2)' } }
                },
                series: [
                    {
                        name: '电机今日',
                        type: 'line',
                        smooth: false,  // 使用直线
                        data: todayArr,
                        lineStyle: { color: '#00f2ff' },
                        itemStyle: { color: '#00f2ff' }
                    },
                    {
                        name: '电机昨日',
                        type: 'line',
                        smooth: false,  // 使用直线
                        data: yestArr,
                        lineStyle: { color: '#ff8c00' },
                        itemStyle: { color: '#ff8c00' }
                    }
                ]
            });

            console.log(`[数据更新] ${labels.length}个点位`);
            
            // 启动自动播放
            this.startAutoPlay(chart);
            
        } catch (err) {
            console.error('更新失败', err);
        }

        this.state.isUpdating = false;
    }

    // =========================================
    // 自动播放
    // =========================================
    startAutoPlay(chart) {
        if (this.state.autoPlayTimer) return;
        
        this.state.autoPlayTimer = setInterval(() => {
            const totalPoints = this.state.totalPoints;
            if (totalPoints === 0) return;
            
            // 找到下一个有效的昨日数据点
            let nextIndex = this.state.currentIndex;
            let attempts = 0;
            
            while (attempts < totalPoints) {
                nextIndex = (nextIndex + 1) % totalPoints;
                const option = chart.getOption();
                const series = option.series || [];
                
                // 检查昨日数据系列（索引1）是否有数据
                const yesterdaySeries = series[1]; // 电机昨日系列
                if (yesterdaySeries && yesterdaySeries.data && yesterdaySeries.data[nextIndex] != null) {
                    this.state.currentIndex = nextIndex;
                    chart.dispatchAction({
                        type: 'showTip',
                        seriesIndex: 1, // 绑定到昨日数据系列
                        dataIndex: nextIndex
                    });
                    break;
                }
                attempts++;
            }
        }, 2000);
        
        console.log('[AutoPlay] 已启动 - 绑定到昨日数据');
    }

    start() {
        if (this.state.timer) return;
        this.updateChart();
        this.state.timer = setInterval(() => this.updateChart(), this.config.updateInterval);
    }
}

// 启动
const powerFinal = new TotalPowerFinal();
window.powerFinal = powerFinal;

window.addEventListener('DOMContentLoaded', () => {
    // 初始化图表
    const dom = document.getElementById('main-chart');
    const chart = echarts.init(dom);
    window._chartInstance = chart;
    
    // 监听窗口缩放
    window.addEventListener('resize', () => chart.resize());
    
    // 启动数据获取
    setTimeout(() => powerFinal.start(), 500);
});
