-- createHost.sql
INSERT INTO hosts (user_id, name, os, ip, meta_data, credential_id, created_at, updated_at)
VALUES (:user_id, :name, :os, :ip, :meta_data, :credential_id, NOW(), NOW())
RETURNING id;