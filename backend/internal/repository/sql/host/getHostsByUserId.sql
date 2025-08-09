-- getHostsByUserId.sql
SELECT id, user_id, name, ip, os, credential_id, meta_data, created_at, updated_at FROM hosts WHERE user_id = $1