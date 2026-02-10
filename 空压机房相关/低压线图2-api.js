// =========================================
// 露点监控 - 数据管理器
// =========================================

class ChartDataManager {
    constructor() {
        // API 配置
        this.config = {
            apiBaseUrl: 'http://192.168.7.229:8004',  // 后端 API 地址
            updateInterval: 180000,  // 数据更新间隔（3分钟 = 180000毫秒）
            retryTimes: 3,         // 请求失败重试次数
            retryDelay: 1000       // 重试延迟（毫秒）
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
        const defaultOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);

            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

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

    /**
     * 发送 SQL 查询
     */
    async sendSQL(sql) {
        try {
            const res = await fetch(`${this.config.apiBaseUrl}/api/sql/run-sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ sql })
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            return data;
        } catch (error) {
            console.error(`%c[SQL查询失败] ${error.message}`, "color: #e74c3c; padding: 2px 5px;");
            throw error;
        }
    }

    // =========================================
    // 生成 SQL 查询
    // =========================================
    
    generateSQL() {
        const sql = `
            SELECT
                -- 1. 生成时间轴：基准时间 + i 小时
                DATE_FORMAT(
                    (DATE(NOW() - INTERVAL 7 HOUR) + INTERVAL 7 HOUR) + INTERVAL t.i HOUR, 
                    '%Y-%m-%d %H:00:00'
                ) AS hour_period,
                
                -- 2. 计算 A相温度(露点) 的平均值，保留1位小数
                ROUND(AVG(d.A_Temp), 1) AS avg_dew_point
            FROM
                sys_ints t
            LEFT JOIN
                data_temp d
                ON d.date >= (DATE(NOW() - INTERVAL 7 HOUR) + INTERVAL 7 HOUR) + INTERVAL t.i HOUR
               AND d.date <  (DATE(NOW() - INTERVAL 7 HOUR) + INTERVAL 7 HOUR) + INTERVAL (t.i + 1) HOUR
               AND d.No = 410008 -- 筛选条件必须在 ON 里，否则空行会被过滤
               AND d.A_Temp < 100
            WHERE
                -- 3. 取出 0 到 24 (共25个点，从今天7点到明天7点)
                t.i <= 24
            GROUP BY
                hour_period
            ORDER BY
                hour_period ASC
        `;
        return sql.trim();
    }

    // =========================================
    // 数据获取（从真实后端获取）
    // =========================================
    
    async fetchData() {
        try {
            // 生成 SQL 查询
            const sql = this.generateSQL();
            console.log('%c[SQL查询]', "color: #00b894; padding: 2px 5px;", sql);
            
            // 发送 SQL 查询
            const response = await this.sendSQL(sql);
            
            // 检查返回数据
            if (!response || !response.data || response.data.length === 0) {
                console.warn('后端返回数据为空');
                return this.transformData({ labels: [], series: [] });
            }
            
            // 转换后端数据格式
            const labels = response.data.map(item => {
                // 从 "2024-12-10 08:00:00" 提取 "08:00"
                const dateStr = item.hour_period;
                const timePart = dateStr.split(' ')[1]; // "08:00:00"
                return timePart.substring(0, 5); // "08:00"
            });
            
            const values = response.data.map(item => item.avg_dew_point);
            
            const transformedData = {
                labels: labels,
                series: [{
                    name: '露点',
                    values: values,
                    color: '#48dbfb',
                    unit: '℃'
                }]
            };
            
            return this.transformData(transformedData);

        } catch (error) {
            console.error('获取数据失败:', error);
            throw error;
        }
    }

    // =========================================
    // 数据转换（将后端数据转换为图表格式）
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
                unit: s.unit || '',  // 传递单位信息
                areaStyle: { opacity: 0.2 }  // 半透明面积填充
            }))
        };
    }

    // =========================================
    // 图表更新（带重试机制）
    // =========================================
    
    async updateChart() {
        if (this.state.isUpdating) {
            console.warn('[跳过] 正在更新中...');
            return;
        }

        this.state.isUpdating = true;

        for (let i = 0; i < this.config.retryTimes; i++) {
            try {
                // 获取数据
                const chartConfig = await this.fetchData();
                
                // 更新图表
                if (window.updateChart) {
                    window.updateChart(chartConfig);
                    this.state.lastUpdateTime = new Date();
                    
                    console.log(
                        `%c[数据更新] ${new Date().toLocaleTimeString()}`,
                        "color: #00b894; padding: 2px 5px;"
                    );
                }
                
                break;  // 成功后跳出重试循环

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
        if (this.state.updateTimer) {
            console.warn('[警告] 自动更新已在运行中');
            return;
        }

        // 立即执行一次
        this.updateChart();
        
        // 定时更新
        this.state.updateTimer = setInterval(() => {
            this.updateChart();
        }, this.config.updateInterval);

        console.log(
            `%c[自动更新] 已启动，间隔 ${this.config.updateInterval / 1000} 秒`,
            "color: #00b894; padding: 2px 5px;"
        );
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

    // =========================================
    // 工具方法
    // =========================================
    
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
// 页面加载时自动初始化
// =========================================
window.addEventListener('DOMContentLoaded', function() {
    console.log('%c[初始化] 开始加载...', "color: #00b894; font-weight: bold; padding: 2px 5px;");
    
    // 等待 ECharts 图表初始化
    setTimeout(() => {
        // 1. 设置图表样式
        window.updateChart({
            backgroundGradient: { 
                colors: ['#395998', '#395998'], 
                direction: 'vertical' 
            },
            legendPosition: 'right',
            legendTextColor: '#fff',  // 图例文字颜色
            xAxis: { 
                axisLabel: { color: '#fff' },
                axisLine: { lineStyle: { color: '#fff' } }
            },
            yAxis: { 
                name: '℃',
                nameTextStyle: { color: '#fff' },
                axisLabel: { color: '#fff' },
                axisLine: { lineStyle: { color: '#fff' } },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.2)', type: 'dashed' } }
            },
            grid: { top: 10, bottom: 20, left: 30, right: 5 }
        });
        
        // 2. 启动自动更新（会立即加载一次数据）
        dataManager.startAutoUpdate();
        
        // 3. 设置预警线（使用 HTML 中的方法）
        setTimeout(() => {
            if (window.chartControl && window.chartControl.setMarkLine) {
                window.chartControl.setMarkLine([
                    { value: -30, name: '预警值', color: '#ff0000', width: 2 }
                ]);
            }
        }, 500);
        
        // 4. 启动 tooltip 自动播放（使用 HTML 中的方法）
        setTimeout(() => {
            if (window.chartControl && window.chartControl.startAutoPlay) {
                window.chartControl.startAutoPlay();
            }
        }, 1000);
        
        console.log('%c[初始化] 完成！', "color: #00b894; font-weight: bold; padding: 2px 5px;");
        
    }, 100);
});

// =========================================
// 控制台帮助信息
// =========================================
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #666;");
console.log("%c 📡 露点监控系统", "color: #667eea; font-weight: bold; font-size: 16px;");
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #666;");
console.log(`
%c可用命令：

• dataManager.startAutoUpdate()      - 启动自动更新
• dataManager.stopAutoUpdate()       - 停止自动更新
• dataManager.setUpdateInterval(ms)  - 设置更新间隔（毫秒）
• dataManager.updateChart()          - 手动更新一次
• dataManager.setApiBaseUrl(url)     - 设置后端 API 地址

• chartControl.startAutoPlay()       - 启动 tooltip 自动播放
• chartControl.stopAutoPlay()        - 停止 tooltip 自动播放

%c自定义样式：

• updateChart({ legendTextColor: '#fff' })  - 设置图例文字颜色
• updateChart({ legendPosition: 'left' })   - 设置图例位置 (left/center/right)
• updateChart({ backgroundGradient: { colors: ['#color1', '#color2'] } })

%c后端配置：

• API 地址: http://192.168.7.229:8004
• 更新间隔: 3分钟（180000ms）
• 数据来源: data_temp 表
• 查询字段: A_Temp (A相温度/露点)
• 设备编号: 410008
• 查询范围: 今天7:00到明天7:00（24小时）
• 预警值: -30℃（红色标线）
`, "color: #333;", "color: #00b894; font-style: italic;");
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "color: #666;");

