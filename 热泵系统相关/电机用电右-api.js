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
            timeAnchors: {},
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
    // 时间计算 (25小时跨度)
    // =========================================
    calcTimeRanges() {
        const now = new Date();
        const currentHour = now.getHours();

        let todayStart = new Date(now);
        todayStart.setHours(7, 0, 0, 0);

        if (currentHour < 7) {
            todayStart.setDate(todayStart.getDate() - 1);
        }
        
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const yestStart = new Date(todayStart);
        yestStart.setDate(yestStart.getDate() - 1);
        const yestEnd = new Date(todayStart); 

        const fmt = (d) => {
            const pad = n => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:00:00`;
        };

        this.state.timeAnchors = {
            today: { startObj: todayStart, endObj: todayEnd, startStr: fmt(todayStart), endStr: fmt(todayEnd) },
            yest:  { startObj: yestStart,  endObj: yestEnd,  startStr: fmt(yestStart),  endStr: fmt(yestEnd) }
        };
    }

    // =========================================
    // SQL 生成
    // =========================================
    generateSQL() {
        this.calcTimeRanges();
        const { today } = this.state.timeAnchors;

        const sql = `
            SELECT
                DATE_FORMAT(STR_TO_DATE('07:00:00', '%T') + INTERVAL t.i HOUR, '%H:00') AS time_label,
								ROUND((sum_heat5 * 1000)/(elec.sum_elec1*3.6),2) as sum_rated1,  -- 冰山: sum_heat5(420015) / sum_elec1(420015)
								ROUND((sum_heat4 * 1000)/(elec.sum_elec2*3.6),2) as sum_rated2,  -- 扬子2: sum_heat4(420014) / sum_elec2(420014)
								ROUND((sum_heat3 * 1000)/(elec.sum_elec3*3.6),2) as sum_rated3,  -- 扬子1: sum_heat3(420013) / sum_elec3(420013)
								ROUND((sum_heat2 * 1000)/(elec.sum_elec4*3.6),2) as sum_rated4,  -- 冷机: sum_heat2(420003) / sum_elec4(420003)
								ROUND((sum_heat1 * 1000)/(elec.sum_elec5*3.6),2) as sum_rated5   -- 欧亚: sum_heat1(420004) / sum_elec5(420004)
            FROM sys_ints t

            -- 【电能数据】
            LEFT JOIN (
                 select 	DATE_FORMAT(r.jDay, '%H') as date,  
									sum(case when elec_name in ('elec_420015') then sum_elec else 0 end) AS sum_elec1,
									sum(case when elec_name in ('elec_420014') then sum_elec else 0 end) as sum_elec2,   
									sum(case when elec_name in ('elec_420013') then sum_elec else 0 end) as sum_elec3,
									sum(case when elec_name in ('elec_420003') then sum_elec else 0 end) as sum_elec4,
									sum(case when elec_name in ('elec_420004') then sum_elec else 0 end) as sum_elec5
									from (  

											SELECT DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d %H') as jDay 
											,CONCAT('elec', '_', NO) as elec_name	
											,if(LEAD(no,1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) = no , LEAD(MIN(KWH),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')),   MAX(KWH))- MIN(KWH) AS sum_elec	
											FROM data_all FORCE INDEX (date_no_KWH) 	
											WHERE date <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')  
											AND date >= DATE_FORMAT(now() , '%Y-%m-%d 07:00:00')	
											and kwh != 0 and kwh != 99999999		
											and no in (420001,420002,420003,420004,420005,420006,420007,420008,420009,420010,420011,420012,420013,420014,420015,320022,320024)	
											GROUP BY no,DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d %H') 
									) r 
									group by r.jDay

            ) elec ON t.i = elec.date

            -- 【热能数据】
            LEFT JOIN (
                 select 	DATE_FORMAT(r.jDay, '%H') as date,  
									sum(case when heat_name in ('heat_420015') then sum_heat else 0 end) AS sum_heat5,
									sum(case when heat_name in ('heat_420014') then sum_heat else 0 end) as sum_heat4,   
									sum(case when heat_name in ('heat_420013') then sum_heat else 0 end ) as sum_heat3, 
									sum(case when heat_name in ('heat_420003') then sum_heat else 0 end ) as sum_heat2,
									sum(case when heat_name in ('heat_420004') then sum_heat else 0 end ) as sum_heat1			 
									from (  
											select DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d %H') as jDay 
											,CONCAT('heat', '_', NO) as heat_name	
											,if(LEAD(no,1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) = no , LEAD(MIN(heat_quantity),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')),   MAX(heat_quantity))- MIN(heat_quantity) AS sum_heat	
											FROM data_heat_quantity
											WHERE date <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')  
											AND date >= DATE_FORMAT(now() , '%Y-%m-%d 07:00:00')	
											and heat_quantity != 0 and heat_quantity != 99999999		
											and no in (420001,420002,420003,420004,420005,420006,420007,420008,420009,420010,420011,420012,420013,420014,420015)	
											GROUP BY no,DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d %H') 
									) r 
									group by r.jDay
            ) heat ON t.i = heat.date

            WHERE t.i <= 24
            ORDER BY t.i
        `;
        return sql;
    }

    // =========================================
    // 数据对齐转换
    // =========================================
    mapDataToArray(rows, type, startTimeObj) {
        const result = new Array(25).fill(null);
        const startMs = startTimeObj.getTime();

        rows.forEach(row => {
            if (row.type !== type) return;

            const currentMs = new Date(row.time_point).getTime();
            const diffHours = Math.round((currentMs - startMs) / (1000 * 60 * 60));

            if (diffHours >= 0 && diffHours < 25) {
                result[diffHours] = parseFloat(row.total_val);
            }
        });
        return result;
    }

    generateLabels() {
        const labels = [];
        let h = 7;
        for (let i = 0; i < 25; i++) {
            const hour = h % 24;
            const str = hour.toString().padStart(2, '0') + ':00';
            labels.push(str);
            h++;
        }
        return labels;
    }
	// =========================================
    // 数据对齐转换 (适配新SQL结构)
    // =========================================
    processNewDataFormat(rows) {
        const labels = [];
        const rebeng1Arr = [];
        const rebeng2Arr = [];
		const rebeng3Arr = [];
		const rebeng4Arr = [];
		const rebeng5Arr = [];

        rows.forEach(row => {
            labels.push(row.time_label);
            rebeng1Arr.push(row.sum_rated1 > 0 ? row.sum_rated1 : null);
            rebeng2Arr.push(row.sum_rated2 > 0 ? row.sum_rated2 : null);
			rebeng3Arr.push(row.sum_rated3 > 0 ? row.sum_rated3 : null);
			rebeng4Arr.push(row.sum_rated4 > 0 ? row.sum_rated4 : null);
			rebeng5Arr.push(row.sum_rated5 > 0 ? row.sum_rated5 : null);
        });

        return { labels, rebeng1Arr, rebeng2Arr,rebeng3Arr,rebeng4Arr,rebeng5Arr };
    }
    async fetchData() {
        try {
            const sql = this.generateSQL();
            
            // 【调试】输出完整的 SQL
            console.log('='.repeat(80));
            console.log('【电机用电右 - SQL查询】');
            console.log('查询时间:', new Date().toLocaleString());
            console.log('时间范围:');
            console.log('  开始:', new Date().toISOString().substring(0, 10) + ' 07:00:00');
            console.log('  结束:', new Date(Date.now() + 24*60*60*1000).toISOString().substring(0, 10) + ' 08:00:00');
            console.log('SQL语句:');
            console.log(sql);
            console.log('='.repeat(80));
            
            const res = await this.sendSQL(sql);
            
            // 【调试】输出查询结果
            console.log('='.repeat(80));
            console.log('【电机用电右 - 查询结果】');
            console.log('返回数据条数:', res?.data?.length || 0);
            if (res?.data && res.data.length > 0) {
                console.log('完整数据:');
                console.table(res.data);
                
                // 【新增】输出第一条数据的所有字段名
                console.log('\n第一条数据的所有字段:');
                console.log(Object.keys(res.data[0]));
                
                // 检查热量数据
                console.log('\n热量数据检查:');
                res.data.forEach((row, idx) => {
                    console.log(`${row.time_label}: heat1=${row.sum_heat1 || 0}, heat2=${row.sum_heat2 || 0}, heat3=${row.sum_heat3 || 0}, heat4=${row.sum_heat4 || 0}, heat5=${row.sum_heat5 || 0}`);
                });
                
                // 检查电量数据
                console.log('\n电量数据检查:');
                res.data.forEach((row, idx) => {
                    console.log(`${row.time_label}: elec1=${row.sum_elec1 || 0}, elec2=${row.sum_elec2 || 0}, elec3=${row.sum_elec3 || 0}, elec4=${row.sum_elec4 || 0}, elec5=${row.sum_elec5 || 0}`);
                });
                
                // 检查 COP 数据
                console.log('\nCOP 数据检查:');
                res.data.forEach((row, idx) => {
                    console.log(`${row.time_label}: cop1=${row.sum_rated1 || 0}, cop2=${row.sum_rated2 || 0}, cop3=${row.sum_rated3 || 0}, cop4=${row.sum_rated4 || 0}, cop5=${row.sum_rated5 || 0}`);
                });
            }
            console.log('='.repeat(80));
            
            if (!res || !res.data) return { labels: [], rebeng1Arr: [], rebeng2Arr: [], rebeng3Arr: [], rebeng4Arr: [], rebeng5Arr: [] };
			return this.processNewDataFormat(res.data);
            /*const labels = this.generateLabels();
            const rebeng1Arr = this.mapDataToArray(res.data, '热泵1', this.state.timeAnchors.today.startObj);
            const rebeng2Arr = this.mapDataToArray(res.data, '热泵2', this.state.timeAnchors.today.startObj);
            const rebeng3Arr = this.mapDataToArray(res.data, '热泵3', this.state.timeAnchors.today.startObj);
            const rebeng4Arr = this.mapDataToArray(res.data, '热泵4', this.state.timeAnchors.today.startObj);
            const rebeng5Arr = this.mapDataToArray(res.data, '热泵5', this.state.timeAnchors.today.startObj);
        

            return { labels, rebeng1Arr, rebeng2Arr, rebeng3Arr, rebeng4Arr, rebeng5Arr};*/
        } catch (e) {
            console.error('[数据获取失败]', e);
            // 返回测试数据
            return {
                labels: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
                rebeng1Arr: [100, 200, 150, 180, 220, 190, 210, null, null, null],
                rebeng2Arr: [80, 120, 180, 160, 200, 190, 220, 240, 230, 250],
                rebeng3Arr: [50, 80, 90, 100, 110, 95, 105, 120, 115, 125],
                rebeng4Arr: [60, 90, 100, 110, 120, 105, 115, 130, 125, 135],
                rebeng5Arr: [70, 100, 110, 120, 130, 115, 125, 140, 135, 145]
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
            const { labels, rebeng1Arr, rebeng2Arr, rebeng3Arr, rebeng4Arr, rebeng5Arr} = await this.fetchData();
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
                                result += item.marker + ' ' + item.seriesName + ': ' + item.value + '<br/>';
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
                    data: ['冰山', '扬子2', '扬子1', '冷机', '欧亚']
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
                    name: '能效COP',
                    nameTextStyle: {color: '#fff' },
                    axisLabel: { color: '#fff' },
                    axisLine: { lineStyle: { color: '#fff' } },
                    splitLine: { lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.2)' } }
                },
                series: [
                    {
                        name: '冰山',
                        type: 'line',
                        smooth: false,
                        data: rebeng1Arr,
                        lineStyle: { color: '#00f2ff' },
                        itemStyle: { color: '#00f2ff' }
                    },
                    {
                        name: '扬子2',
                        type: 'line',
                        smooth: false,
                        data: rebeng2Arr,
                        lineStyle: { color: '#ff8c00' },
                        itemStyle: { color: '#ff8c00' }
                    },
                    {
                        name: '扬子1',
                        type: 'line',
                        smooth: false,
                        data: rebeng3Arr,
                        lineStyle: { color: '#00ff00' },
                        itemStyle: { color: '#00ff00' }
                    },
                    {
                        name: '冷机',
                        type: 'line',
                        smooth: false,
                        data: rebeng4Arr,
                        lineStyle: { color: '#ff00ff' },
                        itemStyle: { color: '#ff00ff' }
                    },
                    {
                        name: '欧亚',
                        type: 'line',
                        smooth: false,
                        data: rebeng5Arr,
                        lineStyle: { color: '#ffff00' },
                        itemStyle: { color: '#ffff00' }
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
            
            // 找到下一个有效的数据点
            let nextIndex = this.state.currentIndex;
            let attempts = 0;
            
            while (attempts < totalPoints) {
                nextIndex = (nextIndex + 1) % totalPoints;
                const option = chart.getOption();
                const series = option.series || [];
                
                // 检查是否有任何系列在该索引有数据
                let hasData = false;
                for (let s of series) {
                    if (s.data && s.data[nextIndex] != null) {
                        hasData = true;
                        break;
                    }
                }
                
                if (hasData) {
                    this.state.currentIndex = nextIndex;
                    chart.dispatchAction({
                        type: 'showTip',
                        seriesIndex: 0,
                        dataIndex: nextIndex
                    });
                    break;
                }
                attempts++;
            }
        }, 2000);
        
        console.log('[AutoPlay] 已启动');
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
