-- getUserById.sql
SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1 