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
      "id": "d7b1f2d9-14ab-4dff-86b0-4f637c3f7b5f",
      "name": "version",
      "valueType": "string",
      "uiType": "text",
      "rules": { "required": false },
      "default": "1.24.0",
      "description": "NGINX version to install"
    },
    {
      "id": "0f3f43b7-7d25-4f7c-a3c5-361ee7a66379",
      "name": "nginx_type",
      "valueType": "string",
      "uiType": "select",
      "rules": { "required": false },
      "default": "opensource",
      "description": "NGINX type (opensource or plus)",
      "options": ["opensource", "plus"]
    },
    {
      "id": "f80ec8dc-1b3e-401a-9170-5db4fabc0bc6",
      "name": "nginx_license_certificate",
      "valueType": "string",
      "uiType": "textarea",
      "rules": {
        "required": false,
        "required_if": { "nginx_type": "plus" }
      },
      "default": null,
      "description": "Path to license certificate for NGINX Plus"
    },
    {
      "id": "d04c00c2-2b10-42e1-9816-7673e9a11f8a",
      "name": "nginx_license_key",
      "valueType": "string",
      "uiType": "textarea",
      "rules": {
        "required": false,
        "required_if": { "nginx_type": "plus" }
      },
      "default": null,
      "description": "Path to license key for NGINX Plus"
    },
    {
      "id": "d40f4bc4-302d-4a54-bc20-d44ad71d9739",
      "name": "nginx_license_jwt",
      "valueType": "string",
      "uiType": "textarea",
      "rules": {
        "required": false,
        "required_if": { "nginx_type": "plus" }
      },
      "default": null,
      "description": "Path to license JWT for NGINX Plus"
    },
    {
      "id": "8f8c65fc-4570-4560-b81d-5c1727a66d70",
      "name": "sites_available",
      "valueType": "string",
      "uiType": "textarea",
      "rules": { "required": false },
      "default": "server {\n  listen 80 default_server;\n  listen [::]:80 default_server;\n}",
      "description": "List of site configuration files"
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
      "id": "9b6c1552-0d0a-4874-8f22-3f94d5ef234c",
      "name": "bash_file",
      "valueType": "string",
      "uiType": "textarea",
      "rules": { "required": true },
      "default": null,
      "description": "Bash script file to run"
    }
  ]'::jsonb
);

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'open_port',
  'Open Port',
  'Open a port',
  'Bash',
  'clouding.OpenPort',
  '[
    {
      "id": "a71a3f89-9b09-40e3-9754-53bff2e304db",
      "name": "port_value",
      "valueType": "string",
      "uiType": "number",
      "rules": { "required": true },
      "default": 8080,
      "description": "Port value to open"
    }
  ]'::jsonb
);

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'install_nginx',
  'Install Nginx',
  'Install Opensource Nginx',
  'Web Server',
  'clouding.Nginx',
  '[
    {
      "id": "09e033b7-6743-4539-bc4c-2422611f3bd3",
      "name": "nginx_type",
      "valueType": "string",
      "uiType": "select",
      "rules": { "required": false },
      "default": "opensource",
      "description": "NGINX type (for now opensource is only supported)",
      "options": ["opensource"]
    }
  ]'::jsonb
);

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'install_docker',
  'Install Docker',
  'Install recent version of Docker',
  'Container',
  'clouding.Docker',
  '[
    {
      "id": "7dec2cfa-a1d6-4b12-bf26-a633d696264e",
      "name": "docker_version",
      "valueType": "string",
      "uiType": "select",
      "rules": { "required": false },
      "default": "latest",
      "description": "Docker version (for now latest is only supported)",
      "options": ["latest"]
    }
  ]'::jsonb
);

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'install_java',
  'Install Java',
  'Install Java',
  'Programming Language',
  'clouding.Java',
  '[
    {
      "id": "36275565-f870-48be-995d-d99317d39d32",
      "name": "java_version",
      "valueType": "string",
      "uiType": "select",
      "rules": { "required": false },
      "default": "8",
      "description": "Java Version",
      "options": ["8", "11", "17", "21"]
    }
  ]'::jsonb
);

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'deploy_docker_compose_file',
  'Deploy Docker Compose File',
  'Deploy any docker compose file using github url',
  'Container',
  'clouding.GithubDockerCompose',
  '[
    {
      "id": "b55767d7-47c1-486a-b227-0eb322ac5e20",
      "name": "github_url",
      "valueType": "string",
      "uiType": "select",
      "rules": { "required": true },
      "description": "Github URL"
    }
  ]'::jsonb
);

INSERT INTO components (
  name, display_name, description, label, ansible_role, parameters
)
VALUES (
  'add_nginx_site',
  'Add Nginx Site',
  'Add site config to Nginx',
  'Web Server',
  'clouding.AddNginxSite',
  '[
    {
      "id": "e21ba779-90d3-404b-b7c5-328552a214c8",
      "name": "site_name",
      "valueType": "string",
      "uiType": "select",
      "rules": { "required": true },
      "description": "Site Name"
    },
    {
      "id": "949ad31f-06a9-4864-a9a6-b75b8393685b",
      "name": "site_content",
      "valueType": "string",
      "uiType": "textarea",
      "rules": { "required": true },
      "description": "Site Config"
    }
  ]'::jsonb
);