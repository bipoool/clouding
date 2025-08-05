import os
from typing import List, Tuple
import yaml
from fastapi import HTTPException
from models.host import Host
from models.credential import Credential

from handlers import docker, nginx
from models import plan
from models.blueprint import AnsiblePlan
from repositories import blueprint as blueprintRepository

ROLE_DISPATCH = {
    "nginxinc.nginx": nginx.build_nginx_role,
    "community.docker.docker_install": docker.build_docker_task
}

PLAYBOOK_BASE_PATH = "runs"

def generateNotebook(payload: plan.Plan):
    playbook_dir = os.path.join(PLAYBOOK_BASE_PATH, payload.userId, payload.jobId)
    os.makedirs(playbook_dir, exist_ok=True)
    playbook_path = os.path.join(playbook_dir, f"main.yaml")

    blueprintComponents = blueprintRepository.getBlueprintComponents(payload.blueprintId)
    if blueprintComponents:
        for component in blueprintComponents:
            err = component.validateParameters()
            if err:
                raise HTTPException(status_code=400, detail=err)
    else:
        raise HTTPException(status_code=400, detail="No blueprint components found")

    blueprint = blueprintRepository.getBlueprint(payload.blueprintId)
    if blueprint:
        err = blueprint.validate()
        if err:
            raise HTTPException(status_code=400, detail=err)
    else:
        raise HTTPException(status_code=400, detail="Blueprint not found")

    plan = AnsiblePlan(
        name=blueprint.name,
        status=blueprint.status,
        blueprintid=blueprint.id,
        components=blueprintComponents
    )

    components = sorted(plan.components, key=lambda c: c.position)

    roles = []
    for comp in components:
        handler = ROLE_DISPATCH.get(comp.ansiblerole)
        if not handler:
            raise HTTPException(status_code=400, detail=f"Unsupported role: {comp.ansiblerole}")

        param_dicts = [p for p in comp.blueprintparameters]
        task = handler(param_dicts, playbook_dir)
        roles.append(task)

    playbook = [{
        "name": f"{blueprint.name} - {payload.jobId}",
        "hosts": "group",
        "become": True,
        "roles": roles
    }]

    with open(playbook_path, "w") as f:
        yaml.dump(playbook, f)

    return {
        "status": "success",
        "playbookName": "main.yaml",
        "playbookDir": playbook_dir,
        "blueprintId": payload.blueprintId,
        "userId": payload.userId,
        "jobId": payload.jobId
    }

def generateInventory(payload: plan.Plan, hosts_and_creds: List[Tuple[Host, Credential]]):
    playbook_dir = os.path.join(PLAYBOOK_BASE_PATH, payload.userId, payload.jobId)
    inventoryFolder = os.path.join(playbook_dir, "inventory")
    os.makedirs(inventoryFolder, exist_ok=True)
    inventoryPath = os.path.join(inventoryFolder, "hosts")

    # Validate all credentials upfront
    for host, credential in hosts_and_creds:
        if not credential.value:
            raise ValueError(f"Credential value is missing for host {host.id} (credential: {credential.name})")
        
        # Check for required username
        username = credential.value.get('username')
        if not username:
            raise ValueError(f"Username is missing in credential value for host {host.id} (credential: {credential.name})")
        
        # Check for authentication method
        has_ssh_key = 'sshKey' in credential.value and credential.value['sshKey']
        has_password = 'password' in credential.value and credential.value['password']
        
        if not has_ssh_key and not has_password:
            raise ValueError(f"Neither SSH key nor password found in credential value for host {host.id} (credential: {credential.name})")
        
        # Validate SSH key if present
        if has_ssh_key and not credential.value['sshKey'].strip():
            raise ValueError(f"SSH key is empty for host {host.id} (credential: {credential.name})")
        
        # Validate password if present
        if has_password and not credential.value['password'].strip():
            raise ValueError(f"Password is empty for host {host.id} (credential: {credential.name})")

    with open(inventoryPath, "w") as f:
        f.write("[group]\n")
        for host, credential in hosts_and_creds:
            username = credential.value.get('username')
            host_line = f"host{host.id} ansible_host={host.ip} ansible_user={username}"
            
            # Handle SSH key if present
            if 'sshKey' in credential.value and credential.value['sshKey']:
                sshKeyName = f"ssh_key_{host.id}_{credential.id}"
                ssh_key_path = os.path.join(playbook_dir,sshKeyName )
                with open(ssh_key_path, "w") as key_file:
                    ssh_key_content = credential.value['sshKey']
                    # Ensure SSH key ends with a newline
                    if not ssh_key_content.endswith('\n'):
                        ssh_key_content += '\n'
                    key_file.write(ssh_key_content)
                os.chmod(ssh_key_path, 0o600)  # Set permissions to 600
                host_line += f" ansible_ssh_private_key_file={sshKeyName}"
            
            # Handle password if present (and no SSH key)
            elif 'password' in credential.value and credential.value['password']:
                host_line += f" ansible_password={credential.value['password']}"
                # For password authentication, we might need to disable host key checking
                host_line += " ansible_ssh_common_args='-o StrictHostKeyChecking=no'"
            
            # Add connection type
            host_line += " ansible_connection=ssh"
            
            f.write(host_line + "\n")
        