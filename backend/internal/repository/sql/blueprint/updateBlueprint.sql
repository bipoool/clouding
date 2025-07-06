UPDATE blueprints 
SET 
  name = COALESCE(:name, name),
  description = COALESCE(:description, description),
  status = COALESCE(:status, status),
  updated_at = NOW()
WHERE id = :id
RETURNING updated_at; 