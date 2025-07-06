UPDATE blueprint_components 
SET 
  position = COALESCE(:position, position),
  parameters = COALESCE(:parameters, parameters),
  updated_at = NOW()
WHERE id = :id
RETURNING updated_at; 