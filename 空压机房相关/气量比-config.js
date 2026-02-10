/**
 * 单台用气量统计报表 - 配置文件
 *
 * 布局：上面4个图表，下面1个表格
 * 支持 月/年 两种时间粒度切换
 */

// =========================================
// 配置：单台用气量统计
// =========================================

window.PAGE_CONFIG = {
    // 页面标题
    title: '单台用气量统计',

    // 图表区域标题
    chartsTitle: '单台用气量趋势图表',

    // 表格区域标题
    tablesTitle: '单台用气量数据明细',

    // 是否自动加载数据
    autoLoad: true,

    // 默认时间类型: 'month' | 'year'
    defaultTimeType: 'month',

    // =========================================
    // 图表配置（4个图表，2x2网格布局）
    // =========================================
    charts: [
        {
            title: '总单台用气量',
            unit: '单位：Nm³/台',
            flex: 1,
            option: {
                legend: { 
                    show: true,
                    data: ['总单台用气量'],
                    textStyle: { color: '#d0d2e0' }
                },
                tooltip: {
                    formatter: function(params) {
                        if (!Array.isArray(params)) params = [params];
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(p => {
                            if (p.value !== null && p.value !== undefined) {
                                result += `${p.marker} ${p.seriesName}: ${p.value} Nm³/台<br/>`;
                            }
                        });
                        return result;
                    }
                },
                yAxis: {
                    min: 0,
                    interval: 10,
                    name: 'Nm³/台'
                },
                xAxis: {
                    axisLabel: {
                        rotate: 45,
                        fontSize: 9,
                        interval: 0,
                        hideOverlap: false
                    }
                }
            }
        },
        {
            title: '机加工单台用气量',
            unit: '单位：Nm³/台',
            flex: 1,
            option: {
                legend: { 
                    show: true,
                    data: ['机加工单台用气量'],
                    textStyle: { color: '#d0d2e0' }
                },
                tooltip: {
                    formatter: function(params) {
                        if (!Array.isArray(params)) params = [params];
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(p => {
                            if (p.value !== null && p.value !== undefined) {
                                result += `${p.marker} ${p.seriesName}: ${p.value} Nm³/台<br/>`;
                            }
                        });
                        return result;
                    }
                },
                yAxis: {
                    min: 0,
                    interval: 2,
                    name: 'Nm³/台'
                },
                xAxis: {
                    axisLabel: {
                        rotate: 45,
                        fontSize: 9,
                        interval: 0,
                        hideOverlap: false
                    }
                }
            }
        },
        {
            title: '电机单台用气量',
            unit: '单位：Nm³/台',
            flex: 1,
            option: {
                legend: { 
                    show: true,
                    data: ['电机单台用气量'],
                    textStyle: { color: '#d0d2e0' }
                },
                tooltip: {
                    formatter: function(params) {
                        if (!Array.isArray(params)) params = [params];
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(p => {
                            if (p.value !== null && p.value !== undefined) {
                                result += `${p.marker} ${p.seriesName}: ${p.value} Nm³/台<br/>`;
                            }
                        });
                        return result;
                    }
                },
                yAxis: {
                    min: 0,
                    name: 'Nm³/台'
                },
                xAxis: {
                    axisLabel: {
                        rotate: 45,
                        fontSize: 9,
                        interval: 0,
                        hideOverlap: false
                    }
                }
            }
        },
        {
            title: '组装单台用气量',
            unit: '单位：Nm³/台',
            flex: 1,
            option: {
                legend: { 
                    show: true,
                    data: ['组装单台用气量'],
                    textStyle: { color: '#d0d2e0' }
                },
                tooltip: {
                    formatter: function(params) {
                        if (!Array.isArray(params)) params = [params];
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(p => {
                            if (p.value !== null && p.value !== undefined) {
                                result += `${p.marker} ${p.seriesName}: ${p.value} Nm³/台<br/>`;
                            }
                        });
                        return result;
                    }
                },
                yAxis: {
                    min: 0,
                    interval: 4,
                    name: 'Nm³/台'
                },
                xAxis: {
                    axisLabel: {
                        rotate: 45,
                        fontSize: 9,
                        interval: 0,
                        hideOverlap: false
                    }
                }
            }
        }
    ],

    // =========================================
    // 表格配置（1个表格）
    // =========================================
    tables: [
        {
            title: '单台用气量统计明细',
            flex: 1
        }
    ],

    // =========================================
    // 数据获取函数（核心）
    // params: { startDate, endDate, timeType }
    // timeType: 'month' | 'year'
    // =========================================
    fetchData: async function(params) {
        const { startDate, endDate, timeType } = params;

        console.log('============= 单台用气量查询参数 =============');
        console.log('开始日期:', startDate);
        console.log('结束日期:', endDate);
        console.log('时间类型:', timeType);
        console.log('==============================================');

        try {
			debugger;
            // TODO: 这里实现实际的API调用
            const sql = buildSQL(startDate, endDate, timeType);
            const response = await sendSQL(sql);
            return transformData(response.data, timeType);
            // TODO: 这里实现实际的API调用
            // 目前使用模拟数据
            //return getMockData(timeType, startDate, endDate);

        } catch (error) {
            console.error('获取单台用气量数据失败:', error);
            //return getMockData(timeType, startDate, endDate);
        }
    }
};
// =========================================
// SQL 构建函数（示例，根据实际表结构修改）
// =========================================
function buildSQL(startDate, endDate, timeType) {
    //let dateFormat, groupBy, tableName, dateCondition;
	
	var sql = " select  gas.day as time_label,total_exhaust,machining,assembly,motor,rd,difference,offline_output,machining_output,assembly_output,motor_output,ROUND(total_exhaust / NULLIF(offline_output, 0), 3) as total_per_unit,ROUND(machining / NULLIF(machining_output, 0), 3) as machining_per_unit,ROUND(assembly / NULLIF(assembly_output, 0), 3) as assembly_per_unit,ROUND(motor / NULLIF(motor_output, 0), 3) as motor_per_unit from ( ";
	
	
	//计算气量的部分
	sql += "select";
	if(timeType == "month"){
		sql+="	DATE_FORMAT(r.jDay, '%m-%d') as day, \n";	
	}else if(timeType == "year"){
		// 年模式：如果传入的是年份（4位），则转换为完整日期范围
		// 如果传入的是完整日期，则保持原样
		if(startDate && startDate.length === 4) {
			// 只有年份，转换为整年范围
			endDate = startDate+"-12-31";
			startDate = startDate+"-01-01";
		}
		// 如果是完整日期格式（YYYY-MM-DD），则保持用户输入的范围
		sql+="	DATE_FORMAT(r.jDay, '%Y-%m') as day, \n";
	}
		sql+="	sum(case when gas_name in ('gas_1') then sum_FLOW_total else 0 end) as total_exhaust, \n" 
		+"	sum(case when gas_name in ('gas_3') then sum_FLOW_total else 0 end) + sum(case when gas_name in ('gas_8') then sum_FLOW_total else 0 end) - sum(case when gas_name in ('gas_9') then sum_FLOW_total else 0 end) - sum(case when gas_name in ('gas_6') then sum_FLOW_total else 0 end) as machining, \n"
		+"	sum(case when gas_name in ('gas_2') then sum_FLOW_total else 0 end) + sum(case when gas_name in ('gas_9') then sum_FLOW_total else 0 end) + sum(case when gas_name in ('gas_4') then sum_FLOW_total else 0 end) - sum(case when gas_name in ('gas_7') then sum_FLOW_total else 0 end) as assembly, \n"
		+"	sum(case when gas_name in ('gas_6') then sum_FLOW_total else 0 end) as motor ,	\n"
		+"	sum(case when gas_name in ('gas_7') then sum_FLOW_total else 0 end) as rd ,	\n"
		+"	sum(case when gas_name in ('gas_1') then sum_FLOW_total else 0 end)  - sum(case when gas_name in ('gas_3') then sum_FLOW_total else 0 end) - sum(case when gas_name in ('gas_8') then sum_FLOW_total else 0 end) - sum(case when gas_name in ('gas_2') then sum_FLOW_total else 0 end) -sum(case when gas_name in ('gas_4') then sum_FLOW_total else 0 end)  as difference \n" 
		+"	from (   	\n"
		+"		select DATE_FORMAT(date, '%Y-%m-%d') as jDay \n"
		+"		,CONCAT('gas', '_', NO) as gas_name \n"
		+"		,sum_FLOW_total \n"
		+"		from sum_gas_flow_total_by_day  \n"
		+"		where no in (1,2,3,4,6,7,8,9)	\n"
		+" 		and date <= '"+endDate+"'  \n" 
		+" 		AND date >= '"+startDate+"'	\n"; 
	debugger;
	let compareDate = new Date();
	compareDate.setHours(7, 0, 0, 0);
	//如果当天在查询区间范围内
	if(new Date(startDate).setHours(7, 0, 0, 0) <= compareDate &&  compareDate <= new Date(endDate).setHours(7, 0, 0, 0) ){
		sql += " union all \n" 
			+"		SELECT DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as jDay \n"
			+"		,CONCAT('gas', '_', data_gas.gas_ID) as gas_name		\n"
			+"		,IF((lead(data_gas.gas_ID, 1, 0) OVER (ORDER BY data_gas.gas_ID, date_format(data_gas.date, '%Y-%m-%d %H:00:00')) = data_gas.gas_ID),	lead(min( data_gas.FLOW_total ), 1, 0) OVER (ORDER BY data_gas.gas_ID, date_format( data_gas.date,'%Y-%m-%d %H:00:00')),max( data_gas.FLOW_total)) - min( data_gas.FLOW_total ) AS sum_FLOW_total	\n"
			+"		FROM data_gas 	\n"
			+"		WHERE data_gas.date <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')  \n"
			+"		AND data_gas.date >= DATE_FORMAT(now() , '%Y-%m-%d 07:00:00')	\n"
			+"		and data_gas.FLOW_total != 0 and data_gas.FLOW_total != 99999999		\n"
			+"		and data_gas.gas_ID in (1,2,3,4,6,7,8,9)	\n"
			+" 	GROUP BY data_gas.gas_ID,DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') \n" ;
	}
	sql+=" 	) r \n" 
			+" where r.jDay >= '"+startDate+"' and r.jDay <= '"+endDate+"' \n" ;
	if(timeType == "month"){
		sql += " group by DATE_FORMAT(r.jDay, '%m-%d')  order BY r.jDay \n" ;		
	}else if (timeType == "year"){
		sql += " group by DATE_FORMAT(r.jDay, '%Y-%m')  order BY DATE_FORMAT(r.jDay, '%Y-%m') \n" ;	
	}
	console.info(sql);		
	
	
		
	sql += ") gas left join (";
	
	
	
	
	//
	//计算气量的部分
	sql += " select ";
	if(timeType == "month"){
		sql+="	DATE_FORMAT(r.jDay, '%m-%d') as day, \n";	
	}else if(timeType == "year"){
		sql+="	DATE_FORMAT(r.jDay, '%Y-%m') as day, \n";
	}
		 
		sql+=" offline_output,machining_output,assembly_output,motor_output \n" 
			+" from (  \n" ;
			
	if(timeType == "month" || timeType == "year"){
		sql += " 	select DATE_FORMAT(date, '%Y-%m-%d') as jDay \n" ;
			
	}	
		sql +=" ,finished as offline_output \n" 
			+" 	,machining as machining_output \n" 
			+" 	,assembly as assembly_output \n" 
			+" 	,motor as motor_output \n" 
			+" 	from data_input_compressor  \n" 
			+" 	where 	\n" 
			+" 	date <= '"+endDate+"'  \n" 
			+" 	AND date >= '"+startDate+"'	\n"; 
	debugger;

			
		sql+=" 	) r \n" 
			+" where r.jDay >= '"+startDate+"' and r.jDay <= '"+endDate+"' \n" ;
	if(timeType == "month"){
		sql += " group by DATE_FORMAT(r.jDay, '%m-%d')  order BY r.jDay \n" ;		
	}else if (timeType == "year"){
		sql += " group by DATE_FORMAT(r.jDay, '%Y-%m')  order BY DATE_FORMAT(r.jDay, '%Y-%m') \n" ;	
	}
	sql += ") output on gas.day = output.day ";
	console.info(sql);

    
    return sql.trim();
}
// =========================================
// 模拟数据生成函数
// =========================================

// 月查询模拟数据（日级别）- 显示整个月的数据
function generateMonthData(startDate, endDate) {
    const rows = [];
    const chartLabels = [];
    const totalPerUnitValues = [];
    const machiningPerUnitValues = [];
    const motorPerUnitValues = [];
    const assemblyPerUnitValues = [];
    
    const start = new Date(startDate);
    const today = new Date(endDate);  // 今天的日期，用于判断是否有数据
    
    // 获取该月的天数（显示整个月）
    const year = start.getFullYear();
    const month = start.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();  // 该月总天数
    
    // 根据图片中的表格数据（示例数据）
    const sampleData = [
        { total: 38.27, machining: 3.52, motor: 4.54, assembly: 18.32, totalExhaust: 112715.0, machiningUsage: 62985.5, assemblyUsage: 36796.0, motorUsage: 10294.0, rdUsage: 8.0, difference: 2631.5, offlineOutput: 2945, machiningOutput: 17904, assemblyOutput: 2009, motorOutput: 2269 },
        { total: 37.46, machining: 3.42, motor: 4.49, assembly: 15.99, totalExhaust: 112455.0, machiningUsage: 63703.5, assemblyUsage: 36978.0, motorUsage: 10086.0, rdUsage: 8.0, difference: 1679.5, offlineOutput: 3002, machiningOutput: 18620, assemblyOutput: 2313, motorOutput: 2248 },
        { total: 35.97, machining: 3.53, motor: 4.54, assembly: 17.31, totalExhaust: 112763.0, machiningUsage: 63066.0, assemblyUsage: 38158.0, motorUsage: 10724.0, rdUsage: 8.0, difference: 807.0, offlineOutput: 3135, machiningOutput: 17848, assemblyOutput: 2205, motorOutput: 2362 },
        { total: 38.40, machining: 3.35, motor: 5.76, assembly: 17.75, totalExhaust: 111539.0, machiningUsage: 63137.0, assemblyUsage: 37958.0, motorUsage: 9828.0, rdUsage: 8.0, difference: 608.0, offlineOutput: 2905, machiningOutput: 18869, assemblyOutput: 2138, motorOutput: 1706 },
        { total: 39.12, machining: 3.19, motor: 2.31, assembly: 16.30, totalExhaust: 110096.0, machiningUsage: 59497.5, assemblyUsage: 37934.0, motorUsage: 5086.0, rdUsage: 8.0, difference: 7570.5, offlineOutput: 2814, machiningOutput: 18668, assemblyOutput: 2327, motorOutput: 2205 },
        { total: 12.30, machining: 1.34, motor: 2.00, assembly: 5.86, totalExhaust: 27489.0, machiningUsage: 20966.5, assemblyUsage: 4122.0, motorUsage: 654.0, rdUsage: 0.0, difference: 1746.5, offlineOutput: 2235, machiningOutput: 15683, assemblyOutput: 703, motorOutput: 327 },
        { total: 0.00, machining: 6.63, motor: 0.00, assembly: 0.00, totalExhaust: 10846.0, machiningUsage: 7325.5, assemblyUsage: 1842.0, motorUsage: 378.0, rdUsage: 0.0, difference: 1300.5, offlineOutput: 0, machiningOutput: 1105, assemblyOutput: 0, motorOutput: 0 },
        { total: 41.68, machining: 3.23, motor: 1.70, assembly: 15.56, totalExhaust: 114745.0, machiningUsage: 59719.0, assemblyUsage: 38628.0, motorUsage: 3644.0, rdUsage: 8.0, difference: 12746.0, offlineOutput: 2753, machiningOutput: 18475, assemblyOutput: 2483, motorOutput: 2139 },
        { total: 39.34, machining: 3.56, motor: 4.30, assembly: 17.82, totalExhaust: 114898.0, machiningUsage: 63737.0, assemblyUsage: 39070.0, motorUsage: 9840.0, rdUsage: 8.0, difference: 2243.0, offlineOutput: 2921, machiningOutput: 17912, assemblyOutput: 2192, motorOutput: 2286 },
        { total: 38.68, machining: 3.68, motor: 4.25, assembly: 15.69, totalExhaust: 113398.0, machiningUsage: 63321.5, assemblyUsage: 38242.0, motorUsage: 10278.0, rdUsage: 8.0, difference: 1548.5, offlineOutput: 2932, machiningOutput: 17194, assemblyOutput: 2438, motorOutput: 2421 },
        { total: 37.48, machining: 3.51, motor: 3.94, assembly: 15.86, totalExhaust: 114358.0, machiningUsage: 63287.0, assemblyUsage: 37774.0, motorUsage: 8972.0, rdUsage: 8.0, difference: 4317.0, offlineOutput: 3051, machiningOutput: 18011, assemblyOutput: 2381, motorOutput: 2279 },
        { total: 35.49, machining: 2.14, motor: 3.87, assembly: 16.95, totalExhaust: 108096.0, machiningUsage: 35790.0, assemblyUsage: 38500.0, motorUsage: 8696.0, rdUsage: 8.0, difference: 25102.0, offlineOutput: 3046, machiningOutput: 16751, assemblyOutput: 2271, motorOutput: 2248 },
        { total: 36.82, machining: 3.28, motor: 4.12, assembly: 16.45, totalExhaust: 110500.0, machiningUsage: 61000.0, assemblyUsage: 37500.0, motorUsage: 9800.0, rdUsage: 8.0, difference: 2192.0, offlineOutput: 3002, machiningOutput: 18600, assemblyOutput: 2280, motorOutput: 2378 },
        { total: 37.15, machining: 3.41, motor: 4.38, assembly: 17.02, totalExhaust: 111200.0, machiningUsage: 62500.0, assemblyUsage: 37800.0, motorUsage: 10100.0, rdUsage: 8.0, difference: 792.0, offlineOutput: 2994, machiningOutput: 18330, assemblyOutput: 2221, motorOutput: 2306 },
        { total: 38.92, machining: 3.58, motor: 4.65, assembly: 17.88, totalExhaust: 113600.0, machiningUsage: 63200.0, assemblyUsage: 38600.0, motorUsage: 10500.0, rdUsage: 8.0, difference: 1292.0, offlineOutput: 2919, machiningOutput: 17654, assemblyOutput: 2159, motorOutput: 2258 },
        { total: 36.55, machining: 3.22, motor: 4.01, assembly: 16.12, totalExhaust: 109800.0, machiningUsage: 60800.0, assemblyUsage: 37200.0, motorUsage: 9600.0, rdUsage: 8.0, difference: 2192.0, offlineOutput: 3005, machiningOutput: 18880, assemblyOutput: 2308, motorOutput: 2393 },
        { total: 39.45, machining: 3.62, motor: 4.72, assembly: 18.05, totalExhaust: 114200.0, machiningUsage: 63600.0, assemblyUsage: 39000.0, motorUsage: 10800.0, rdUsage: 8.0, difference: 792.0, offlineOutput: 2895, machiningOutput: 17568, assemblyOutput: 2160, motorOutput: 2288 },
        { total: 37.88, machining: 3.45, motor: 4.28, assembly: 16.78, totalExhaust: 112000.0, machiningUsage: 62200.0, assemblyUsage: 38100.0, motorUsage: 10000.0, rdUsage: 8.0, difference: 1692.0, offlineOutput: 2957, machiningOutput: 18030, assemblyOutput: 2270, motorOutput: 2336 },
        { total: 40.12, machining: 3.71, motor: 4.85, assembly: 18.32, totalExhaust: 115000.0, machiningUsage: 64000.0, assemblyUsage: 39500.0, motorUsage: 11000.0, rdUsage: 8.0, difference: 492.0, offlineOutput: 2866, machiningOutput: 17245, assemblyOutput: 2156, motorOutput: 2268 },
        { total: 36.28, machining: 3.18, motor: 3.95, assembly: 15.98, totalExhaust: 108500.0, machiningUsage: 60200.0, assemblyUsage: 36800.0, motorUsage: 9400.0, rdUsage: 8.0, difference: 2092.0, offlineOutput: 2992, machiningOutput: 18930, assemblyOutput: 2302, motorOutput: 2380 },
        { total: 38.65, machining: 3.55, motor: 4.58, assembly: 17.45, totalExhaust: 113200.0, machiningUsage: 63000.0, assemblyUsage: 38400.0, motorUsage: 10600.0, rdUsage: 8.0, difference: 1192.0, offlineOutput: 2929, machiningOutput: 17746, assemblyOutput: 2201, motorOutput: 2314 },
        { total: 37.72, machining: 3.38, motor: 4.22, assembly: 16.65, totalExhaust: 111500.0, machiningUsage: 61800.0, assemblyUsage: 37900.0, motorUsage: 9900.0, rdUsage: 8.0, difference: 1892.0, offlineOutput: 2958, machiningOutput: 18280, assemblyOutput: 2275, motorOutput: 2345 },
        { total: 39.88, machining: 3.68, motor: 4.78, assembly: 18.18, totalExhaust: 114800.0, machiningUsage: 63800.0, assemblyUsage: 39300.0, motorUsage: 10900.0, rdUsage: 8.0, difference: 792.0, offlineOutput: 2878, machiningOutput: 17340, assemblyOutput: 2163, motorOutput: 2280 },
        { total: 36.95, machining: 3.32, motor: 4.15, assembly: 16.38, totalExhaust: 110200.0, machiningUsage: 61400.0, assemblyUsage: 37400.0, motorUsage: 9700.0, rdUsage: 8.0, difference: 1692.0, offlineOutput: 2982, machiningOutput: 18490, assemblyOutput: 2285, motorOutput: 2337 },
        { total: 38.35, machining: 3.52, motor: 4.52, assembly: 17.28, totalExhaust: 112800.0, machiningUsage: 62700.0, assemblyUsage: 38200.0, motorUsage: 10400.0, rdUsage: 8.0, difference: 1492.0, offlineOutput: 2941, machiningOutput: 17800, assemblyOutput: 2210, motorOutput: 2301 },
        { total: 37.42, machining: 3.42, motor: 4.35, assembly: 16.92, totalExhaust: 111800.0, machiningUsage: 62100.0, assemblyUsage: 38000.0, motorUsage: 10050.0, rdUsage: 8.0, difference: 1642.0, offlineOutput: 2988, machiningOutput: 18150, assemblyOutput: 2246, motorOutput: 2310 },
        { total: 39.18, machining: 3.59, motor: 4.68, assembly: 17.92, totalExhaust: 114000.0, machiningUsage: 63400.0, assemblyUsage: 38800.0, motorUsage: 10700.0, rdUsage: 8.0, difference: 1092.0, offlineOutput: 2910, machiningOutput: 17660, assemblyOutput: 2165, motorOutput: 2286 },
        { total: 36.68, machining: 3.25, motor: 4.08, assembly: 16.25, totalExhaust: 109500.0, machiningUsage: 60600.0, assemblyUsage: 37100.0, motorUsage: 9550.0, rdUsage: 8.0, difference: 2242.0, offlineOutput: 2987, machiningOutput: 18650, assemblyOutput: 2282, motorOutput: 2340 },
        { total: 38.02, machining: 3.48, motor: 4.42, assembly: 17.15, totalExhaust: 112400.0, machiningUsage: 62400.0, assemblyUsage: 38300.0, motorUsage: 10200.0, rdUsage: 8.0, difference: 1492.0, offlineOutput: 2956, machiningOutput: 17930, assemblyOutput: 2232, motorOutput: 2308 },
        { total: 37.58, machining: 3.35, motor: 4.18, assembly: 16.52, totalExhaust: 111000.0, machiningUsage: 61600.0, assemblyUsage: 37600.0, motorUsage: 9850.0, rdUsage: 8.0, difference: 1942.0, offlineOutput: 2954, machiningOutput: 18400, assemblyOutput: 2276, motorOutput: 2356 },
        { total: 39.65, machining: 3.65, motor: 4.75, assembly: 18.08, totalExhaust: 114500.0, machiningUsage: 63700.0, assemblyUsage: 39200.0, motorUsage: 10850.0, rdUsage: 8.0, difference: 742.0, offlineOutput: 2888, machiningOutput: 17450, assemblyOutput: 2168, motorOutput: 2284 }
    ];
    
    // 遍历整个月的每一天
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const monthNum = (month + 1).toString();
        const dayLabel = `${monthNum}月${day}日`;
        const chartDay = `${day}日`;
        
        // 判断这一天是否已经有数据（是否已过或是今天）
        const hasData = currentDate <= today;
        
        // 获取示例数据（循环使用）
        const dataIndex = (day - 1) % sampleData.length;
        const data = sampleData[dataIndex];
        
        chartLabels.push(chartDay);
        
        if (hasData) {
            // 有数据的日期显示实际值
            totalPerUnitValues.push(data.total);
            machiningPerUnitValues.push(data.machining);
            motorPerUnitValues.push(data.motor);
            assemblyPerUnitValues.push(data.assembly);
            
            rows.push({
                time_label: dayLabel,
                total_exhaust: data.totalExhaust,
                machining: data.machiningUsage,
                assembly: data.assemblyUsage,
                motor: data.motorUsage,
                rd: data.rdUsage,
                difference: data.difference,
                offline_output: data.offlineOutput,
                machining_output: data.machiningOutput,
                assembly_output: data.assemblyOutput,
                motor_output: data.motorOutput,
                total_per_unit: data.total,
                machining_per_unit: data.machining,
                assembly_per_unit: data.assembly,
                motor_per_unit: data.motor
            });
        } else {
            // 未来日期显示0或null
            totalPerUnitValues.push(0);
            machiningPerUnitValues.push(0);
            motorPerUnitValues.push(0);
            assemblyPerUnitValues.push(0);
            
            rows.push({
                time_label: dayLabel,
                total_exhaust: 0,
                machining: 0,
                assembly: 0,
                motor: 0,
                rd: 0,
                difference: 0,
                offline_output: 0,
                machining_output: 0,
                assembly_output: 0,
                motor_output: 0,
                total_per_unit: 0,
                machining_per_unit: 0,
                assembly_per_unit: 0,
                motor_per_unit: 0
            });
        }
    }
    
    return {
        rows,
        chartLabels,
        totalPerUnitValues,
        machiningPerUnitValues,
        motorPerUnitValues,
        assemblyPerUnitValues
    };
}

// 年查询模拟数据（月级别）
function generateYearData(year) {
    const rows = [];
    const chartLabels = [];
    const totalPerUnitValues = [];
    const machiningPerUnitValues = [];
    const motorPerUnitValues = [];
    const assemblyPerUnitValues = [];

    for (let m = 1; m <= 12; m++) {
        const monthLabel = `${m}月`;
        
        // 模拟月度数据
        const total = (Math.random() * 15 + 30).toFixed(2);
        const machining = (Math.random() * 2 + 2).toFixed(2);
        const motor = (Math.random() * 3 + 2).toFixed(2);
        const assembly = (Math.random() * 5 + 12).toFixed(2);
        
        chartLabels.push(monthLabel);
        totalPerUnitValues.push(parseFloat(total));
        machiningPerUnitValues.push(parseFloat(machining));
        motorPerUnitValues.push(parseFloat(motor));
        assemblyPerUnitValues.push(parseFloat(assembly));

        const totalExhaust = Math.floor(Math.random() * 20000 + 100000);
        const machiningUsage = Math.floor(totalExhaust * 0.55);
        const assemblyUsage = Math.floor(totalExhaust * 0.35);
        const motorUsage = Math.floor(totalExhaust * 0.08);
        const rdUsage = 8;
        const difference = totalExhaust - machiningUsage - assemblyUsage - motorUsage - rdUsage;

        const offlineOutput = Math.floor(Math.random() * 1500 + 2500);
        const machiningOutput = Math.floor(offlineOutput * 6);
        const assemblyOutput = Math.floor(offlineOutput * 0.8);
        const motorOutput = Math.floor(offlineOutput * 0.75);

        rows.push({
            time_label: monthLabel,
            total_exhaust: totalExhaust,
            machining: machiningUsage,
            assembly: assemblyUsage,
            motor: motorUsage,
            rd: rdUsage,
            difference: difference,
            offline_output: offlineOutput,
            machining_output: machiningOutput,
            assembly_output: assemblyOutput,
            motor_output: motorOutput,
            total_per_unit: parseFloat(total),
            machining_per_unit: parseFloat(machining),
            assembly_per_unit: parseFloat(assembly),
            motor_per_unit: parseFloat(motor)
        });
    }

    return {
        rows,
        chartLabels,
        totalPerUnitValues,
        machiningPerUnitValues,
        motorPerUnitValues,
        assemblyPerUnitValues
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

    const { rows, chartLabels, totalPerUnitValues, machiningPerUnitValues, motorPerUnitValues, assemblyPerUnitValues } = mockData;

    // 表格列定义 - 按照二级表头结构
    const columns = [
        {
            field: 'time_label',
            title: '时间',
            type: 'text',
            rowSpan: 2
        },
        {
            title: '压缩空气用量（Nm³）',
            children: [
                { field: 'total_exhaust', title: '总排气量', type: 'number', decimal: 2 },
                { field: 'machining', title: '机加工', type: 'number', decimal: 2 },
                { field: 'assembly', title: '组装', type: 'number', decimal: 2 },
                { field: 'motor', title: '电机', type: 'number', decimal: 2 },
                { field: 'rd', title: '研发', type: 'number', decimal: 2 },
                { field: 'difference', title: '差值', type: 'number', decimal: 2, highlight: true }
            ]
        },
        {
            title: '日产量（台）手动输入',
            children: [
                { field: 'offline_output', title: '下线产量', type: 'number', decimal: 0 },
                { field: 'machining_output', title: '机加工', type: 'number', decimal: 0 },
                { field: 'assembly_output', title: '组装', type: 'number', decimal: 0 },
                { field: 'motor_output', title: '电机', type: 'number', decimal: 0 }
            ]
        },
        {
            title: '单台用气量Nm³/台',
            children: [
                { field: 'total_per_unit', title: '总', type: 'number', decimal: 3, highlight: true },
                { field: 'machining_per_unit', title: '机加工', type: 'number', decimal: 3 },
                { field: 'assembly_per_unit', title: '组装', type: 'number', decimal: 3 },
                { field: 'motor_per_unit', title: '电机', type: 'number', decimal: 3 }
            ]
        }
    ];

    return {
        // 图表数据 - 4个柱状图
        charts: [
            // 图表1：总单台用气量
            {
                xAxis: { data: chartLabels },
                legend: { 
                    show: true,
                    data: ['总单台用气量']
                },
                series: [
                    {
                        name: '总单台用气量',
                        type: 'bar',
                        data: totalPerUnitValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: function(params) {
                                return params.value.toFixed(2);
                            }
                        }
                    }
                ]
            },
            // 图表2：机加工单台用气量
            {
                xAxis: { data: chartLabels },
                legend: { 
                    show: true,
                    data: ['机加工单台用气量']
                },
                series: [
                    {
                        name: '机加工单台用气量',
                        type: 'bar',
                        data: machiningPerUnitValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: function(params) {
                                return params.value.toFixed(2);
                            }
                        }
                    }
                ]
            },
            // 图表3：电机单台用气量
            {
                xAxis: { data: chartLabels },
                legend: { 
                    show: true,
                    data: ['电机单台用气量']
                },
                series: [
                    {
                        name: '电机单台用气量',
                        type: 'bar',
                        data: motorPerUnitValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: function(params) {
                                return params.value.toFixed(2);
                            }
                        }
                    }
                ]
            },
            // 图表4：组装单台用气量
            {
                xAxis: { data: chartLabels },
                legend: { 
                    show: true,
                    data: ['组装单台用气量']
                },
                series: [
                    {
                        name: '组装单台用气量',
                        type: 'bar',
                        data: assemblyPerUnitValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: function(params) {
                                return params.value.toFixed(2);
                            }
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
function transformData(data, timeType){
	let mockData = data;
	let chartLabels = [];
	let totalPerUnitValues  = [];
	let machiningPerUnitValues = [];
	let motorPerUnitValues = [];
	let assemblyPerUnitValues = [];
    

    //const { rows, chartLabels, totalPerUnitValues, machiningPerUnitValues, motorPerUnitValues, assemblyPerUnitValues } = mockData;
	for(let i=0;i<data.length;i++){
		chartLabels.push(data[i].time_label);
		totalPerUnitValues.push(parseFloat(data[i].total_per_unit));
		machiningPerUnitValues.push(parseFloat(data[i].machining_per_unit));
		motorPerUnitValues.push(parseFloat(data[i].motor_per_unit));
		assemblyPerUnitValues.push(parseFloat(data[i].assembly_per_unit));
	}
    // 表格列定义 - 按照二级表头结构
    const columns = [
        {
            field: 'time_label',
            title: '时间',
            type: 'text',
            rowSpan: 2
        },
        {
            title: '压缩空气用量（Nm³）',
            children: [
                { field: 'total_exhaust', title: '总排气量', type: 'number', decimal: 2 },
                { field: 'machining', title: '机加工', type: 'number', decimal: 2 },
                { field: 'assembly', title: '组装', type: 'number', decimal: 2 },
                { field: 'motor', title: '电机', type: 'number', decimal: 2 },
                { field: 'rd', title: '研发', type: 'number', decimal: 2 },
                { field: 'difference', title: '差值', type: 'number', decimal: 2 }
            ]
        },
        {
            title: '日产量（台）手动输入',
            children: [
                { field: 'offline_output', title: '下线产量', type: 'number', decimal: 0 },
                { field: 'machining_output', title: '机加工', type: 'number', decimal: 0 },
                { field: 'assembly_output', title: '组装', type: 'number', decimal: 0 },
                { field: 'motor_output', title: '电机', type: 'number', decimal: 0 }
            ]
        },
        {
            title: '单台用气量Nm³/台',
            children: [
                { field: 'total_per_unit', title: '总', type: 'number', decimal: 3 },
                { field: 'machining_per_unit', title: '机加工', type: 'number', decimal: 3 },
                { field: 'assembly_per_unit', title: '组装', type: 'number', decimal: 3 },
                { field: 'motor_per_unit', title: '电机', type: 'number', decimal: 3 }
            ]
        }
    ];

    return {
        // 图表数据 - 4个柱状图
        charts: [
            // 图表1：总单台用气量
            {
                xAxis: { data: chartLabels },
                legend: { 
                    show: true,
                    data: ['总单台用气量']
                },
                series: [
                    {
                        name: '总单台用气量',
                        type: 'bar',
                        data: totalPerUnitValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: function(params) {
                                return params.value.toFixed(2);
                            }
                        }
                    }
                ]
            },
            // 图表2：机加工单台用气量
            {
                xAxis: { data: chartLabels },
                legend: { 
                    show: true,
                    data: ['机加工单台用气量']
                },
                series: [
                    {
                        name: '机加工单台用气量',
                        type: 'bar',
                        data: machiningPerUnitValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: function(params) {
                                return params.value.toFixed(2);
                            }
                        }
                    }
                ]
            },
            // 图表3：电机单台用气量
            {
                xAxis: { data: chartLabels },
                legend: { 
                    show: true,
                    data: ['电机单台用气量']
                },
                series: [
                    {
                        name: '电机单台用气量',
                        type: 'bar',
                        data: motorPerUnitValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: function(params) {
                                return params.value.toFixed(2);
                            }
                        }
                    }
                ]
            },
            // 图表4：组装单台用气量
            {
                xAxis: { data: chartLabels },
                legend: { 
                    show: true,
                    data: ['组装单台用气量']
                },
                series: [
                    {
                        name: '组装单台用气量',
                        type: 'bar',
                        data: assemblyPerUnitValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9,
                            formatter: function(params) {
                                return params.value.toFixed(2);
                            }
                        }
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
console.log('%c 📊 单台用气量统计报表 - 上面4个图表，下面1个表格', 'color: #1e88e5; font-weight: bold; font-size: 16px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
console.log(`
%c图表布局说明：

• 图表1：总单台用气量（柱状图）
• 图表2：机加工单台用气量（柱状图）
• 图表3：电机单台用气量（柱状图）
• 图表4：组装单台用气量（柱状图）

%c表格说明：

• 压缩空气用量（Nm³）：总排气量、机加工、组装、电机、研发、差值
• 日产量（台）：下线产量、机加工、组装、电机
• 单台用气量Nm³/台：总、机加工、组装、电机
• 支持导出Excel功能
`, 'color: #333;', 'color: #00b894;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #666;');
