-- createCredential.sql
INSERT INTO credentials (name, type, user_id, expires_at) 
VALUES (:name, :type, :user_id, :expires_at) 
RETURNING id; 