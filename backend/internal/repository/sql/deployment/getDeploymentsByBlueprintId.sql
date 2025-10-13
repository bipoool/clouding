SELECT
  id,
  user_id,
  blueprint_id,
  type,
  status,
  created_at,
  updated_at
FROM
  deployments
WHERE
  blueprint_id = $1
ORDER BY
  created_at DESC
LIMIT
  $2