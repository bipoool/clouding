-- createUser.sql
INSERT INTO users (name, email, created_at, updated_at)
VALUES (:name, :email, NOW(), NOW())
RETURNING id; 