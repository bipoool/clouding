-- getHostById.sql
SELECT id, user_id, name, ip, os, meta_data, created_at, updated_at FROM hosts WHERE id = $1