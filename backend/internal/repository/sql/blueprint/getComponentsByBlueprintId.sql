SELECT id, blueprint_id, component_id, position, parameters, created_at, updated_at 
FROM blueprint_components 
WHERE blueprint_id = $1; 