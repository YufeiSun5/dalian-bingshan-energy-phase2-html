-- ============================================================
-- 热泵系统 每台设备每小时 电量/热量/COP 视图
-- 时间范围：2026-01-01 ~ 2026-02-28
-- 最外层筛选：只显示 COP < 1 的异常记录
-- ============================================================
-- 设备清单（NO -> 名称）：
--   420001 大办_天加02    420002 大办_天加01
--   420003 电机_冷机      420004 电机_欧亚
--   420005 研发_冷机2     420006 研发_欧亚2
--   420007 研发_冷机1     420008 研发_欧亚1
--   420009 大办_冰山2     420010 大办_冷机（差值计算）
--   420011 大办_欧亚      420012 大办_冰山
--   420013 电机_扬子1     420014 电机_扬子2
--   420015 电机_冰山
-- ============================================================
-- COP 计算公式：热量(MJ) / (电量(kWh) × 3.6)
--   等价于：SUM(sum_heat)*1000 / (SUM(sum_elec)*3.6)
-- 注意：420010(大办_冷机) 的电量 = 320022 - 420001 - 420002 - 420009
-- ============================================================

DROP VIEW IF EXISTS v_heatpump_cop_anomaly;
CREATE OR REPLACE VIEW v_heatpump_cop_anomaly AS
SELECT *
FROM (

    -- --------------------------------------------------------
    -- 内层：计算每台设备每小时的电量、热量、COP
    -- --------------------------------------------------------
    SELECT
        e.query_date                                AS `小时`,
        e.no                                        AS `设备NO`,
        cfg.name                                    AS `设备名称`,
        SUBSTRING_INDEX(IFNULL(cfg.name, ''), '_', 1) AS `位置`,
        CASE
            WHEN e.no IN (420001, 420002)           THEN '1-天加组'
            WHEN e.no IN (420003, 420007, 420008, 420010) THEN '2-冷机组'
            WHEN e.no IN (420004, 420005, 420006, 420011) THEN '3-欧亚组'
            WHEN e.no IN (420009)                   THEN '4-冰山2组'
            WHEN e.no IN (420012, 420015)           THEN '5-冰山组'
            WHEN e.no IN (420013, 420014)           THEN '6-扬子组'
            ELSE '9-其他'
        END                                         AS `分组`,
        e.elec_kwh                                  AS `耗电量(kWh)`,
        h.heat_gj                                   AS `热量(GJ)`,
        IFNULL(
            ROUND(
                h.heat_gj * 1000 / NULLIF(e.elec_kwh * 3.6, 0),
            2),
        0)                                          AS `COP`

    FROM (
        -- ====================================================
        -- 电量子查询
        -- 420010(大办_冷机) 用差值计算：320022 - 420001 - 420002 - 420009
        -- 其余设备直接从 sum_elec_group_by_hour 取
        -- ====================================================
        SELECT
            date_format(date, '%Y-%m-%d %H:00:00')  AS query_date,
            420010                                  AS no,
            GREATEST(0,
                COALESCE(SUM(CASE WHEN no = 320022 THEN sum_elec END), 0)
              - COALESCE(SUM(CASE WHEN no = 420001 THEN sum_elec END), 0)
              - COALESCE(SUM(CASE WHEN no = 420002 THEN sum_elec END), 0)
              - COALESCE(SUM(CASE WHEN no = 420009 THEN sum_elec END), 0)
            )                                       AS elec_kwh
        FROM sum_elec_group_by_hour
        WHERE no IN (320022, 420001, 420002, 420009)
          AND date >= '2026-01-01 07:00:00'
          AND date <= '2026-03-01 06:59:59'
        GROUP BY date_format(date, '%Y-%m-%d %H:00:00')

        UNION ALL

        SELECT
            date_format(date, '%Y-%m-%d %H:00:00')  AS query_date,
            no,
            SUM(sum_elec)                           AS elec_kwh
        FROM sum_elec_group_by_hour
        WHERE no IN (420001, 420002, 420003, 420004, 420005, 420006,
                     420007, 420008, 420009, 420011, 420012, 420013,
                     420014, 420015)
          AND date >= '2026-01-01 07:00:00'
          AND date <= '2026-03-01 06:59:59'
        GROUP BY no, date_format(date, '%Y-%m-%d %H:00:00')
    ) e

    -- 关联热量数据
    LEFT JOIN (
        SELECT
            date_format(date, '%Y-%m-%d %H:00:00')  AS query_date,
            no,
            SUM(sum_heat)                           AS heat_gj
        FROM sum_heat_group_by_hour
        WHERE no BETWEEN 420001 AND 420015
          AND date >= '2026-01-01 07:00:00'
          AND date <= '2026-03-01 06:59:59'
        GROUP BY no, date_format(date, '%Y-%m-%d %H:00:00')
    ) h ON e.no = h.no AND e.query_date = h.query_date

    -- 关联设备名称
    LEFT JOIN info_config cfg ON cfg.NO = e.no

    WHERE e.no BETWEEN 420001 AND 420015

) detail

-- ============================================================
-- 最外层筛选：只保留 COP < 1 的异常记录
-- （同时排除电量为0的无效行，避免噪音数据）
-- ============================================================
WHERE `COP` < 1
  AND `耗电量(kWh)` > 0

ORDER BY
    `小时`    ASC,
    `分组`    ASC,
    `设备NO`  ASC;

-- ============================================================
-- 创建视图后，用以下语句查询：
--   SELECT * FROM v_heatpump_cop_anomaly;
-- ============================================================
