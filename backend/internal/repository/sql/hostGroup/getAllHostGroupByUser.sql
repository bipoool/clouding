SELECT
  hg.id, hg.name, hg.user_id, hg.description, hg.created_at, hg.updated_at,
  COALESCE(COUNT(hgm.host_id), 0) AS total_hosts
FROM host_groups AS hg
LEFT JOIN host_groups_to_host_mapping AS hgm
  ON hgm.host_group_id = hg.id
WHERE hg.user_id = $1
GROUP BY hg.id, hg.name, hg.user_id, hg.description, hg.created_at, hg.updated_at;
