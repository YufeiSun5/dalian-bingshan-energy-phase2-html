/**
 * 高压统计报表 - 配置文件
 *
 * 布局：上面1个折线图，下面2个表格（左右并排）
 * 支持 月/年 两种时间粒度切换
 */

// =========================================
// 配置：高压统计报表
// =========================================

window.PAGE_CONFIG = {
    // 页面标题
    title: '空压站-高压',

    // 图表区域标题
    chartsTitle: '电气比',

    // 表格区域标题
    tablesTitle: '数据明细',

    // 是否自动加载数据
    autoLoad: true,

    // 默认时间类型: 'month' | 'year'
    defaultTimeType: 'month',

    // =========================================
    // 图表配置（1个折线图）
    // =========================================
    charts: [
        {
            title: '电气比',
            flex: 1,  // 占满整个图表区域
            option: {
                legend: { 
                    show: false  // 单条线不需要图例
                },
                tooltip: {
                    formatter: function(params) {
                        if (!Array.isArray(params)) params = [params];
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(p => {
                            if (p.value !== null && p.value !== undefined) {
                                result += `${p.marker} 电气比: ${p.value}<br/>`;
                            }
                        });
                        return result;
                    }
                },
                yAxis: {
                    /*max: 0.3,
                    min: 0,*/
                    interval: 100,
                    name: '电气比',
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                xAxis: {
                    axisLabel: {
                        rotate: 45,
                        fontSize: 10,
                        interval: 0,
                        hideOverlap: false
                    }
                }
            }
        }
    ],

    // =========================================
    // 表格配置（2个表格：左侧累计运行时间，右侧详细数据）
    // =========================================
    tables: [
        {
            title: '累计运行时间',
            flex: 0.4  // 左侧表格占40%宽度
        },
        {
            title: '详细数据统计',
            flex: 0.6  // 右侧表格占60%宽度
        }
    ],

    // =========================================
    // 数据获取函数（核心）
    // params: { startDate, endDate, timeType }
    // timeType: 'month' | 'year'
    // =========================================
    fetchData: async function(params) {
        const { startDate, endDate, timeType } = params;

        console.log('============= 高压统计查询参数 =============');
        console.log('开始日期:', startDate);
        console.log('结束日期:', endDate);
        console.log('时间类型:', timeType);
        console.log('==============================================');

        try {
            // TODO: 这里实现实际的API调用
            // 目前使用模拟数据
			const sql = buildSQL(startDate, endDate, timeType);
            const response = await sendSQL(sql);
			debugger;
			const sql1 = buildSQL1(startDate, endDate, timeType);
			const response1 = await sendSQL(sql1);
			return transformData(response.data,response1.data, timeType);
            //return getMockData(timeType, startDate, endDate);

        } catch (error) {
            console.error('获取高压数据失败:', error);
            return getMockData(timeType, startDate, endDate);
        }
    }
};

function buildSQL(startDate, endDate, timeType) {
    //let dateFormat, groupBy, tableName, dateCondition;
	
	var sql = " select  elec.day as time_label,total_elec,sum_FLOW_total as total_gas,ROUND(total_elec / NULLIF(sum_FLOW_total, 0), 3) as elec_ratio from ( ";
	
	
	//计算电能的部分
	sql += "select";
	if(timeType == "month"){
		sql+="	DATE_FORMAT(r.jDay, '%m-%d') as day, \n";	
	}else if(timeType == "year"){
		endDate = startDate+"-12-31";
		startDate = startDate+"-01-01";
		
		sql+="	DATE_FORMAT(r.jDay, '%Y-%m') as day, \n";
	}
		 
		
		sql+=" sum(case when elec_name in ('elec_410007') then sum_elec else 0 end) as total_elec \n"  
			+" from (  " ;
			
		sql += " 	select DATE_FORMAT(date, '%Y-%m-%d') as jDay \n" 
				+" 	,CONCAT('elec', '_', NO) as elec_name \n" 
				+" 	,sum_elec \n" 
				+" 	from sum_elec_group_by_day \n" ;	
		sql+=" 	where no = 410007	\n" 
			+" 	and date <= '"+endDate+"'  \n" 
			+" 	AND date >= '"+startDate+"'	\n"; 
	debugger;
	let compareDate = new Date();
	compareDate.setHours(7, 0, 0, 0);
	//如果当天在查询区间范围内
	if(new Date(startDate).setHours(7, 0, 0, 0) <= compareDate &&  compareDate <= new Date(endDate).setHours(7, 0, 0, 0) ){
		sql += " union all \n" ;
		sql += " 	SELECT DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as jDay \n" ;		
		sql+=" 	,CONCAT('elec', '_', NO) as elec_name	\n" 		
			+" 	#,MIN(KWH) as min		\n" 
			+" 	#,MAX(KWH) as max		\n" 
			+" 	,if(LEAD(no,1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) = no , LEAD(MIN(KWH),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')),   MAX(KWH))- MIN(KWH) AS sum_elec	\n" 
			+" 	FROM data_all FORCE INDEX (date_no_KWH) 	\n" 
			+" 	WHERE date <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')  \n" 
			+" 	AND date >= DATE_FORMAT(now() , '%Y-%m-%d 07:00:00')	\n" 
			+" 	and kwh != 0 and kwh != 99999999		\n" 
			+" 	and no = 410007	\n";
		sql += " 	GROUP BY no,DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') \n" ;
	}
			
		sql+=" 	) r \n" 
			+" where r.jDay >= '"+startDate+"' and r.jDay <= '"+endDate+"' \n" ;
	if(timeType == "month"){
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
			+" 	where no = 13	\n" 
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
			+" 	and data_gas.gas_ID = 13	\n";
		if(timeType == "month" || timeType == "year"){
			sql += " 	GROUP BY DATE_FORMAT(DATE_SUB(data_gas.date,INTERVAL 7 HOUR ), '%Y-%m-%d') \n" ;
		}else{
			sql += " 	GROUP BY DATE_FORMAT(data_gas.date, '%Y-%m-%d %H:00:00')  	 \n" ;
		}	
	}
			
		sql+=" 	) r \n" 
			+" where r.jDay >= '"+startDate+"' and r.jDay <= '"+endDate+"' \n" ;
	if(timeType == "month"){
		sql += " group by DATE_FORMAT(r.jDay, '%m-%d')  order BY DATE_FORMAT(r.jDay, '%m-%d') \n" ;		
	}else if (timeType == "year"){
		sql += " group by DATE_FORMAT(r.jDay, '%Y-%m')  order BY DATE_FORMAT(r.jDay, '%Y-%m') \n" ;	
	}
	sql += ") gas on elec.day = gas.day ";
	console.info(sql);
    
    
    
    return sql.trim();
}

function buildSQL1(startDate, endDate, timeType) {
    //let dateFormat, groupBy, tableName, dateCondition;
	
	var sql = "";
	
	

	if(timeType == "month"){
		sql+="	select DATE_FORMAT(date,'%Y-%m-%d') as date ,sum(time_1) as compressor_1,sum(time_2) as compressor_2,sum(time_3) as compressor_3,sum(time_4) as compressor_4	\n";	
	}else  if(timeType == "year"){
		endDate = startDate+"-12-31";
		startDate = startDate+"-01-01";
		
		sql+="	select DATE_FORMAT(date,'%Y-%m') as date ,sum(time_1) as compressor_1,sum(time_2) as compressor_2,sum(time_3) as compressor_3,sum(time_4) as compressor_4	\n";
	}
	


	

	sql+="	from(                                                                                                                                                           \n"
	+"		-- 计算每个设备每天的运行时间                                                                                                                                   \n"
	+"		SELECT                                                                                                                                                      \n"
	+"				date_ranges.work_date as date,                                                                                                                      \n"
	+"				-- 设备1的运行时间                                                                                                                                    \n"
	+"				COALESCE(SUM(CASE WHEN d.no = 1 AND d.status = '运行' AND d.end_date IS NOT NULL THEN                                                                \n"
	+"						-- 计算这个状态在当前工作日的运行秒数                                                                                                             \n"
	+"						CASE                                                                                                                                        \n"
	+"								-- 完全不重叠                                                                                                                         \n"
	+"								WHEN d.end_date <= date_ranges.day_start OR d.start_date >= date_ranges.day_end                                                     \n"
	+"								THEN 0                                                                                                                              \n"
	+"								-- 状态完全包含在工作日内                                                                                                               \n"
	+"								WHEN d.start_date >= date_ranges.day_start AND d.end_date <= date_ranges.day_end                                                    \n"
	+"								THEN TIMESTAMPDIFF(SECOND, d.start_date, d.end_date)                                                                                \n"
	+"								-- 状态开始前，工作日内结束                                                                                                             \n"
	+"								WHEN d.start_date < date_ranges.day_start AND d.end_date <= date_ranges.day_end AND d.end_date > date_ranges.day_start              \n"
	+"								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, d.end_date)                                                                       \n"
	+"								-- 工作日内开始，工作日后结束                                                                                                           \n"
	+"								WHEN d.start_date >= date_ranges.day_start AND d.start_date < date_ranges.day_end AND d.end_date > date_ranges.day_end              \n"
	+"								THEN TIMESTAMPDIFF(SECOND, d.start_date, date_ranges.day_end)                                                                       \n"
	+"								-- 状态完全覆盖工作日                                                                                                                  \n"
	+"								WHEN d.start_date <= date_ranges.day_start AND d.end_date >= date_ranges.day_end                                                    \n"
	+"								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, date_ranges.day_end)                                                              \n"
	+"								ELSE 0                                                                                                                              \n"
	+"						END                                                                                                                                         \n"
	+"				END), 0) / 3600 as time_1,                                                                                                                          \n"
	+"				-- 设备2的运行时间                                                                                                                                    \n"
	+"				COALESCE(SUM(CASE WHEN d.no = 2 AND d.status = '运行' AND d.end_date IS NOT NULL THEN                                                                \n"
	+"						CASE                                                                                                                                        \n"
	+"								WHEN d.end_date <= date_ranges.day_start OR d.start_date >= date_ranges.day_end                                                     \n"
	+"								THEN 0                                                                                                                              \n"
	+"								WHEN d.start_date >= date_ranges.day_start AND d.end_date <= date_ranges.day_end                                                    \n"
	+"								THEN TIMESTAMPDIFF(SECOND, d.start_date, d.end_date)                                                                                \n"
	+"								WHEN d.start_date < date_ranges.day_start AND d.end_date <= date_ranges.day_end AND d.end_date > date_ranges.day_start              \n"
	+"								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, d.end_date)                                                                       \n"
	+"								WHEN d.start_date >= date_ranges.day_start AND d.start_date < date_ranges.day_end AND d.end_date > date_ranges.day_end              \n"
	+"								THEN TIMESTAMPDIFF(SECOND, d.start_date, date_ranges.day_end)                                                                       \n"
	+"								WHEN d.start_date <= date_ranges.day_start AND d.end_date >= date_ranges.day_end                                                    \n"
	+"								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, date_ranges.day_end)                                                              \n"
	+"								ELSE 0                                                                                                                              \n"
	+"						END                                                                                                                                         \n"
	+"				END), 0) / 3600 as time_2,                                                                                                                          \n"
	+"				-- 设备3的运行时间                                                                                                                                    \n"
	+"				COALESCE(SUM(CASE WHEN d.no = 3 AND d.status = '运行' AND d.end_date IS NOT NULL THEN                                                                \n"
	+"						CASE                                                                                                                                        \n"
	+"								WHEN d.end_date <= date_ranges.day_start OR d.start_date >= date_ranges.day_end                                                     \n"
	+"								THEN 0                                                                                                                              \n"
	+"								WHEN d.start_date >= date_ranges.day_start AND d.end_date <= date_ranges.day_end                                                    \n"
	+"								THEN TIMESTAMPDIFF(SECOND, d.start_date, d.end_date)                                                                                \n"
	+"								WHEN d.start_date < date_ranges.day_start AND d.end_date <= date_ranges.day_end AND d.end_date > date_ranges.day_start              \n"
	+"								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, d.end_date)                                                                       \n"
	+"								WHEN d.start_date >= date_ranges.day_start AND d.start_date < date_ranges.day_end AND d.end_date > date_ranges.day_end              \n"
	+"								THEN TIMESTAMPDIFF(SECOND, d.start_date, date_ranges.day_end)                                                                       \n"
	+"								WHEN d.start_date <= date_ranges.day_start AND d.end_date >= date_ranges.day_end                                                    \n"
	+"								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, date_ranges.day_end)                                                              \n"
	+"								ELSE 0                                                                                                                              \n"
	+"						END                                                                                                                                         \n"
	+"				END), 0)/3600  as time_3,                                                                                                                           \n"
	+"				-- 设备4的运行时间                                                                                                                                    \n"
	+"				COALESCE(SUM(CASE WHEN d.no = 4 AND d.status = '运行' AND d.end_date IS NOT NULL THEN                                                                \n"
	+"						CASE                                                                                                                                        \n"
	+"								WHEN d.end_date <= date_ranges.day_start OR d.start_date >= date_ranges.day_end                                                     \n"
	+"								THEN 0                                                                                                                              \n"
	+"								WHEN d.start_date >= date_ranges.day_start AND d.end_date <= date_ranges.day_end                                                    \n"
	+"								THEN TIMESTAMPDIFF(SECOND, d.start_date, d.end_date)                                                                                \n"
	+"								WHEN d.start_date < date_ranges.day_start AND d.end_date <= date_ranges.day_end AND d.end_date > date_ranges.day_start              \n"
	+"								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, d.end_date)                                                                       \n"
	+"								WHEN d.start_date >= date_ranges.day_start AND d.start_date < date_ranges.day_end AND d.end_date > date_ranges.day_end              \n"
	+"								THEN TIMESTAMPDIFF(SECOND, d.start_date, date_ranges.day_end)                                                                       \n"
	+"								WHEN d.start_date <= date_ranges.day_start AND d.end_date >= date_ranges.day_end                                                    \n"
	+"								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, date_ranges.day_end)                                                              \n"
	+"								ELSE 0                                                                                                                              \n"
	+"						END                                                                                                                                         \n"
	+"				END), 0)/3600  as time_4                                                                                                                            \n"
	+"		FROM (                                                                                                                                                      \n"
	+"				-- 生成日期范围（工作日：早上7点到次日早上7点）                                                                                                            \n"
	+"				SELECT                                                                                                                                              \n"
	+"						DATE(DATE_SUB(MIN_DATE, INTERVAL 7 HOUR)) + INTERVAL seq DAY as work_date,                                                                  \n"
	+"						-- 工作日开始时间：早上7:00                                                                                                                    \n"
	+"						DATE(DATE_SUB(MIN_DATE, INTERVAL 7 HOUR)) + INTERVAL seq DAY + INTERVAL 7 HOUR as day_start,                                                \n"
	+"						-- 工作日结束时间：次日早上7:00                                                                                                                 \n"
	+"						DATE(DATE_SUB(MIN_DATE, INTERVAL 7 HOUR)) + INTERVAL seq DAY + INTERVAL 31 HOUR as day_end                                                  \n"
	+"				FROM (                                                                                                                                              \n"
	+"						-- 查出最早和最晚的时间范围                                                                                                                     \n"
	+"						SELECT MIN(start_date) as MIN_DATE,                                                                                                         \n"
	+"									MAX(end_date) as MAX_DATE                                                                                                       \n"
	+"						FROM operation_status                                                                                                                       \n"
	+"						WHERE status = '运行' AND end_date IS NOT NULL                                                                                               \n"
	+"				) time_range,                                                                                                                                       \n"
	+"				(                                                                                                                                                   \n"
	+"						select i as seq from sys_ints                                                                                                               \n"
	+"				) date_seq                                                                                                                                          \n"
	+"				-- 确保日期序列覆盖整个数据范围                                                                                                                          \n"
	+"				WHERE DATE(DATE_SUB(MIN_DATE, INTERVAL 7 HOUR)) + INTERVAL seq DAY <= DATE(DATE_SUB(MAX_DATE, INTERVAL 7 HOUR))                                     \n"
	+"		) date_ranges                                                                                                                                               \n"
	+"		-- 连接设备状态数据                                                                                                                                            \n"
	+"		LEFT JOIN operation_status d ON d.status = '运行' AND d.end_date IS NOT NULL                                                                                 \n"
	+"				-- 只连接与当前工作日有重叠的状态记录                                                                                                                     \n"
	+"				AND d.start_date < date_ranges.day_end AND d.end_date > date_ranges.day_start                                                                       \n"
	+"		GROUP BY date_ranges.work_date                                                                                                                              \n"
	+"		ORDER BY date_ranges.work_date                                                                                                                              \n"
	+"	)t                                                                                                                                                              \n"
	+" where date >= '"+startDate+"' and date <= '"+endDate+"' \n";

	if(timeType == "month"){
		sql+="	group by DATE_FORMAT(date,'%Y-%m-%d')                                                                                                                           \n"	
	}else  if(timeType == "year"){
		sql+="	group by DATE_FORMAT(date,'%Y-%m')                                                                                                                           \n"	
	}
	console.info(sql);
    
    
    
    return sql;
}
// =========================================
// 模拟数据生成函数
// =========================================

// 月查询模拟数据（日级别）
function generateMonthData(startDate, endDate) {
    const chartLabels = [];
    const electricRatioValues = [];
    const leftTableRows = [];  // 左侧表格数据
    const rightTableRows = [];  // 右侧表格数据
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 生成日期范围内的数据
    let rowIndex = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const dateLabel = `${month}.${day}`;
        const fullDateLabel = `${month}月${day}日`;
        
        // 图表数据
        chartLabels.push(dateLabel);
        const ratio = (Math.random() * 0.1 + 0.1).toFixed(3);  // 0.1-0.2之间
        electricRatioValues.push(parseFloat(ratio));
        
        // 左侧表格数据（累计运行时间）
        // 根据行索引设置不同的背景色（模拟图片中的绿色/黄色行）
        let rowClass = '';
        
        leftTableRows.push({
            date: fullDateLabel,
            compressor_1: Math.floor(Math.random() * 3 + 3),  // 3-5
            compressor_2: Math.floor(Math.random() * 3 + 3),
            compressor_3: Math.floor(Math.random() * 3 + 2),  // 2-4
            compressor_4: Math.floor(Math.random() * 3 + 3),
            _rowClass: rowClass  // 自定义行样式
        });
        
        rowIndex++;
        
        // 右侧表格数据（详细统计）
        const airMachine = Math.floor(Math.random() * 2000 + 1500);  // 1500-3500
        const class1 = Math.floor(Math.random() * 1500 + 2000);  // 2000-3500
        const class2 = Math.floor(Math.random() * 1500 + 2000);
        const class3 = Math.floor(Math.random() * 1500 + 1500);  // 1500-3000
        const class4 = Math.floor(Math.random() * 1000 + 1500);  // 1500-2500
        const totalElectric = airMachine + class1 + class2 + class3 + class4;
        const totalAir = Math.floor(Math.random() * 20000 + 90000);  // 90000-110000
        const electricRatio = (totalElectric / totalAir).toFixed(3);
        
        rightTableRows.push({
            date: fullDateLabel,
            air_machine: airMachine,
            class_1: class1,
            class_2: class2,
            class_3: class3,
            class_4: class4,
            total_electric: totalElectric,
            total_air: totalAir,
            electric_ratio: parseFloat(electricRatio)
        });
    }
    
    return {
        chartLabels,
        electricRatioValues,
        leftTableRows,
        rightTableRows
    };
}

// 年查询模拟数据（月级别）
function generateYearData(year) {
    const chartLabels = [];
    const electricRatioValues = [];
    const leftTableRows = [];
    const rightTableRows = [];

    for (let m = 1; m <= 12; m++) {
        const monthLabel = `${m}月`;
        
        // 图表数据
        chartLabels.push(monthLabel);
        const ratio = (Math.random() * 0.05 + 0.11).toFixed(3);  // 0.11-0.16之间
        electricRatioValues.push(parseFloat(ratio));
        
        // 左侧表格数据
        // 根据月份设置不同的背景色
        let rowClass = '';
        
        leftTableRows.push({
            date: monthLabel,
            compressor_1: Math.floor(Math.random() * 30 + 70),  // 70-100
            compressor_2: Math.floor(Math.random() * 30 + 70),
            compressor_3: Math.floor(Math.random() * 30 + 60),  // 60-90
            compressor_4: Math.floor(Math.random() * 30 + 70),
            _rowClass: rowClass  // 自定义行样式
        });
        
        // 右侧表格数据
        const airMachine = Math.floor(Math.random() * 20000 + 50000);  // 50000-70000
        const class1 = Math.floor(Math.random() * 30000 + 60000);  // 60000-90000
        const class2 = Math.floor(Math.random() * 30000 + 60000);
        const class3 = Math.floor(Math.random() * 30000 + 50000);  // 50000-80000
        const class4 = Math.floor(Math.random() * 20000 + 40000);  // 40000-60000
        const totalElectric = airMachine + class1 + class2 + class3 + class4;
        const totalAir = Math.floor(Math.random() * 500000 + 2500000);  // 2500000-3000000
        const electricRatio = (totalElectric / totalAir).toFixed(3);
        
        rightTableRows.push({
            date: monthLabel,
            air_machine: airMachine,
            class_1: class1,
            class_2: class2,
            class_3: class3,
            class_4: class4,
            total_electric: totalElectric,
            total_air: totalAir,
            electric_ratio: parseFloat(electricRatio)
        });
    }

    return {
        chartLabels,
        electricRatioValues,
        leftTableRows,
        rightTableRows
    };
}

// =========================================
// 获取模拟数据主函数
// =========================================
function getMockData(timeType, startDate, endDate) {
    let mockData;

    switch (timeType) {
        case 'month':
            mockData = generateMonthData(startDate, endDate);
            break;
        case 'year':
            mockData = generateYearData(startDate);
            break;
        default:
            mockData = generateMonthData(startDate, endDate);
    }

    const { chartLabels, electricRatioValues, leftTableRows, rightTableRows } = mockData;

    // 左侧表格列定义（累计运行时间）
    const leftTableColumns = [
        {
            field: 'date',
            title: '累计运行时间',
            type: 'text',
            rowSpan: 1
        },
        {
            field: 'compressor_1',
            title: '1#英格索兰',
            type: 'number',
            decimal: 0
        },
        {
            field: 'compressor_2',
            title: '2#英格索兰',
            type: 'number',
            decimal: 0
        },
        {
            field: 'compressor_3',
            title: '3#英格索兰',
            type: 'number',
            decimal: 0
        },
        {
            field: 'compressor_4',
            title: '4#英格索兰',
            type: 'number',
            decimal: 0
        }
    ];

    // 右侧表格列定义（详细数据）
    const rightTableColumns = [
        {
            field: 'date',
            title: '空压机机房',
            type: 'text',
            rowSpan: 1
        },
        {
            field: 'class_4',
            title: '总电量',
            type: 'number',
            decimal: 0,
            highlight: true  // 黄色高亮
        },
        {
            field: 'total_air',
            title: '空压机总排量',
            type: 'number',
            decimal: 2,
            highlight: true  // 黄色高亮
        },
        {
            field: 'electric_ratio',
            title: '电气比',
            type: 'number',
            decimal: 3,
            highlight: true  // 黄色高亮
        }
    ];

    return {
        // 图表数据 - 1个折线图
        charts: [
            {
                xAxis: { data: chartLabels },
                series: [
                    {
                        name: '电气比',
                        type: 'line',
                        data: electricRatioValues,
                        itemStyle: { color: '#1e88e5' },
                        lineStyle: { 
                            color: '#1e88e5',
                            width: 2
                        },
                        symbol: 'circle',
                        symbolSize: 6,
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: '{c}'
                        }
                    }
                ]
            }
        ],
        // 表格数据 - 2个表格
        tables: [
            // 左侧表格：累计运行时间
            {
                columns: leftTableColumns,
                rows: leftTableRows
            },
            // 右侧表格：详细数据
            {
                columns: rightTableColumns,
                rows: rightTableRows
            }
        ]
    };
}

function transformData(data,data1, timeType){
	let chartLabels = [];
	let electricRatioValues = [];
	
	for(let i=0;i<data.length;i++){
		chartLabels.push(data[i].time_label);
		electricRatioValues.push(parseFloat(data[i].elec_ratio));
	}

    // 左侧表格列定义（累计运行时间）
    const leftTableColumns = [
        {
            field: 'date',
            title: '累计运行时间',
            type: 'text',
            rowSpan: 1
        },
        {
            field: 'compressor_1',
            title: '1#英格索兰（h）',
            type: 'number',
            decimal: 1
        },
        {
            field: 'compressor_2',
            title: '2#英格索兰（h）',
            type: 'number',
            decimal: 1
        },
        {
            field: 'compressor_3',
            title: '3#英格索兰（h）',
            type: 'number',
            decimal: 1
        },
        {
            field: 'compressor_4',
            title: '4#英格索兰（h）',
            type: 'number',
            decimal: 1
        }
    ];

    // 右侧表格列定义（详细数据）
    const rightTableColumns = [
        {
            field: 'time_label',
            title: '空压机机房',
            type: 'text',
            rowSpan: 1
        },
        {
            field: 'total_elec',
            title: '总电量（kwh）',
            type: 'number',
            decimal: 0,
            highlight: true  // 黄色高亮
        },
        {
            field: 'total_gas',
            title: '空压机总排量（m³）',
            type: 'number',
            decimal: 2,
            highlight: true  // 黄色高亮
        },
        {
            field: 'elec_ratio',
            title: '电气比（kwh/m³）',
            type: 'number',
            decimal: 3,
            highlight: true  // 黄色高亮
        }
    ];

    return {
        // 图表数据 - 1个折线图
        charts: [
            {
                xAxis: { data: chartLabels },
                series: [
                    {
                        name: '电气比',
                        type: 'line',
                        data: electricRatioValues,
                        itemStyle: { color: '#1e88e5' },
                        lineStyle: { 
                            color: '#1e88e5',
                            width: 2
                        },
                        symbol: 'circle',
                        symbolSize: 6,
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: '{c}'
                        }
                    }
                ]
            }
        ],
        // 表格数据 - 2个表格
        tables: [
            // 左侧表格：累计运行时间
            {
                columns: leftTableColumns,
                rows: data1
            },
            // 右侧表格：详细数据
            {
                columns: rightTableColumns,
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
console.log('%c 📊 高压统计报表 - 上面1个图表，下面2个表格', 'color: #1e88e5; font-weight: bold; font-size: 16px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
console.log(`
%c图表布局说明：

• 图表1：空压站电气比（折线图）

%c表格说明：

• 左侧表格：累计运行时间（4台英格索兰压缩机）
• 右侧表格：详细数据统计（包含电量、排量、电气比等）
• 支持导出Excel功能
`, 'color: #333;', 'color: #00b894;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #666;');
