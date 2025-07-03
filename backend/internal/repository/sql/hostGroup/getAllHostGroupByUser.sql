SELECT
    hg.id AS id,
    hg.name AS name,
    hg.user_id,
    hg.created_at,
    hg.updated_at,
    json_agg(h.*) AS hosts
FROM host_group hg
LEFT JOIN LATERAL (
    SELECT *
    FROM hosts
    WHERE id = ANY(hg.host_ids)
) h ON TRUE
WHERE hg.user_id = $1
GROUP BY hg.id;
