
UPDATE host_group
SET name = :name,
    host_ids = :host_ids,
    updated_at = NOW()
WHERE id = :id;
