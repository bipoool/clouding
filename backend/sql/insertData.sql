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
      "uiType": "file",
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
      "uiType": "file",
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
      "uiType": "file",
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
      "id": "145a8bc9-b9ef-4f2b-a96b-54e5ee309d17",
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
      "id": "9b6c1552-0d0a-4874-8f22-3f94d5ef234c",
      "name": "bash_file",
      "valueType": "string",
      "uiType": "file",
      "rules": { "required": true },
      "default": null,
      "description": "Bash script file to run"
    }
  ]'::jsonb
);
