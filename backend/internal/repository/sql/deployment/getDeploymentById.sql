SELECT 
  id, user_id, blueprint_id, type, status, created_at, updated_at
FROM deployments
WHERE id = $1;
