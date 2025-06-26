-- createHost.sql
INSERT INTO hosts (user_id, name, os, ip, meta_data, created_at, updated_at)
VALUES (:user_id, :name, :os, :ip, :meta_data, NOW(), NOW())
RETURNING id;