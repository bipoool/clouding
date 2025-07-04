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
    expire_at TIMESTAMP,
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

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'install_nginx',
  'Install NGINX',
  'Installs NGINX using the official nginxinc role.',
  'Web Server',
  'nginxinc.nginx',
  '[
    {
      "name": "version",
      "valueType": "string",
      "uiType": "text",
      "rules": { "required": false },
      "default": "1.24.0",
      "description": "NGINX version to install"
    },
    {
      "name": "nginx_type",
      "valueType": "string",
      "uiType": "select",
      "rules": { "required": false },
      "default": "opensource",
      "description": "NGINX type (opensource or plus)",
      "options": ["opensource", "plus"]
    },
    {
      "name": "nginx_license_certificate",
      "valueType": "string",
      "uiType": "file",
      "rules": {
        "required": false,
        "required_if": { "nginx_type": "plus" }
      },
      "default": null,
      "description": "Path to license certificate for NGINX Plus"
    },
    {
      "name": "nginx_license_key",
      "valueType": "string",
      "uiType": "file",
      "rules": {
        "required": false,
        "required_if": { "nginx_type": "plus" }
      },
      "default": null,
      "description": "Path to license key for NGINX Plus"
    },
    {
      "name": "nginx_license_jwt",
      "valueType": "string",
      "uiType": "file",
      "rules": {
        "required": false,
        "required_if": { "nginx_type": "plus" }
      },
      "default": null,
      "description": "Path to license JWT for NGINX Plus"
    },
    {
      "name": "sites_available",
      "valueType": "fileList",
      "uiType": "fileList",
      "rules": { "required": false },
      "default": [
        {
          "filename": "default",
          "url": "https://ikzofffjwkqpiwrqsttb.supabase.co/storage/v1/object/public/clouding-parameter-files/install_nginx/defaults/default"
        }
      ],
      "description": "List of site configuration files"
    }
  ]'::jsonb
);

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'install_docker',
  'Install Docker',
  'Installs Docker using community.docker role.',
  'Container',
  'community.docker.docker_install',
  '[
    {
      "name": "version",
      "valueType": "string",
      "uiType": "text",
      "rules": { "required": false },
      "default": "latest",
      "description": "Docker version to install"
    }
  ]'::jsonb
);

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'run_script',
  'Run Bash Script',
  'Executes a provided bash script on the target machine.',
  'Bash',
  'clouding.runBash',
  '[
    {
      "name": "bash_file",
      "valueType": "string",
      "uiType": "file",
      "rules": { "required": true },
      "default": null,
      "description": "Bash script file to run"
    }
  ]'::jsonb
);
