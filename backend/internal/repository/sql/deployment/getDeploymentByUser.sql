SELECT 
  id, user_id, blueprint_id, type, status, created_at
FROM deployments
WHERE user_id = $1
  AND type = $2
ORDER BY created_at DESC;
