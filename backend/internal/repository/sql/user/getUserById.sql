-- getUserById.sql
SELECT
  id,
  created_at,
  updated_at,
  raw_user_meta_data->>'name' AS name,
  raw_user_meta_data->>'email' AS email,
  raw_user_meta_data->>'picture' AS picture,
  raw_user_meta_data->>'full_name' AS full_name,
  raw_user_meta_data->>'avatar_url' AS avatar_url
FROM auth.users
WHERE id = $1;