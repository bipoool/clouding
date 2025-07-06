INSERT INTO blueprint_components (
  blueprint_id, component_id, position, parameters, created_at, updated_at
)
VALUES (:blueprint_id, :component_id, :position, :parameters, NOW(), NOW())
RETURNING id;