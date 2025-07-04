SELECT id, name, user_id, host_ids, created_at, updated_at
FROM host_group
WHERE id = $1;
