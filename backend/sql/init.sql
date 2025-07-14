CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email)
);

CREATE TYPE credential_type AS ENUM (
  'ssh_key',
  'ssl_cert',
  'password',
  'api_key'
);

CREATE TABLE IF NOT EXISTS credentials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type credential_type NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS hosts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    os TEXT NOT NULL,
    credential_id INTEGER NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    meta_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS components (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    label TEXT NOT NULL,
    ansible_role TEXT,
    parameters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- define the ENUM type
CREATE TYPE blueprint_status AS ENUM ('draft', 'deployed', 'archived');

CREATE TABLE IF NOT EXISTS blueprints (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status blueprint_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);


CREATE TABLE IF NOT EXISTS blueprint_components (
    id SERIAL PRIMARY KEY,
    blueprint_id INT NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
    component_id INT NOT NULL REFERENCES components(id),
    position INT NOT NULL,
    parameters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blueprint_id, component_id),
    UNIQUE(blueprint_id, position)
);

CREATE TYPE deployment_type AS ENUM ('plan', 'deploy');

CREATE TYPE deployment_status AS ENUM ('pending', 'started', 'completed', 'failed');
CREATE TABLE deployments (
  id UUID PRIMARY KEY,

  user_id UUID NOT NULL REFERENCES users(id),
  host_id INT NOT NULL REFERENCES hosts(id),
  host_group_id INT NOT NULL REFERENCES host_groups(id),
  blueprint_id INT NOT NULL REFERENCES blueprints(id),

  type deployment_type NOT NULL,
  status deployment_status NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);