SELECT
  hg.id, hg.name, hg.user_id, hg.description, hg.created_at, hg.updated_at,
  COALESCE(
    array_agg(DISTINCT hgm.host_id) FILTER (WHERE hgm.host_id IS NOT NULL),
    ARRAY[]::bigint[]
  ) AS host_ids
FROM host_groups AS hg
LEFT JOIN host_groups_to_host_mapping AS hgm
  ON hgm.host_group_id = hg.id
WHERE hg.user_id = $1
GROUP BY hg.id, hg.name, hg.user_id, hg.description, hg.created_at, hg.updated_at;
