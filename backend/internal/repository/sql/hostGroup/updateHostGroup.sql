UPDATE host_group
SET
  updated_at = NOW(),
  name = $1,
  host_ids = $2
WHERE id = $3;
