-- createCredential.sql
INSERT INTO credentials (name, type, user_id, expire_at) 
VALUES (:name, :type, :user_id, :expire_at) 
RETURNING id; 