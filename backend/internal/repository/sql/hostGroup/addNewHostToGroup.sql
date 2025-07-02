
UPDATE host_group
SET host_ids = host_ids || :new_host_ids::text[],
    updated_at = NOW()
WHERE id = :id;
