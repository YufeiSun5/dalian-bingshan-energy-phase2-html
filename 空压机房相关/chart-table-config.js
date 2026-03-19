/**
 * 通用上面图下面表 - 配置文件
 * 
 * 使用说明：
 * 1. 修改 PAGE_CONFIG 对象来定义页面布局和数据
 * 2. 实现 fetchData 函数来获取实际数据
 * 3. 支持 日/月/年 三种时间粒度切换
 * 
 * 日/年查询：只选择单个日期/年份
 * 月查询：选择日期范围
 */

// =========================================
// 示例配置：空压站电气比
// =========================================

window.PAGE_CONFIG = {
    // 页面标题
    title: '空压站-低压',
    
    // 图表区域标题
    chartsTitle: '电气比',
    
    // 表格区域标题
    tablesTitle: '数据明细',
    
    // 是否自动加载数据
    autoLoad: true,
    
    // 默认时间类型: 'day' | 'month' | 'year'
    defaultTimeType: 'month',
    
    // =========================================
    // 图表配置（可配置多个图表，左右排列）
    // =========================================
    charts: [
        {
            title: '空压站-低压',
            unit: '单位：kWh/m³',
            flex: 1,
            option: {
                tooltip: {
                    formatter: function(params) {
                        if (!Array.isArray(params)) params = [params];
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(p => {
                            if (p.value !== null && p.value !== undefined) {
                                result += `${p.marker} ${p.seriesName}: ${p.value}<br/>`;
                            }
                        });
                        return result;
                    }
                },
                yAxis: {
                    max: 0.25,
                    min: 0,
                    interval: 0.05
                }
            }
        }
    ],
    
    // =========================================
    // 表格配置（可配置多个表格，左右排列）
    // =========================================
    tables: [
        {
            title: '空压机电量明细',
            flex: 1
        }
    ],
    
    // =========================================
    // 数据获取函数（核心）
    // params: { startDate, endDate, timeType }
    // timeType: 'day' | 'month' | 'year'
    // 
    // 日查询：startDate = endDate（同一天）
    // 年查询：startDate = endDate（同一年）
    // 月查询：startDate 和 endDate 是日期范围
    // =========================================
    fetchData: async function(params) {
        const { startDate, endDate, timeType } = params;
        
        console.log('============= 查询参数 =============');
        console.log('开始日期:', startDate);
        console.log('结束日期:', endDate);
        console.log('时间类型:', timeType);
        console.log('=====================================');
        
        try {
			debugger;
            // TODO: 这里实现实际的API调用
            const sql = buildSQL(startDate, endDate, timeType);
            const response = await sendSQL(sql);
             return transformData(response.data, timeType);
            
            // 目前使用模拟数据
            //return getMockData(timeType, startDate, endDate);
            
        } catch (error) {
            console.error('获取数据失败:', error);
            //return getMockData(timeType, startDate, endDate);
        }
    }
};

// =========================================
// SQL 构建函数（示例，根据实际表结构修改）
// =========================================
function buildSQL(startDate, endDate, timeType) {
    //let dateFormat, groupBy, tableName, dateCondition;
	
	var sql = " select  elec.day as time_label,shenggang1,shenggang2,shenggang3,shenggang4,shouli2,shouli4,shouli3,lengganji,total_elec,sum_FLOW_total as total_gas,ROUND(total_elec / NULLIF(sum_FLOW_total, 0), 3) as elec_ratio from ( ";
	
	
	//计算电能的部分
	sql += "select";
	if(timeType == "month"){
		sql+="	DATE_FORMAT(r.jDay, '%m-%d') as day, \n";	
	}else if(timeType == "day"){
		startDate = new Date(startDate);
		startDate = startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-"+startDate.getDate()+ " 07:00:00";
		endDate = new Date(startDate);
		endDate.setDate(endDate.getDate()+1);
		endDate = endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDate()+ " 07:00:00";
		sql+="	DATE_FORMAT(r.jDay, '%H:00') as day, \n";
	}else if(timeType == "year"){
		endDate = startDate+"-12-31";
		startDate = startDate+"-01-01";
		
		sql+="	DATE_FORMAT(r.jDay, '%Y-%m') as day, \n";
	}
		 
		
		sql+=" sum(case when elec_name in ('elec_120010','elec_230008','elec_120011','elec_120005','elec_410003','elec_410002','elec_410001','elec_410006') then sum_elec else 0 end) as total_elec, \n" 
			+" sum(case when elec_name in ('elec_120010') then sum_elec else 0 end) as shenggang1, \n" 
			+" sum(case when elec_name in ('elec_230008') then sum_elec else 0 end) as shenggang2, \n" 
			+" sum(case when elec_name in ('elec_120011') then sum_elec else 0 end) as shenggang3, \n" 
			+" sum(case when elec_name in ('elec_120005') then sum_elec else 0 end) as shenggang4, \n" 
			+" sum(case when elec_name in ('elec_410003') then sum_elec else 0 end) as shouli2, \n" 
			+" sum(case when elec_name in ('elec_410002') then sum_elec else 0 end) as shouli4, \n" 
			+" sum(case when elec_name in ('elec_410001') then sum_elec else 0 end) as shouli3, \n" 
			+" sum(case when elec_name in ('elec_410006') then sum_elec else 0 end) as lengganji \n" 
			+" from (  " ;
			
	if(timeType == "month" || timeType == "year"){
		sql += " 	select DATE_FORMAT(date, '%Y-%m-%d') as jDay \n" 
			+" 	,CONCAT('elec', '_', NO) as elec_name \n" 
			+" 	,sum_elec \n" 
			+" 	from sum_elec_group_by_day \n" ;
	}else{
		sql += " 	select date as jDay \n" 
			+" 	,CONCAT('elec', '_', NO) as elec_name \n" 
			+" 	,sum_elec \n" 
			+" 	from sum_elec_group_by_hour \n" ;
	}		
		sql+=" 	where no in (120010,230008,120011,120005,410003,410002,410001,410006)	\n" 
			+" 	and date <= '"+endDate+"'  \n" 
			+" 	AND date >= '"+startDate+"'	\n"; 
	debugger;
	let compareDate = new Date();
	compareDate.setHours(7, 0, 0, 0);
	//如果当天在查询区间范围内
	if(new Date(startDate).setHours(7, 0, 0, 0) <= compareDate &&  compareDate <= new Date(endDate).setHours(7, 0, 0, 0) ){
		sql += " union all \n" ;
		if(timeType == "month" || timeType == "year"){
			sql += " 	SELECT DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as jDay \n" ;
		}else{
			sql += " 	SELECT DATE_FORMAT(date, '%Y-%m-%d %H:00:00') as jDay \n" ;
		}			
		sql+=" 	,CONCAT('elec', '_', NO) as elec_name	\n" 		
			+" 	#,MIN(KWH) as min		\n" 
			+" 	#,MAX(KWH) as max		\n" 
			+" 	,if(LEAD(no,1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) = no , LEAD(MIN(KWH),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')),   MAX(KWH))- MIN(KWH) AS sum_elec	\n" 
			+" 	FROM data_all FORCE INDEX (date_no_KWH) 	\n" 
			+" 	WHERE date <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')  \n" 
			+" 	AND date >= DATE_FORMAT(now() , '%Y-%m-%d 07:00:00')	\n" 
			+" 	and kwh != 0 and kwh != 99999999		\n" 
			+" 	and no in (120010,230008,120011,120005,410003,410002,410001,410006)	\n";
		if(timeType == "month" || timeType == "year"){
			sql += " 	GROUP BY no,DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') \n" ;
		}else{
			sql += " 	GROUP BY no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')  	 \n" ;
		}	
	}
			
		sql+=" 	) r \n" 
			+" where r.jDay >= '"+startDate+"' and r.jDay <= '"+endDate+"' \n" ;
	if(timeType == "day"){
		sql += " group by r.jDay order BY r.jDay \n" ;
	}else if(timeType == "month"){
		sql += " group by DATE_FORMAT(r.jDay, '%m-%d')  order BY DATE_FORMAT(r.jDay, '%m-%d') \n" ;		
	}else if (timeType == "year"){
		sql += " group by DATE_FORMAT(r.jDay, '%Y-%m')  order BY DATE_FORMAT(r.jDay, '%Y-%m') \n" ;	
	}
	sql += ") elec left join (";
	//console.info(sql);
	//计算气量的部分
	sql += " select ";
	if(timeType == "month"){
		sql+="	DATE_FORMAT(r.jDay, '%m-%d') as day, \n";	
	}else if(timeType == "day"){
		
		sql+="	DATE_FORMAT(r.jDay, '%H:00') as day, \n";
	}else if(timeType == "year"){
		sql+="	DATE_FORMAT(r.jDay, '%Y-%m') as day, \n";
	}
		 
		sql+=" sum(sum_FLOW_total) as sum_FLOW_total \n" 
			+" from (  \n" ;
			
	if(timeType == "month" || timeType == "year"){
		sql += " 	select DATE_FORMAT(date, '%Y-%m-%d') as jDay \n" ;
			
	}else{
		sql += " 	select date as jDay \n" ;	
	}		
		sql +=" ,CONCAT('gas', '_', NO) as gas_name \n" 
			+" 	,sum_FLOW_total \n" 
			+" 	from sum_gas_flow_total_by_day  \n" 
			+" 	where no = 1	\n" 
			+" 	and date <= '"+endDate+"'  \n" 
			+" 	AND date >= '"+startDate+"'	\n"; 
	debugger;
	//如果当天在查询区间范围内
	if(new Date(startDate).setHours(7, 0, 0, 0) <= compareDate &&  compareDate <= new Date(endDate).setHours(7, 0, 0, 0) ){
		sql += " union all \n" ;
		if(timeType == "month" || timeType == "year"){
			sql += " 	SELECT DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as jDay \n" ;
		}else{
			sql += " 	SELECT DATE_FORMAT(date, '%Y-%m-%d %H:00:00') as jDay \n" ;
		}			
		sql+=" 	,CONCAT('gas', '_', data_gas.gas_ID) as gas_name		\n" 		
			+" 	#,MIN(KWH) as min		\n" 
			+" 	#,MAX(KWH) as max		\n" 
			+" 	,IF((lead(data_gas.gas_ID, 1, 0) OVER (ORDER BY data_gas.gas_ID, date_format(data_gas.date, '%Y-%m-%d %H:00:00')) = data_gas.gas_ID),"
			+"	lead(min( data_gas.FLOW_total ), 1, 0) OVER (ORDER BY data_gas.gas_ID, date_format( data_gas.date,'%Y-%m-%d %H:00:00')),max( data_gas.FLOW_total)) - min( data_gas.FLOW_total ) AS sum_FLOW_total	\n" 
			+" 	FROM data_gas 	\n" 
			+" 	WHERE data_gas.date <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')  \n" 
			+" 	AND data_gas.date >= DATE_FORMAT(now() , '%Y-%m-%d 07:00:00')	\n" 
			+" 	and data_gas.FLOW_total != 0 and data_gas.FLOW_total != 99999999		\n" 
			+" 	and data_gas.gas_ID = 1	\n";
		if(timeType == "month" || timeType == "year"){
			sql += " 	GROUP BY DATE_FORMAT(DATE_SUB(data_gas.date,INTERVAL 7 HOUR ), '%Y-%m-%d') \n" ;
		}else{
			sql += " 	GROUP BY DATE_FORMAT(data_gas.date, '%Y-%m-%d %H:00:00')  	 \n" ;
		}	
	}
			
		sql+=" 	) r \n" 
			+" where r.jDay >= '"+startDate+"' and r.jDay <= '"+endDate+"' \n" ;
	if(timeType == "day"){
		sql += " group by r.jDay order BY r.jDay \n" ;
	}else if(timeType == "month"){
		sql += " group by DATE_FORMAT(r.jDay, '%m-%d')  order BY DATE_FORMAT(r.jDay, '%m-%d') \n" ;		
	}else if (timeType == "year"){
		sql += " group by DATE_FORMAT(r.jDay, '%Y-%m')  order BY DATE_FORMAT(r.jDay, '%Y-%m') \n" ;	
	}
	sql += ") gas on elec.day = gas.day ";
	console.info(sql);
    
    /*switch (timeType) {
        case 'day':
            // 日查询：按小时分组，查询某一天的24小时数据
            dateFormat = '%H:00';
            groupBy = 'HOUR(date)';
            tableName = 'sum_elec_group_by_hour';
            dateCondition = `DATE(date) = '${startDate}'`;
            break;
            
        case 'month':
            // 月查询：按天分组，查询某个日期范围的每日数据
            dateFormat = '%m月%d日';
            groupBy = 'DATE(date)';
            tableName = 'sum_elec_group_by_day';
            dateCondition = `date >= '${startDate}' AND date <= '${endDate}'`;
            break;
            
        case 'year':
            // 年查询：按月分组，查询某年的12个月数据
            dateFormat = '%m月';
            groupBy = 'MONTH(date)';
            tableName = 'sum_elec_group_by_day';
            dateCondition = `YEAR(date) = '${startDate}'`;
            break;
    }
    
    const sql = `
        SELECT 
            DATE_FORMAT(date, '${dateFormat}') as time_label,
            SUM(CASE WHEN no = 1 THEN sum_elec ELSE 0 END) as shenggang1,
            SUM(CASE WHEN no = 2 THEN sum_elec ELSE 0 END) as shenggang2,
            SUM(CASE WHEN no = 3 THEN sum_elec ELSE 0 END) as shenggang3,
            SUM(CASE WHEN no = 4 THEN sum_elec ELSE 0 END) as shenggang4,
            SUM(CASE WHEN no = 5 THEN sum_elec ELSE 0 END) as shouli24,
            SUM(CASE WHEN no = 6 THEN sum_elec ELSE 0 END) as shouli3,
            SUM(CASE WHEN no = 7 THEN sum_elec ELSE 0 END) as lengganji,
            SUM(sum_elec) as total_elec,
            SUM(gas_amount) as total_gas,
            ROUND(SUM(sum_elec) / NULLIF(SUM(gas_amount), 0), 3) as elec_ratio
        FROM ${tableName}
        WHERE ${dateCondition}
        GROUP BY ${groupBy}
        ORDER BY date
    `;*/
    
    return sql.trim();
}

// =========================================
// 模拟数据生成函数（分别存储三种粒度的数据）
// =========================================

// 日查询模拟数据（小时级别）
const MOCK_DATA_DAY = {
    generateData: function(date) {
        const rows = [];
        const chartLabels = [];
        const chartValues = [];
        
        // 生成24小时数据
        for (let h = 0; h < 24; h++) {
            const hour = h.toString().padStart(2, '0') + ':00';
            const ratio = (Math.random() * 0.1 + 0.1).toFixed(3);
            
            chartLabels.push(hour);
            chartValues.push(parseFloat(ratio));
            
            rows.push({
                time_label: hour,
                shenggang1: Math.floor(Math.random() * 150 + 50),
                shenggang2: Math.floor(Math.random() * 150 + 50),
                shenggang3: Math.floor(Math.random() * 150 + 50),
                shenggang4: Math.floor(Math.random() * 150 + 50),
                shouli24: Math.floor(Math.random() * 100 + 30),
                shouli3: Math.floor(Math.random() * 50),
                lengganji: Math.floor(Math.random() * 5 + 1),
                total_elec: Math.floor(Math.random() * 500 + 300),
                total_gas: Math.floor(Math.random() * 5000 + 3000),
                elec_ratio: parseFloat(ratio)
            });
        }
        
        return { rows, chartLabels, chartValues };
    }
};

// 月查询模拟数据（日级别）
const MOCK_DATA_MONTH = {
    generateData: function(startDate, endDate) {
        const rows = [];
        const chartLabels = [];
        const chartValues = [];
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        for (let i = 0; i < diffDays; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            
            const month = (d.getMonth() + 1).toString();
            const day = d.getDate().toString();
            const dayLabel = `${month}月${day}日`;
            const chartDay = `${month}.${day}`;
            const ratio = (Math.random() * 0.1 + 0.1).toFixed(3);
            
            chartLabels.push(chartDay);
            chartValues.push(parseFloat(ratio));
            
            rows.push({
                time_label: dayLabel,
                shenggang1: Math.floor(Math.random() * 3000 + 1000),
                shenggang2: Math.floor(Math.random() * 3000 + 1000),
                shenggang3: Math.floor(Math.random() * 3000 + 1000),
                shenggang4: Math.floor(Math.random() * 3000 + 1000),
                shouli24: Math.floor(Math.random() * 2000 + 500),
                shouli3: Math.floor(Math.random() * 100),
                lengganji: Math.floor(Math.random() * 20 + 10),
                total_elec: Math.floor(Math.random() * 5000 + 10000),
                total_gas: Math.floor(Math.random() * 10000 + 90000),
                elec_ratio: parseFloat(ratio)
            });
        }
        
        return { rows, chartLabels, chartValues };
    }
};

// 年查询模拟数据（月级别）
const MOCK_DATA_YEAR = {
    generateData: function(year) {
        const rows = [];
        const chartLabels = [];
        const chartValues = [];
        
        // 生成12个月数据
        for (let m = 1; m <= 12; m++) {
            const monthLabel = `${m}月`;
            const ratio = (Math.random() * 0.1 + 0.1).toFixed(3);
            
            chartLabels.push(monthLabel);
            chartValues.push(parseFloat(ratio));
            
            rows.push({
                time_label: monthLabel,
                shenggang1: Math.floor(Math.random() * 80000 + 30000),
                shenggang2: Math.floor(Math.random() * 80000 + 30000),
                shenggang3: Math.floor(Math.random() * 80000 + 30000),
                shenggang4: Math.floor(Math.random() * 80000 + 30000),
                shouli24: Math.floor(Math.random() * 50000 + 15000),
                shouli3: Math.floor(Math.random() * 3000 + 500),
                lengganji: Math.floor(Math.random() * 600 + 300),
                total_elec: Math.floor(Math.random() * 150000 + 300000),
                total_gas: Math.floor(Math.random() * 300000 + 2700000),
                elec_ratio: parseFloat(ratio)
            });
        }
        
        return { rows, chartLabels, chartValues };
    }
};

// =========================================
// 获取模拟数据主函数
// =========================================
function getMockData(timeType, startDate, endDate) {
    let mockData;
    let titleSuffix;
    
    switch (timeType) {
        case 'day':
            mockData = MOCK_DATA_DAY.generateData(startDate);
            titleSuffix = '（日报 - 小时级）';
            break;
            
        case 'month':
            mockData = MOCK_DATA_MONTH.generateData(startDate, endDate);
            titleSuffix = '（月报 - 日级）';
            break;
            
        case 'year':
            mockData = MOCK_DATA_YEAR.generateData(startDate);
            titleSuffix = '（年报 - 月级）';
            break;
            
        default:
            mockData = MOCK_DATA_MONTH.generateData(startDate, endDate);
            titleSuffix = '';
    }
    
    const { rows, chartLabels, chartValues } = mockData;
    
    // 表格列定义
    // 注意：只有最后三列（总电量、空压机总排气量、电气比）设置 highlight: true
    const columns = [
        { field: 'time_label', title: '日期', type: 'text' },
        { field: 'shenggang1', title: '神钢1（kwh）', type: 'number', decimal: 0 },
        { field: 'shenggang2', title: '神钢2（kwh）', type: 'number', decimal: 0 },
        { field: 'shenggang3', title: '神钢3（kwh）', type: 'number', decimal: 0 },
        { field: 'shenggang4', title: '神钢4（kwh）', type: 'number', decimal: 0 },
        { field: 'shouli2', title: '寿力2（kwh）', type: 'number', decimal: 0 },
		{ field: 'shouli4', title: '寿力4（kwh）', type: 'number', decimal: 0 },
        { field: 'shouli3', title: '寿力3（kwh）', type: 'number', decimal: 0 },
        { field: 'lengganji', title: '冷干机（kwh）', type: 'number', decimal: 0 },
        // 以下三列高亮显示（黄色背景）
        { field: 'total_elec', title: '总电量（kwh）', type: 'number', decimal: 0, highlight: true },
        { field: 'total_gas', title: '空压机总排气量（m³）', type: 'number', decimal: 2, highlight: true },
        { field: 'elec_ratio', title: '电气比（kwh/m³）', type: 'ratio', decimal: 3, highlight: true }
    ];
    
    return {
        // 图表数据
        charts: [
            {
                xAxis: { data: chartLabels },
                series: [
                    {
                        name: '电气比',
                        type: 'line',
                        data: chartValues,
                        smooth: false,
                        symbol: 'circle',
                        symbolSize: 6,
                        itemStyle: { color: '#1e88e5' },
                        lineStyle: { color: '#1e88e5', width: 2 },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 10
                        },
                        markLine: {
                            symbol: 'none',
                            data: [
                                {
                                    yAxis: 0.25,
                                    name: '预警线',
                                    lineStyle: { type: 'dashed', color: '#ff0000', width: 2 },
                                    label: { show: false }
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        // 表格数据
        tables: [
            {
                columns: columns,
                rows: rows
            }
        ]
    };
}

// =========================================
// 将查询出的数据变为图表
// =========================================
function transformData(data, timeType) {
	debugger;
    let mockData = data;
    let titleSuffix;
    const chartLabels = [];
    const chartValues = []; 
    switch (timeType) {
        case 'day':
            //mockData = MOCK_DATA_DAY.generateData(startDate);
            titleSuffix = '（日报 - 小时级）';
            break;
            
        case 'month':
            //mockData = MOCK_DATA_MONTH.generateData(startDate, endDate);
            titleSuffix = '（月报 - 日级）';
            break;
            
        case 'year':
            //mockData = MOCK_DATA_YEAR.generateData(startDate);
            titleSuffix = '（年报 - 月级）';
            break;
            
        default:
            //mockData = MOCK_DATA_MONTH.generateData(startDate, endDate);
            titleSuffix = '';
    }
    
    //const { rows, chartLabels, chartValues } = mockData;
    for(let i=0;i<data.length;i++){
		chartLabels.push(data[i].time_label);
		chartValues.push(parseFloat(data[i].elec_ratio));
	}
    // 表格列定义
    // 注意：只有最后三列（总电量、空压机总排气量、电气比）设置 highlight: true
    const columns = [
        { field: 'time_label', title: '日期', type: 'text' },
        { field: 'shenggang1', title: '神钢1（kwh）', type: 'number', decimal: 0 },
        { field: 'shenggang2', title: '神钢2（kwh）', type: 'number', decimal: 0 },
        { field: 'shenggang3', title: '神钢3（kwh）', type: 'number', decimal: 0 },
        { field: 'shenggang4', title: '神钢4（kwh）', type: 'number', decimal: 0 },
        { field: 'shouli2', title: '寿力2（kwh）', type: 'number', decimal: 0 },
		{ field: 'shouli4', title: '寿力4（kwh）', type: 'number', decimal: 0 },
        { field: 'shouli3', title: '寿力3（kwh）', type: 'number', decimal: 0 },
        { field: 'lengganji', title: '冷干机（kwh）', type: 'number', decimal: 0 },
        // 以下三列高亮显示（黄色背景）
        { field: 'total_elec', title: '总电量（kwh）', type: 'number', decimal: 0, highlight: true },
        { field: 'total_gas', title: '空压机总排气量（m³）', type: 'number', decimal: 2, highlight: true },
        { field: 'elec_ratio', title: '电气比（kwh/m³）', type: 'ratio', decimal: 3, highlight: true }
    ];
    
    return {
        // 图表数据
        charts: [
            {
                xAxis: { data: chartLabels },
                series: [
                    {
                        name: '电气比',
                        type: 'line',
                        data: chartValues,
                        smooth: false,
                        symbol: 'circle',
                        symbolSize: 6,
                        itemStyle: { color: '#1e88e5' },
                        lineStyle: { color: '#1e88e5', width: 2 },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 10
                        },
                        /*markLine: {
                            symbol: 'none',
                            data: [
                                {
                                    yAxis: 0.25,
                                    name: '预警线',
                                    lineStyle: { type: 'dashed', color: '#ff0000', width: 2 },
                                    label: { show: false }
                                }
                            ]
                        }*/
                    }
                ]
            }
        ],
        // 表格数据
        tables: [
            {
                columns: columns,
                rows: data
            }
        ]
    };
}

// =========================================
// SQL 执行函数（预留接口）
// =========================================
async function sendSQL(sql) {
    const response = await fetch('http://192.168.7.229:8004/api/sql/run-sql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

// =========================================
// 控制台帮助信息
// =========================================
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
console.log('%c 📊 通用上面图下面表组件 - 支持日/月/年切换', 'color: #1e88e5; font-weight: bold; font-size: 16px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
console.log(`
%c时间类型说明：

• 日查询 (day)：
  - 日期选择器：选择单个日期（无范围）
  - 数据粒度：小时级（24条数据）
  - 适用场景：查看某一天的详细变化

• 月查询 (month)：
  - 日期选择器：选择日期范围
  - 数据粒度：日级（每天一条数据）
  - 适用场景：查看一段时间的每日趋势

• 年查询 (year)：
  - 日期选择器：选择单个年份（无范围）
  - 数据粒度：月级（12条数据）
  - 适用场景：查看全年的月度汇总

%c表格样式说明：

• 默认表头：浅蓝色背景（#0c6ed3）
• 高亮列（最后三列）：黄色背景（#ffc107）
• 首列：橙色背景，固定不滚动

%c图表功能：

• 支持导出图片：点击图表右上角下载按钮
• 图表背景与显示一致（深蓝色 #102a5c）
• 导出图片保持相同的颜色风格
`, 'color: #333;', 'color: #00b894;', 'color: #6c5ce7;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #666;');
