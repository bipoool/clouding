-- createCredential.sql
INSERT INTO credentials (name, type, user_id) 
VALUES (:name, :type, :user_id) 
RETURNING id; 