
INSERT INTO host_group (user_id, name, host_ids, created_at, updated_at)
VALUES (:user_id, :name, :host_ids, NOW(), NOW())
RETURNING id, created_at, updated_at;;
