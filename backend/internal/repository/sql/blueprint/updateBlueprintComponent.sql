UPDATE blueprint_components 
SET 
  position = COALESCE(CAST(:position AS INTEGER), position),
  parameters = COALESCE(CAST(:parameters AS jsonb), parameters),
  updated_at = NOW()
WHERE blueprint_id = :blueprint_id AND component_id = :component_id
RETURNING id;