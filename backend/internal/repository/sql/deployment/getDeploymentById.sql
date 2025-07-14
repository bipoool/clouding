SELECT 
<<<<<<< HEAD
  id, user_id, blueprint_id, type, status, created_at, updated_at
=======
  id, user_id, host_id, host_group_id, blueprint_id, type, status, created_at
>>>>>>> 54be485 (add deployment changes)
FROM deployments
WHERE id = $1;
