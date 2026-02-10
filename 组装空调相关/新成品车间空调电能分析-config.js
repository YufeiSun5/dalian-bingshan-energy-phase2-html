/**
 * 新成品车间空调电能分析 - 配置文件
 *
 * 布局：上面1个双Y轴折线图，下面1个纵向表格
 * 支持 日/月/年 三种时间粒度切换
 * - 日：小时级数据（只能查询单天）
 * - 月：日级数据（可以选择日期范围）
 * - 年：月级数据（只能查询单年）
 */

// =========================================
// 配置：新成品车间空调电能分析
// =========================================

window.PAGE_CONFIG = {
    // 页面标题
    title: '新成品车间空调电量分析',

    // 图表区域标题
    chartsTitle: '新成品空调用电量+室内温度',

    // 表格区域标题
    tablesTitle: '统计数据',

    // 是否自动加载数据
    autoLoad: true,

    // 默认时间类型: 'day' | 'month' | 'year'
    defaultTimeType: 'month',

    // =========================================
    // 图表配置（1个双Y轴折线图）
    // =========================================
    charts: [
        {
            title: '新成品空调用电量+室内温度',
            flex: 1,  // 占满整个图表区域
            option: {
                legend: { 
                    show: true,
                    data: ['用电量', '室外气温', '室内温度'],
                    textStyle: { color: '#d0d2e0' },
                    top: 5
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(p => {
                            if (p.value !== null && p.value !== undefined) {
                                const unit = p.seriesName === '用电量' ? ' kwh' : ' ℃';
                                result += `${p.marker} ${p.seriesName}: ${p.value}${unit}<br/>`;
                            }
                        });
                        return result;
                    }
                },
                // 双Y轴配置
                yAxis: [
                    {
                        type: 'value',
                        name: '用电量(kwh)',
                        position: 'left',
                        axisLine: { lineStyle: { color: '#2a6dc8' } },
                        axisLabel: { color: '#d0d2e0' },
                        splitLine: { lineStyle: { color: '#2a6dc8', opacity: 0.3 } }
                    },
                    {
                        type: 'value',
                        name: '温度(℃)',
                        position: 'right',
                        axisLine: { lineStyle: { color: '#2a6dc8' } },
                        axisLabel: { color: '#d0d2e0' },
                        splitLine: { show: false }
                    }
                ],
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
    // 表格配置（1个横向表格）
    // =========================================
    tables: [
        {
            title: '统计数据明细',
            flex: 1
        }
    ],

    // =========================================
    // 数据获取函数（核心）
    // params: { startDate, endDate, timeType }
    // timeType: 'day' | 'month' | 'year'
    // =========================================
    fetchData: async function(params) {
        const { startDate, endDate, timeType } = params;

        console.log('============= 新成品车间空调电能分析查询参数 =============');
        console.log('开始日期:', startDate);
        console.log('结束日期:', endDate);
        console.log('时间类型:', timeType);
        console.log('========================================================');

        try {
            // TODO: 这里实现实际的API调用
            // 目前使用模拟数据
			
			const sql = buildSQL(startDate, endDate, timeType);
            const response = await sendSQL(sql);
			return transformData(response.data, timeType);
			
            //return getMockData(timeType, startDate, endDate);

        } catch (error) {
            console.error('获取新成品车间空调电能数据失败:', error);
            //return getMockData(timeType, startDate, endDate);
        }
    }
};
// =========================================
// SQL 构建函数（示例，根据实际表结构修改）
// =========================================
function buildSQL(startDate, endDate, timeType) {
    //let dateFormat, groupBy, tableName, dateCondition;
	
	var sql = " select  elec.day as time,total_elec as electric,indoorTemp,outdoorTemp from ( ";
	
	
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
		 
		
		sql+=" sum(case when elec_name in ('elec_120013') then sum_elec else 0 end) as total_elec \n" 
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
		sql+=" 	where no = 120013	\n" 
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
			+" 	and no = 120013	\n";
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
	
	
	
	
	sql += ") elec right join (";
	
	
	
	
	//console.info(sql);
	//计算温度的部分
	sql += " select ";
	if(timeType == "month"){
		sql+="	DATE_FORMAT(date, '%m-%d') as day, \n";	
	}else if(timeType == "day"){
		
		sql+="	DATE_FORMAT(date, '%H:00') as day, \n";
	}else if(timeType == "year"){
		sql+="	DATE_FORMAT(date, '%Y-%m') as day, \n";
	}
	
	sql += " ROUND(AVG(A_Temp),1) as indoorTemp ,ROUND(AVG(C_Temp),1) as outdoorTemp from data_temp \n"
	+"  where no = 120013 \n";
	
		 
		
	if(timeType == "day"){
		sql +=" 	and date <= '"+endDate+"'  \n" 
		+" 	AND date >= '"+startDate+"'	\n"
		+" group by DATE_FORMAT(date, '%H:00') order BY DATE_FORMAT(date, '%H:00') \n" ;
	}else if(timeType == "month"){
		sql += " 	and date < DATE_ADD('"+endDate+"  07:00:00',INTERVAL 1 day )  \n" 
		+" 	AND date >= '"+startDate+" 07:00:00'	\n"
		+" group by DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%m-%d')  order BY DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%m-%d') \n" ;		
	}else if (timeType == "year"){
		sql += " 	and date < DATE_ADD('"+endDate+"  07:00:00',INTERVAL 1 day ) \n" 
		+" 	AND date >= '"+startDate+"  07:00:00'	\n"
		+" group by DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m')  order BY DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m') \n" ;	
	}
	sql += ") temp on elec.day = temp.day ";
	console.info(sql);
    
    return sql.trim();
}

function transformData(data, timeType) {
	debugger;
    let mockData = data;
	const timeLabels = [];
    const electricValues = [];
    const outdoorTempValues = []; 
	const avgTempValues = [];
    

    for(let i=0;i<data.length;i++){
		timeLabels.push(data[i].time);
		electricValues.push(parseFloat(data[i].electric));
		outdoorTempValues.push(parseFloat(data[i].outdoorTemp));
		avgTempValues.push(parseFloat(data[i].indoorTemp));
	}
    // 纵向表格：时间在最左列，指标作为表头
    
    // 构建表格列定义
    const columns = [
        {
            field: 'time',
            title: '时间',
            type: 'text',
            width: 120
        },
        {
            field: 'electric',
            title: '实时用电量(kwh)',
            type: 'number',
            _headerClass: 'header-green'  // 绿色表头
        },
        {
            field: 'indoorTemp',
            title: '室内气温(℃)',
            type: 'number'
        },
        {
            field: 'outdoorTemp',
            title: '外界气温(℃)',
            type: 'number',
            _headerClass: 'header-yellow'  // 黄色表头
        }
    ];


    return {
        // 图表数据 - 双Y轴折线图
        charts: [
            {
                xAxis: { data: timeLabels },
                series: [
                    {
                        name: '用电量',
                        type: 'bar',
                        yAxisIndex: 0,  // 使用左侧Y轴
                        data: electricValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9
                        }
                    },
                    {
                        name: '室外气温',
                        type: 'line',
                        yAxisIndex: 1,  // 使用右侧Y轴
                        data: outdoorTempValues,
                        itemStyle: { color: '#ff5722' },
                        lineStyle: { 
                            color: '#ff5722',
                            width: 2
                        },
                        symbol: 'circle',
                        symbolSize: 6
                    },
                    {
                        name: '室内温度',
                        type: 'line',
                        yAxisIndex: 1,  // 使用右侧Y轴
                        data: avgTempValues,
                        itemStyle: { color: '#4caf50' },
                        lineStyle: { 
                            color: '#4caf50',
                            width: 2
                        },
                        symbol: 'circle',
                        symbolSize: 6
                    }
                ]
            }
        ],
        // 表格数据 - 纵向表格
        tables: [
            {
                columns: columns,
                rows: data
            }
        ]
    };
}


// =========================================
// 模拟数据生成函数
// =========================================

// 日查询模拟数据（小时级别）
function generateDayData(date) {
    const timeLabels = [];
    const electricValues = [];
    const outdoorTempValues = [];
    const avgTempValues = [];
    
    // 生成24小时数据（从07:00到次日06:00，共24个点）
    const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                   '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
                   '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];
    
    hours.forEach(hour => {
        timeLabels.push(hour);
        // 用电量：20-80之间波动
        electricValues.push(Math.floor(Math.random() * 60 + 20));
        // 室外气温：26-31℃之间
        outdoorTempValues.push((Math.random() * 5 + 26).toFixed(1));
        // 室内温度：26-28℃之间
        avgTempValues.push((Math.random() * 2 + 26).toFixed(1));
    });
    
    return {
        timeLabels,
        electricValues,
        outdoorTempValues,
        avgTempValues
    };
}

// 月查询模拟数据（日级别）
function generateMonthData(startDate, endDate) {
    const timeLabels = [];
    const electricValues = [];
    const outdoorTempValues = [];
    const avgTempValues = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const month = d.getMonth() + 1;
        const day = d.getDate();
        timeLabels.push(`${month}.${day}`);
        
        // 用电量：30-75之间
        electricValues.push(Math.floor(Math.random() * 45 + 30));
        // 室外气温：26-31℃
        outdoorTempValues.push((Math.random() * 5 + 26).toFixed(1));
        // 室内温度：26-28℃
        avgTempValues.push((Math.random() * 2 + 26).toFixed(1));
    }
    
    return {
        timeLabels,
        electricValues,
        outdoorTempValues,
        avgTempValues
    };
}

// 年查询模拟数据（月级别）
function generateYearData(year) {
    const timeLabels = [];
    const electricValues = [];
    const outdoorTempValues = [];
    const avgTempValues = [];
    
    for (let m = 1; m <= 12; m++) {
        timeLabels.push(`${m}月`);
        
        // 用电量：1000-2500之间
        electricValues.push(Math.floor(Math.random() * 1500 + 1000));
        // 室外气温：根据季节变化
        const temp = 20 + Math.sin((m - 1) * Math.PI / 6) * 10;
        outdoorTempValues.push(temp.toFixed(1));
        // 室内温度
        avgTempValues.push((temp - 2 + Math.random() * 2).toFixed(1));
    }
    
    return {
        timeLabels,
        electricValues,
        outdoorTempValues,
        avgTempValues
    };
}

// =========================================
// 获取模拟数据主函数
// =========================================
function getMockData(timeType, startDate, endDate) {
    let mockData;

    switch (timeType) {
        case 'day':
            mockData = generateDayData(startDate);
            break;
        case 'month':
            mockData = generateMonthData(startDate, endDate);
            break;
        case 'year':
            mockData = generateYearData(startDate);
            break;
        default:
            mockData = generateMonthData(startDate, endDate);
    }

    const { timeLabels, electricValues, outdoorTempValues, avgTempValues } = mockData;

    // 纵向表格：时间在最左列，指标作为表头
    
    // 构建表格列定义
    const columns = [
        {
            field: 'time',
            title: '时间',
            type: 'text',
            width: 120
        },
        {
            field: 'electric',
            title: '实时用电量(kwh)',
            type: 'number',
            _headerClass: 'header-green'  // 绿色表头
        },
        {
            field: 'indoorTemp',
            title: '室内气温(℃)',
            type: 'number'
        },
        {
            field: 'outdoorTemp',
            title: '外界气温(℃)',
            type: 'number',
            _headerClass: 'header-yellow'  // 黄色表头
        }
    ];

    // 构建表格行数据（纵向）
    const rows = [];
    
    // 每个时间点一行
    timeLabels.forEach((timeLabel, index) => {
        rows.push({
            time: timeLabel,
            electric: electricValues[index],
            indoorTemp: avgTempValues[index],
            outdoorTemp: outdoorTempValues[index]
        });
    });

    return {
        // 图表数据 - 双Y轴折线图
        charts: [
            {
                xAxis: { data: timeLabels },
                series: [
                    {
                        name: '用电量',
                        type: 'bar',
                        yAxisIndex: 0,  // 使用左侧Y轴
                        data: electricValues,
                        itemStyle: { color: '#1e88e5' },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#d0d2e0',
                            fontSize: 9
                        }
                    },
                    {
                        name: '室外气温',
                        type: 'line',
                        yAxisIndex: 1,  // 使用右侧Y轴
                        data: outdoorTempValues,
                        itemStyle: { color: '#ff5722' },
                        lineStyle: { 
                            color: '#ff5722',
                            width: 2
                        },
                        symbol: 'circle',
                        symbolSize: 6
                    },
                    {
                        name: '室内温度',
                        type: 'line',
                        yAxisIndex: 1,  // 使用右侧Y轴
                        data: avgTempValues,
                        itemStyle: { color: '#4caf50' },
                        lineStyle: { 
                            color: '#4caf50',
                            width: 2
                        },
                        symbol: 'circle',
                        symbolSize: 6
                    }
                ]
            }
        ],
        // 表格数据 - 纵向表格
        tables: [
            {
                columns: columns,
                rows: rows
            }
        ]
    };
}

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
console.log('%c 📊 新成品车间空调电能分析 - 双Y轴图表 + 横向表格', 'color: #1e88e5; font-weight: bold; font-size: 16px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
console.log(`
%c图表布局说明：

• 图表：双Y轴折线图
  - 左轴：用电量（柱状图）
  - 右轴：室外气温、室内温度（折线图）

%c表格说明：

• 纵向表格（标准显示）
  - 第一列：时间点
  - 后续列：各项指标数据（实时用电量、室内气温、外界气温）
• 支持三种查询模式：
  - 日：小时级数据（24个点）
  - 月：日级数据（日期范围）
  - 年：月级数据（12个月）
• 支持导出Excel功能
`, 'color: #333;', 'color: #00b894;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #666;');
