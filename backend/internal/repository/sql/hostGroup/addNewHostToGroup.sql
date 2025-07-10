UPDATE host_group
SET host_ids = (
    SELECT ARRAY(SELECT DISTINCT val FROM unnest(host_ids || $2) AS val)
),
updated_at = NOW()
WHERE id = $1;