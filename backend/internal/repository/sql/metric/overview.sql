WITH bounds AS (
  SELECT
    date_trunc('month', now())                         AS cur_month_start,
    date_trunc('month', now() - interval '1 month')    AS prev_month_start,
    date_trunc('month', now() + interval '1 month')    AS next_month_start
),
hosts_agg AS (
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (
      WHERE h.created_at >= b.cur_month_start AND h.created_at < b.next_month_start
    ) AS added_curr,
    COUNT(*) FILTER (
      WHERE h.created_at >= b.prev_month_start AND h.created_at < b.cur_month_start
    ) AS added_prev
  FROM hosts h
  CROSS JOIN bounds b
  WHERE h.user_id = $1
),
groups_agg AS (
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (
      WHERE g.created_at >= b.cur_month_start AND g.created_at < b.next_month_start
    ) AS added_curr,
    COUNT(*) FILTER (
      WHERE g.created_at >= b.prev_month_start AND g.created_at < b.cur_month_start
    ) AS added_prev
  FROM host_groups g
  CROSS JOIN bounds b
  WHERE g.user_id = $1
),
creds_agg AS (
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (
      WHERE c.created_at >= b.cur_month_start AND c.created_at < b.next_month_start
    ) AS added_curr,
    COUNT(*) FILTER (
      WHERE c.created_at >= b.prev_month_start AND c.created_at < b.cur_month_start
    ) AS added_prev
  FROM credentials c
  CROSS JOIN bounds b
  WHERE c.user_id = $1
),
blueprints_agg AS (
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (
      WHERE bp.created_at >= b.cur_month_start AND bp.created_at < b.next_month_start
    ) AS added_curr,
    COUNT(*) FILTER (
      WHERE bp.created_at >= b.prev_month_start AND bp.created_at < b.cur_month_start
    ) AS added_prev
  FROM blueprints bp
  CROSS JOIN bounds b
  WHERE bp.user_id = $1
)
SELECT 'vms'         AS entity, ha.added_curr AS currentMonth, ha.added_prev AS lastMonth, ha.total AS total
FROM hosts_agg ha
UNION ALL
SELECT 'vmGroups'    AS entity, ga.added_curr, ga.added_prev, ga.total
FROM groups_agg ga
UNION ALL
SELECT 'credentials' AS entity, ca.added_curr, ca.added_prev, ca.total
FROM creds_agg ca
UNION ALL
SELECT 'blueprints'  AS entity, ba.added_curr, ba.added_prev, ba.total
FROM blueprints_agg ba;
