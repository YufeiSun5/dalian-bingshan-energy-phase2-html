// =========================================
// 污水处理监控 - 总磷 (TP) 数据管理器
// =========================================

class ChartDataManager {
    constructor() {
        // API 配置
        this.config = {
            apiBaseUrl: 'http://192.168.7.229:8004',
            updateInterval: 180000,  // 3分钟
            retryTimes: 3,
            retryDelay: 1000
        };

        // 状态管理
        this.state = {
            updateTimer: null,
            isUpdating: false,
            lastUpdateTime: null
        };
    }

    // =========================================
    // HTTP 请求方法
    // =========================================

    async request(url, options = {}) {
        const defaultOptions = { method: 'GET', headers: { 'Content-Type': 'application/json' }, timeout: 10000 };
        const finalOptions = { ...defaultOptions, ...options };
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
            const response = await fetch(url, { ...finalOptions, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`%c[请求失败] ${error.message}`, "color: #e74c3c; padding: 2px 5px;");
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const url = new URL(`${this.config.apiBaseUrl}${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return await this.request(url.toString());
    }

    async post(endpoint, data = {}) {
        return await this.request(`${this.config.apiBaseUrl}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async sendSQL(sql) {
        try {
            const res = await fetch(`${this.config.apiBaseUrl}/api/sql/run-sql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ sql })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            return await res.json();
        } catch (error) {
            console.error(`%c[SQL查询失败] ${error.message}`, "color: #e74c3c; padding: 2px 5px;");
            throw error;
        }
    }

    // =========================================
    // [核心修改] 生成 5天 x 4时段 的总磷 SQL
    // =========================================

    generateSQL() {
        // 使用 WITH RECURSIVE 生成连续时间轴，Left Join 污水数据表
        const sql = `
            WITH RECURSIVE time_slots AS (
                -- 1. 设定初始锚点：从4天前的早上07:00开始
                SELECT
                    DATE_ADD(CURDATE(), INTERVAL -4 DAY) + INTERVAL 7 HOUR AS start_time,
                    DATE_ADD(CURDATE(), INTERVAL -4 DAY) + INTERVAL 13 HOUR AS end_time

                UNION ALL

                -- 2. 递归生成时间段：每次加6小时
                SELECT
                    end_time AS start_time,
                    end_time + INTERVAL 6 HOUR AS end_time
                FROM time_slots
                -- 3. 结束条件：直到明天的早上07:00结束
                WHERE end_time < DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 7 HOUR
            )
            SELECT
                CONCAT(DATE_FORMAT(t.start_time, '%d日'), DATE_FORMAT(t.start_time, '%H时')) AS time_label,
                COUNT(d.date) AS data_count,
                FORMAT(AVG(CASE WHEN d.TP IS NOT NULL THEN d.TP ELSE NULL END), 2) AS tp_avg
            FROM
                time_slots t
            LEFT JOIN
                data_foul_water d
            ON
                d.date >= t.start_time AND d.date < t.end_time
            GROUP BY
                t.start_time, t.end_time
            ORDER BY
                t.start_time;
        `;
        return sql.trim();
    }

    // =========================================
    // [核心修改] 解析总磷数据
    // =========================================

    async fetchData() {
        try {
            const sql = this.generateSQL();
            console.log('%c[SQL查询]', "color: #00b894; padding: 2px 5px;", "5天分时段-总磷统计");
            console.log('执行的SQL:', sql);

            const response = await this.sendSQL(sql);
            console.log('后端响应:', response);

            if (!response || !response.data || response.data.length === 0) {
                console.warn('后端返回数据为空，检查数据表是否存在数据');

                // 尝试检查数据表结构
                const checkSQL = "DESCRIBE data_foul_water";
                try {
                    const tableInfo = await this.sendSQL(checkSQL);
                    console.log('数据表结构:', tableInfo);
                } catch (err) {
                    console.error('检查表结构失败:', err);
                }

                // 尝试检查数据表是否有数据
                const countSQL = "SELECT COUNT(*) as total_count FROM data_foul_water";
                try {
                    const countResult = await this.sendSQL(countSQL);
                    console.log('数据表总记录数:', countResult);
                } catch (err) {
                    console.error('检查记录数失败:', err);
                }

                return this.transformData({ labels: [], series: [] });
            }

            // 提取数据
            const labels = response.data.map(item => item.time_label); // 例如 "22日" 或空字符串
            const values = response.data.map(item => item.tp_avg);    // 总磷数值 (可能为 null)

            const transformedData = {
                labels: labels,
                series: [{
                    name: '总磷(TP)',
                    values: values,
                    color: '#ff8c00', // 亮橙色，与氨氮系统保持一致
                    unit: 'mg/L'      // 总磷常用单位
                }]
            };

            return this.transformData(transformedData);

        } catch (error) {
            console.error('获取数据失败:', error);
            throw error;
        }
    }

    // =========================================
    // 数据转换（保持通用性，不用大改）
    // =========================================

    transformData(apiData) {
        const { labels, series } = apiData;

        return {
            data: {
                labels: labels,
                series: series.map(s => s.values)
            },
            seriesConfig: series.map(s => ({
                name: s.name,
                smooth: true,
                color: s.color,
                unit: s.unit || '',
                // 总磷不需要像气压那样大面积填充，稍微淡一点
                areaStyle: {
                    opacity: 0.15,
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{
                            offset: 0, color: s.color // 0% 处的颜色
                        }, {
                            offset: 1, color: 'rgba(255, 255, 255, 0)' // 100% 处的颜色
                        }]
                    }
                },
                // 处理空数据：连接空点还是断开？通常 connectNulls: true 会好看点
                connectNulls: true
            }))
        };
    }

    // =========================================
    // 图表更新（带重试机制）
    // =========================================

    async updateChart() {
        if (this.state.isUpdating) return;

        this.state.isUpdating = true;

        for (let i = 0; i < this.config.retryTimes; i++) {
            try {
                const chartConfig = await this.fetchData();
                if (window.updateChart) {
                    window.updateChart(chartConfig);
                    this.state.lastUpdateTime = new Date();
                    console.log(`%c[数据更新] TP`, "color: #00b894; padding: 2px 5px;");
                }
                break;
            } catch (error) {
                console.error(`更新失败 (${i + 1}/${this.config.retryTimes}):`, error);
                if (i < this.config.retryTimes - 1) {
                    await this.sleep(this.config.retryDelay);
                } else {
                    this.showError('数据更新失败，请检查网络连接');
                }
            }
        }

        this.state.isUpdating = false;
    }

    // =========================================
    // 自动更新控制
    // =========================================

    startAutoUpdate() {
        if (this.state.updateTimer) return;
        this.updateChart();
        this.state.updateTimer = setInterval(() => this.updateChart(), this.config.updateInterval);
    }

    stopAutoUpdate() {
        if (this.state.updateTimer) {
            clearInterval(this.state.updateTimer);
            this.state.updateTimer = null;
            console.log('%c[自动更新] 已停止', "color: #e17055; padding: 2px 5px;");
        }
    }

    setUpdateInterval(interval) {
        this.config.updateInterval = interval;
        console.log(`[配置] 更新间隔已设置为 ${interval / 1000} 秒`);
        if (this.state.updateTimer) {
            this.stopAutoUpdate();
            this.startAutoUpdate();
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showError(message) {
        console.error(`%c[错误] ${message}`, "color: #e74c3c; padding: 2px 5px;");
        const errorDiv = document.createElement('div');
        errorDiv.className = 'msg';
        errorDiv.textContent = message;
        errorDiv.style.background = 'rgba(231, 76, 60, 0.9)';
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    setApiBaseUrl(url) {
        this.config.apiBaseUrl = url;
        console.log(`[配置] API 地址: ${url}`);
    }
}

// =========================================
// 创建全局实例
// =========================================
const dataManager = new ChartDataManager();
window.dataManager = dataManager;

// =========================================
// 页面加载初始化 (针对水质监控调整样式)
// =========================================
window.addEventListener('DOMContentLoaded', function() {
    console.log('%c[初始化] 总磷(TP)监控系统...', "color: #00b894; font-weight: bold;");

    setTimeout(() => {
        // 1. 设置样式：深蓝色科技背景，适合水务
        window.updateChart({
            backgroundGradient: {
                colors: ['#395998', '#395998'], // 统一背景色
                direction: 'vertical'
            },
            legendPosition: 'top',
            legendTextColor: '#a8d8ea',
            xAxis: {
                axisLabel: { color: '#ffffff', rotate: 0 }, // 时间标签颜色改为白色
                axisLine: { lineStyle: { color: '#ffffff' } } // 轴线颜色改为白色
            },
            yAxis: {
                name: 'mg/L',
                nameTextStyle: { color: '#a8d8ea' },
                axisLabel: { color: '#a8d8ea' },
                splitLine: { lineStyle: { color: 'rgba(168, 216, 234, 0.1)' } }
            },
            grid: { top: 40, bottom: 20, left: 40, right: 20 }
        });

        // 2. 启动
        dataManager.startAutoUpdate();

        // 3. 暂时不设置预警线，等待数据收集完善
        // setTimeout(() => {
        //     if (window.chartControl && window.chartControl.setMarkLine) {
        //         window.chartControl.setMarkLine([
        //             { value: 0.5, name: '排放限值', color: '#ff7675', width: 2, type: 'dashed', unit: 'mg/L' },
        //             { value: 0.3, name: '警戒线', color: '#ffeaa7', width: 1, type: 'solid', unit: 'mg/L' }
        //         ]);
        //     }
        // }, 500);
        // 4. 延迟启动 tooltip 自动播放，确保图表完全加载后再启动
        setTimeout(() => {
            if (window.chartControl && window.chartControl.startAutoPlay) {
                window.chartControl.startAutoPlay();
            }
        }, 1000);
    }, 100);
});

// =========================================
// 控制台帮助信息
// =========================================
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #666;");
console.log("%c 🔬 污水处理监控系统 - 总磷(TP)", "color: #00d2d3; font-weight: bold; font-size: 16px;");
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #666;");
console.log(`
%c可用命令：

• dataManager.startAutoUpdate()      - 启动自动更新
• dataManager.stopAutoUpdate()       - 停止自动更新
• dataManager.setUpdateInterval(ms)  - 设置更新间隔（毫秒）
• dataManager.updateChart()          - 手动更新一次
• dataManager.setApiBaseUrl(url)     - 设置后端 API 地址

%c自定义样式：

• updateChart({ legendTextColor: '#fff' })  - 设置图例文字颜色
• updateChart({ legendPosition: 'left' })   - 设置图例位置 (left/center/right)
• updateChart({ backgroundGradient: { colors: ['#color1', '#color2'] } })

%c后端配置：

• API 地址: http://192.168.7.229:8004
• 更新间隔: 3分钟（180000ms）
• 数据来源: data_foul_water 表
• 查询范围: 5天 x 4时段（从4天前07:00到明天07:00）
• 预警值: 暂未设置（等待数据收集完善）
`, "color: #333;", "color: #00b894; font-style: italic;");
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "color: #666;");