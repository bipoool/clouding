SELECT 
<<<<<<< HEAD
  id, user_id, blueprint_id, type, status, created_at
=======
  id, user_id, host_id, host_group_id, blueprint_id, type, status, created_at
>>>>>>> 54be485 (add deployment changes)
FROM deployments
WHERE user_id = $1
  AND type = $2
ORDER BY created_at DESC;
<<<<<<< HEAD
=======

>>>>>>> 54be485 (add deployment changes)
