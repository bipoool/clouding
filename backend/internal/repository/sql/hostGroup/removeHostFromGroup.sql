UPDATE host_group
SET host_ids = (
    SELECT array_agg(e) FROM (
        SELECT unnest(host_ids) AS e
        EXCEPT
        SELECT $2
    ) AS s
),
updated_at = NOW()
WHERE id = $1;
