INSERT INTO deployments (
  id, user_id, host_id, host_group_id, blueprint_id, type, status
)
VALUES (
  :id, :user_id, :host_id, :host_group_id, :blueprint_id, :type, :status
)
ON CONFLICT (id) DO NOTHING
RETURNING *;
