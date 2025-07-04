UPDATE host_group
SET host_ids = host_ids || $2,
    updated_at = NOW()
WHERE id = $1;