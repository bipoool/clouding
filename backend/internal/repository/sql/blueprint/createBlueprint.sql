INSERT INTO blueprints (name, description, user_id, status, created_at, updated_at)
VALUES (:name, :description, :user_id, :status, NOW(), NOW())
RETURNING id; 