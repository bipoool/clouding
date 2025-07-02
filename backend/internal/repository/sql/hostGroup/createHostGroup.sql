
INSERT INTO host_groups (user_id, name, description, created_at, updated_at)
VALUES (:user_id, :name, :description, NOW(), NOW())
RETURNING id, created_at, updated_at;
