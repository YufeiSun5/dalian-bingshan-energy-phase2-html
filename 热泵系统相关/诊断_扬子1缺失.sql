-- 诊断：为什么查询结果中没有"电机_扬子1" (no=420013)

-- 1. 检查 info_config 表中是否有 420013 的配置
SELECT '1. info_config表检查' AS 检查项;
SELECT * FROM info_config WHERE NO IN (420013, 420014);

-- 2. 检查 data_all 表中 420013 的电量数据
SELECT '2. data_all表电量数据检查' AS 检查项;
SELECT 
    no,
    COUNT(*) AS 记录数,
    MIN(date) AS 最早时间,
    MAX(date) AS 最晚时间,
    MIN(KWH) AS 最小电量,
    MAX(KWH) AS 最大电量,
    AVG(KWH) AS 平均电量
FROM data_all 
WHERE no IN (420013, 420014)
  AND date >= '2026-01-16 07:00:00' 
  AND date <= '2026-01-17 06:59:59'
GROUP BY no;

-- 3. 检查 420013 在指定时间段内是否有 KWH > 0 的数据
SELECT '3. 420013电量>0的数据检查' AS 检查项;
SELECT 
    no,
    date,
    KWH
FROM data_all 
WHERE no = 420013
  AND date >= '2026-01-16 07:00:00' 
  AND date <= '2026-01-17 06:59:59'
  AND KWH > 0
ORDER BY date
LIMIT 20;

-- 4. 检查 data_heat_quantity 表中 420013 的热量数据
SELECT '4. data_heat_quantity表热量数据检查' AS 检查项;
SELECT 
    no,
    COUNT(*) AS 记录数,
    MIN(date) AS 最早时间,
    MAX(date) AS 最晚时间,
    MIN(heat_quantity) AS 最小热量,
    MAX(heat_quantity) AS 最大热量,
    AVG(heat_quantity) AS 平均热量
FROM data_heat_quantity 
WHERE no IN (420013, 420014)
  AND date >= '2026-01-16 07:00:00' 
  AND date <= '2026-01-17 06:59:59'
GROUP BY no;

-- 5. 检查 420013 在指定时间段内是否有有效热量数据
SELECT '5. 420013有效热量数据检查' AS 检查项;
SELECT 
    no,
    date,
    heat_quantity
FROM data_heat_quantity 
WHERE no = 420013
  AND date >= '2026-01-16 07:00:00' 
  AND date <= '2026-01-17 06:59:59'
  AND heat_quantity != 0
  AND heat_quantity != 99999999
ORDER BY date
LIMIT 20;

-- 6. 对比 420013 和 420014 的数据情况（按小时统计）
SELECT '6. 420013和420014按小时对比' AS 检查项;
SELECT
    no,
    date_format(date, '%Y-%m-%d %H:00:00') AS query_date_hour,
    COUNT(*) AS 记录数,
    MIN(KWH) AS min_kwh,
    MAX(KWH) AS max_kwh,
    MAX(KWH) - MIN(KWH) AS hourly_usage
FROM data_all
WHERE no IN (420013, 420014)
  AND date >= '2026-01-16 07:00:00' 
  AND date <= '2026-01-17 06:59:59'
  AND KWH > 0
GROUP BY no, date_format(date, '%Y-%m-%d %H:00:00')
ORDER BY query_date_hour DESC, no;

-- 7. 检查最近一周 420013 是否有任何数据
SELECT '7. 420013最近一周数据检查' AS 检查项;
SELECT 
    '电量数据' AS 数据类型,
    COUNT(*) AS 记录数,
    MIN(date) AS 最早时间,
    MAX(date) AS 最晚时间
FROM data_all 
WHERE no = 420013
  AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
UNION ALL
SELECT 
    '热量数据' AS 数据类型,
    COUNT(*) AS 记录数,
    MIN(date) AS 最早时间,
    MAX(date) AS 最晚时间
FROM data_heat_quantity 
WHERE no = 420013
  AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY);
