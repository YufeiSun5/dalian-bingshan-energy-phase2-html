/**
 * 热泵月度基础数据报表配置
 */
window.REPORT_CONFIG = {
    // ========== 区域和机组对应关系配置 ==========
    // 重要：这个配置用于初始化下拉框，你可以根据实际情况手动调整
    areaUnitMapping: {
        'daban': {
            areaCode: 'rdaban',
            areaName: '大办区域',
            units: [
                { unitCode: '420010', unitNo: '420010', unitName: '冷机' },
                { unitCode: '420009', unitNo: '420009', unitName: '冰山2' },
				{ unitCode: '420002', unitNo: '420002', unitName: '天加1' },
				{ unitCode: '420011', unitNo: '420011', unitName: '欧亚' },
				{ unitCode: '420001', unitNo: '420001', unitName: '天加2' },
				{ unitCode: '420012', unitNo: '420012', unitName: '冰山1' }
            ]
        },
        'dianji': {
            areaCode: 'dianji',
            areaName: '电机区域',
            units: [
                { unitCode: '420015', unitNo: '420015', unitName: '冰山' },
                { unitCode: '420014', unitNo: '420014', unitName: '扬子2'},
				{ unitCode: '420013', unitNo: '420013', unitName: '扬子1'},
				{ unitCode: '420003', unitNo: '420003', unitName: '冷机'},
				{ unitCode: '420004', unitNo: '420004', unitName: '欧亚'},
            ]
        },
		'yanfa': {
            areaCode: '研发',
            areaName: '研发区域',
            units: [
                { unitCode: '420005', unitNo: '420005', unitName: '冷机2'},
                { unitCode: '420007', unitNo: '420007', unitName: '冷机1'},
				{ unitCode: '420008', unitNo: '420008', unitName: '欧亚1'},
				{ unitCode: '420006', unitNo: '420006', unitName: '欧亚2'},
            ]
        },
    },

    // ========== 列定义 (对应表头) ==========
    columns: [
        { field: 'date', title: '日期' },
        { field: 'area', title: '区域' },
        { field: 'unitName', title: '机组名称' },
        { field: 'heat', title: '热量(MJ)' },
        { field: 'power', title: '电量(Kwh)' },
        { field: 'cop', title: '能效比(COP)' },
        { field: 'tempIn', title: '进水温度(℃)' },
        { field: 'tempOut', title: '出水温度(℃)' },
        { field: 'tempOutdoor', title: '室外温度(℃)' },
        { field: 'tempIndoor', title: '室内温度(℃)' },
        { field: 'tempSet', title: '设定温度(℃)' },
        { field: 'runTime', title: '设备运行时间(H)' },
        { field: 'exception', title: '异常记录' },
        { field: 'remark', title: '备注' }
    ],

    // ========== SQL查询接口 (异步) ==========
    // 重要：这里是你后续要接入的真实SQL接口
    // 参数：unitNo (机组编号), monthStr (月份字符串，格式: "2024-01")
    // 返回：Promise对象，解析为 { rows: [], totalRow: {} }
    fetchSQLData:async function(unitNo, monthStr,areaName,unitName) {
		console.log('🔧 [SQL接口调用] unitNo:', unitNo, 'monthStr:', monthStr,'areaName:', areaName);
		const sql = buildSQL(unitNo,monthStr);
		const response = await sendSQL(sql);
		console.info(response);
        return new Promise(function(resolve, reject) {
            // ==================== 你的SQL接口调用位置 ====================
            // TODO: 在这里接入你的真实SQL查询接口
            //
            // 示例代码（后续替换成真实接口）：
            // fetch('/api/heatpump/monthly-data', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ unitNo: unitNo, month: monthStr })
            // })
            // .then(res => res.json())
            // .then(data => resolve(data))
            // .catch(err => reject(err));

            // 目前先返回模拟数据，等你接入真实接口后删除这段模拟代码
            
            setTimeout(function() {
                //var mockData = window.REPORT_CONFIG.getMockData();
				var mockData = window.REPORT_CONFIG.transformData(response.data,areaName,unitName);
                resolve(mockData);
            }, 300);
        });
    },
	transformData:function(data,areaName,unitName) {
		var rows = [];
		//循环添加基础结果
		// 生成 30 天数据
		var totalHeat = 0;
        var totalPower = 0;
		var totaltempIn = 0;
		var totaltempOut = 0;
		var totaltempOutdoor = 0;
		var totaltempIndoor = 0;
		var totaltempSet = 0;
		var totalrunTime = 0;
        for (var i = 0; i < data.length; i++) {

            rows.push({
                date: data[i].day,
                area: areaName,
                unitName: unitName,
                heat: data[i].sum_heat,
                power: data[i].sum_elec,
                cop: data[i].sum_rated,
                tempIn: data[i].A_TEMP,
                tempOut: data[i].B_TEMP,
                tempOutdoor: data[i].C_TEMP,
                tempIndoor: data[i].D_TEMP,
                tempSet: data[i].E_TEMP,
                runTime: data[i].time_1,
                exception: '', // 还原第一行备注
                remark: ''
            });
			totalHeat += data[i].sum_heat;
            totalPower += data[i].sum_elec;
			totaltempIn += data[i].A_TEMP;
			totaltempOut += data[i].B_TEMP;
			totaltempOutdoor += data[i].C_TEMP;
			totaltempIndoor += data[i].D_TEMP;
			totaltempSet += data[i].E_TEMP;
			totalrunTime += data[i].time_1;
			
        }
		// 合计行数据
        var totalRow = {
            date: '合计',
            area: areaName,
            unitName: unitName,
            heat: totalHeat.toFixed(2), // 求和
            power: totalPower.toFixed(2), // 求和
            cop: totalPower == 0 ?0: (totalHeat/(totalPower*3.6)).toFixed(2),
            tempIn: (totaltempIn/data.length).toFixed(2),
            tempOut: (totaltempOut/data.length).toFixed(2),
            tempOutdoor: (totaltempOutdoor/data.length).toFixed(2),
            tempIndoor: (totaltempIndoor/data.length).toFixed(2),
            tempSet: (totaltempSet/data.length).toFixed(2),
            runTime: totalrunTime.toFixed(2),
            exception: '',
            remark: ''
        };

        return {
            rows: rows,
            totalRow: totalRow
        };
    },
    // ========== 模拟数据生成 (用于演示，后续接入SQL后可删除) ==========
    getMockData: function() {
        var rows = [];
        var totalHeat = 0;
        var totalPower = 0;

        // 生成 30 天数据
        for (var i = 1; i <= 30; i++) {
            var heat = (1400 + Math.random() * 500).toFixed(2);
            var power = (550 + Math.random() * 300).toFixed(2);
            var cop = (heat / power / 3.6 * 10).toFixed(2); // 模拟计算，仅演示
            // 修正模拟值范围以匹配图片 COP 约 2.4 左右
            cop = (2.3 + Math.random() * 0.3).toFixed(2);

            var tempOutdoor = (12 - i * 0.5).toFixed(1); // 模拟降温

            rows.push({
                date: i,
                area: '研发区域',
                unitName: '冷机1#',
                heat: heat,
                power: power,
                cop: cop,
                tempIn: '35',
                tempOut: '40',
                tempOutdoor: tempOutdoor,
                tempIndoor: '18',
                tempSet: '40',
                runTime: '15/0',
                exception: i === 1 ? '暂时做不到' : '无', // 还原第一行备注
                remark: ''
            });

            totalHeat += parseFloat(heat);
            totalPower += parseFloat(power);
        }

        // 合计行数据
        var totalRow = {
            date: '合计',
            area: '',
            unitName: '',
            heat: totalHeat.toFixed(2), // 求和
            power: totalPower.toFixed(2), // 求和
            cop: '热/电',
            tempIn: '平均值',
            tempOut: '平均值',
            tempOutdoor: '平均值',
            tempIndoor: '平均值',
            tempSet: '平均值',
            runTime: '求和',
            exception: '/',
            remark: '/'
        };

        return {
            rows: rows,
            totalRow: totalRow
        };
    }
};
// =========================================
// SQL 构建函数（示例，根据实际表结构修改）
// =========================================
function buildSQL(no,startDate) {
    //let dateFormat, groupBy, tableName, dateCondition;
	startDate += "-01";
	
	// 判断查询月份是否包含今天
	var today = new Date();
	var queryDate = new Date(startDate);
	var isCurrentMonth = (today.getFullYear() === queryDate.getFullYear() && 
	                      today.getMonth() === queryDate.getMonth());
	
	var sql = `
	
	SELECT DATE_FORMAT(DATE_ADD(DATE_FORMAT('${startDate}', '%Y-%m-01'), INTERVAL days.n DAY),'%m-%d')  AS day ,
	Round(heat.sum_heat * 1000,1)  as sum_heat ,
	elec.sum_elec,
	ROUND((sum_heat * 1000)/(elec.sum_elec*3.6),2) as sum_rated,
	A_TEMP,
	B_TEMP,
	C_TEMP,
	D_TEMP,
	E_TEMP,
	null as error_remark,
	null as remark,
	ROUND(run_time.time_1,2) as time_1
	FROM (																																			
			select i as n from sys_ints																																
	) AS days		
	left join (
		select date,elec_${no} as sum_elec from (
				select 	DATE_FORMAT(r.jDay, '%Y-%m-%d') as date,  
				sum(case when elec_name in ('elec_420001') then sum_elec else 0 end) as elec_420001,
				sum(case when elec_name in ('elec_420002') then sum_elec else 0 end) as elec_420002,
				sum(case when elec_name in ('elec_420003') then sum_elec else 0 end) as elec_420003,
				sum(case when elec_name in ('elec_420004') then sum_elec else 0 end) as elec_420004,
				sum(case when elec_name in ('elec_420005') then sum_elec else 0 end) as elec_420005,
				sum(case when elec_name in ('elec_420006') then sum_elec else 0 end) as elec_420006,
				sum(case when elec_name in ('elec_420007') then sum_elec else 0 end) as elec_420007,
				sum(case when elec_name in ('elec_420008') then sum_elec else 0 end) as elec_420008,
				sum(case when elec_name in ('elec_420009') then sum_elec else 0 end) as elec_420009,
				sum(case when elec_name in ('elec_320022') then sum_elec else 0 end) - sum(case when elec_name in ('elec_420002') then sum_elec else 0 end)- sum(case when elec_name in ('elec_420001') then sum_elec else 0 end) - sum(case when elec_name in ('elec_420009') then sum_elec else 0 end) as elec_420010,
				sum(case when elec_name in ('elec_420011') then sum_elec else 0 end) as elec_420011,
				sum(case when elec_name in ('elec_420012') then sum_elec else 0 end) AS elec_420012,
				sum(case when elec_name in ('elec_420013') then sum_elec else 0 end) AS elec_420013,   
				sum(case when elec_name in ('elec_420014') then sum_elec else 0 end) AS elec_420014,
				sum(case when elec_name in ('elec_420015') then sum_elec else 0 end) AS elec_420015
				from (  
						select DATE_FORMAT(date, '%Y-%m-%d') as jDay 
						,CONCAT('elec', '_', NO) as elec_name	
						,SUM(sum_elec) AS sum_elec
						FROM sum_elec_group_by_day
						WHERE date <= DATE_FORMAT(DATE_ADD(LAST_DAY('${startDate}'),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')
						AND date >= DATE_FORMAT('${startDate}', '%Y-%m-01')	
						and no in (420001,420002,420003,420004,420005,420006,420007,420008,420009,420010,420011,420012,420013,420014,420015,320022,320024)	
						GROUP BY no, DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d')
						UNION ALL
						
						
						
						SELECT DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as jDay 
						,CONCAT('elec', '_', NO) as elec_name	
						,if(LEAD(no,1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) = no , LEAD(MIN(KWH),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')),   MAX(KWH))- MIN(KWH) AS sum_elec	
						FROM data_all FORCE INDEX (date_no_KWH) 	
						WHERE date <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')
						AND date >= DATE_FORMAT(now(), '%Y-%m-%d 07:00:00')
						and kwh != 0 and kwh != 99999999		
						and no in (420001,420002,420003,420004,420005,420006,420007,420008,420009,420010,420011,420012,420013,420014,420015,320022,320024)	
						GROUP BY no,DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') 
				) r 
				group by r.jDay
		)t
	)elec on elec.date = DATE_ADD(DATE_FORMAT('${startDate}', '%Y-%m-01'), INTERVAL days.n DAY)
	LEFT JOIN (
	${isCurrentMonth ? `
	-- 当前月份：分两部分查询
	select DATE_FORMAT(r.jDay, '%Y-%m-%d') as date,  
		sum(case when heat_name in ('heat_${no}') then sum_heat else 0 end) AS sum_heat		 
		from (
					-- 汇总表：历史数据（到今天7点之前）
					select DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as jDay 
					,CONCAT('heat', '_', NO) as heat_name	
					,SUM(sum_heat) AS sum_heat
					FROM sum_heat_group_by_hour
					WHERE date < DATE_FORMAT(now(), '%Y-%m-%d 07:00:00')
					AND date >= DATE_FORMAT('${startDate}', '%Y-%m-01 07:00:00')
					and no in (420001,420002,420003,420004,420005,420006,420007,420008,420009,420010,420011,420012,420013,420014,420015)	
					GROUP BY no, DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d')
					
					UNION ALL
					
					-- 原始表：今天7点到现在
					select DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as jDay 
					,CONCAT('heat', '_', NO) as heat_name	
					,if(LEAD(no,1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) = no , LEAD(MIN(heat_quantity),1,0) over(order by no,DATE_FORMAT(date, '%Y-%m-%d %H:00:00')),   MAX(heat_quantity))- MIN(heat_quantity) AS sum_heat	
					FROM data_heat_quantity
					WHERE date >= DATE_FORMAT(now(), '%Y-%m-%d 07:00:00')
					AND date <= DATE_FORMAT(DATE_ADD(now(),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')
					and heat_quantity != 0 and heat_quantity != 99999999		
					and no in (420001,420002,420003,420004,420005,420006,420007,420008,420009,420010,420011,420012,420013,420014,420015)	
					GROUP BY no,DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d')
			) r 
			group by r.jDay
	` : `
	-- 历史月份：全部从汇总表查询
	select DATE_FORMAT(r.jDay, '%Y-%m-%d') as date,  
		sum(case when heat_name in ('heat_${no}') then sum_heat else 0 end) AS sum_heat		 
		from (  
					select DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as jDay 
					,CONCAT('heat', '_', NO) as heat_name	
					,SUM(sum_heat) AS sum_heat
					FROM sum_heat_group_by_hour
					WHERE date >= DATE_FORMAT('${startDate}', '%Y-%m-01 07:00:00')
					AND date <= DATE_FORMAT(DATE_ADD(LAST_DAY('${startDate}'),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')
					and no in (420001,420002,420003,420004,420005,420006,420007,420008,420009,420010,420011,420012,420013,420014,420015)	
					GROUP BY no, DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d')
			) r 
			group by r.jDay
	`}
	) heat ON heat.date = DATE_ADD(DATE_FORMAT('${startDate}', '%Y-%m-01'), INTERVAL days.n DAY)
	left join(
			select DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d') as date
			,ROUND(AVG(A_TEMP),1) as A_TEMP
			,ROUND(AVG(B_TEMP),1) as B_TEMP
			,ROUND(AVG(C_TEMP),1) as C_TEMP
			,ROUND(AVG(D_TEMP),1) as D_TEMP
			,ROUND(AVG(E_TEMP),1) as E_TEMP
			from data_temp where no = ${no} 
			and date <= DATE_FORMAT(DATE_ADD(LAST_DAY('${startDate}'),INTERVAL 24 HOUR), '%Y-%m-%d 08:00:00')
			AND date >= DATE_FORMAT('${startDate}', '%Y-%m-01 07:00:00')
			GROUP BY no,DATE_FORMAT(DATE_SUB(date,INTERVAL 7 HOUR ), '%Y-%m-%d')
	)	temp on temp.date = DATE_ADD(DATE_FORMAT('${startDate}', '%Y-%m-01'), INTERVAL days.n DAY)																														
	left join (
		-- 计算每个设备每天的运行时间
		SELECT
				date_ranges.work_date as date,
				-- 设备1的运行时间
				COALESCE(SUM(CASE WHEN d.no = ${no} AND d.status = '运行' AND d.end_date IS NOT NULL THEN
						-- 计算这个状态在当前工作日的运行秒数
						CASE
								-- 完全不重叠
								WHEN d.end_date <= date_ranges.day_start OR d.start_date >= date_ranges.day_end
								THEN 0
								-- 状态完全包含在工作日内
								WHEN d.start_date >= date_ranges.day_start AND d.end_date <= date_ranges.day_end
								THEN TIMESTAMPDIFF(SECOND, d.start_date, d.end_date)
								-- 状态开始前，工作日内结束
								WHEN d.start_date < date_ranges.day_start AND d.end_date <= date_ranges.day_end AND d.end_date > date_ranges.day_start
								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, d.end_date)
								-- 工作日内开始，工作日后结束
								WHEN d.start_date >= date_ranges.day_start AND d.start_date < date_ranges.day_end AND d.end_date > date_ranges.day_end
								THEN TIMESTAMPDIFF(SECOND, d.start_date, date_ranges.day_end)
								-- 状态完全覆盖工作日
								WHEN d.start_date <= date_ranges.day_start AND d.end_date >= date_ranges.day_end
								THEN TIMESTAMPDIFF(SECOND, date_ranges.day_start, date_ranges.day_end)
								ELSE 0
						END
				END), 0) / 3600 as time_1
				
		FROM (
				-- 生成日期范围（工作日：早上7点到次日早上7点）
				SELECT
						DATE(DATE_SUB(MIN_DATE, INTERVAL 7 HOUR)) + INTERVAL seq DAY as work_date,
						-- 工作日开始时间：早上7:00
						DATE(DATE_SUB(MIN_DATE, INTERVAL 7 HOUR)) + INTERVAL seq DAY + INTERVAL 7 HOUR as day_start,
						-- 工作日结束时间：次日早上7:00
						DATE(DATE_SUB(MIN_DATE, INTERVAL 7 HOUR)) + INTERVAL seq DAY + INTERVAL 31 HOUR as day_end
				FROM (
						-- 查出最早和最晚的时间范围
						SELECT MIN(start_date) as MIN_DATE,
									MAX(end_date) as MAX_DATE
						FROM operation_status
						WHERE status = '运行' AND end_date IS NOT NULL
				) time_range,
				(
						select i as seq from sys_ints
				) date_seq
				-- 确保日期序列覆盖整个数据范围
				WHERE DATE(DATE_SUB(MIN_DATE, INTERVAL 7 HOUR)) + INTERVAL seq DAY <= DATE(DATE_SUB(MAX_DATE, INTERVAL 7 HOUR))
		) date_ranges
		-- 连接设备状态数据
		LEFT JOIN operation_status d ON d.status = '运行' AND d.end_date IS NOT NULL
				-- 只连接与当前工作日有重叠的状态记录
				AND d.start_date < date_ranges.day_end AND d.end_date > date_ranges.day_start
		GROUP BY date_ranges.work_date
		ORDER BY date_ranges.work_date
	)run_time on run_time.date = DATE_ADD(DATE_FORMAT('${startDate}', '%Y-%m-01'), INTERVAL days.n DAY)
																																	
	WHERE DATE_ADD(DATE_FORMAT('${startDate}', '%Y-%m-01'), INTERVAL days.n DAY) <= LAST_DAY('${startDate}')
	
	`;

	console.info(sql);

    
    return sql.trim();
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