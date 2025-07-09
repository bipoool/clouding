SELECT id, name, display_name, description, label, ansible_role, parameters, created_at, updated_at
FROM components
WHERE id = ANY($1); 