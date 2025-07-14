SELECT 
  id, user_id, host_id, host_group_id, blueprint_id, type, status, created_at
FROM deployments
WHERE id = $1;
