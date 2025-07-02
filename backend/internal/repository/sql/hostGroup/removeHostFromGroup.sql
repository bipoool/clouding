
UPDATE host_group
SET host_ids = ARRAY(
    SELECT unnest(host_ids)
    EXCEPT
    SELECT :host_id
),
updated_at = NOW()
WHERE id = :id;
