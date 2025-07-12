from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from typing import List, Union, Dict, Any
import os
import uuid
import yaml

from handlers import docker, nginx  # import other role handlers here

app = FastAPI()

class Parameter(BaseModel):
    id: str
    name: str
    value: Union[str, dict]

class Component(BaseModel):
    componentId: int
    position: int
    ansibleRole: str
    parameters: List[Parameter]

class BlueprintPayload(BaseModel):
    blueprintId: int
    userId: str
    components: List[Component]
    id: str



ROLE_DISPATCH = {
    "nginxinc.nginx": nginx.build_nginx_role,
    "community.docker.docker_install": docker.build_docker_task
}

def validate_blueprint_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Custom validator function for blueprint payload
    Returns validation result with errors if any
    """
    errors = []
    
    # Check required fields exist
    required_fields = ['blueprintId', 'userId', 'id']
    for field in required_fields:
        if field not in payload:
            errors.append(f"Missing required field: {field}")
    
    if errors:
        return {"valid": False, "errors": errors}
    
    # Validate blueprintId
    blueprint_id = payload.get('blueprintId')
    if not isinstance(blueprint_id, int) or blueprint_id <= 0:
        errors.append("blueprintId must be a positive integer")
    
    # Validate userId
    user_id = payload.get('userId')
    if not user_id or not str(user_id).strip():
        errors.append("userId cannot be empty")
    
    # Validate id
    payload_id = payload.get('id')
    if not payload_id or not str(payload_id).strip():
        errors.append("id cannot be empty")
    
    return {"valid": len(errors) == 0, "errors": errors}

@app.post("/plan")
async def generate_playbook(payload: BlueprintPayload):
    try:
        # Convert Pydantic model to dict for custom validation
        payload_dict = payload.dict()
        
        # Run custom validation
        validation_result = validate_blueprint_payload(payload_dict)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400, 
                detail={
                    "message": "Validation failed",
                    "errors": validation_result["errors"]
                }
            )
        
        playbook_dir = "runs/" + payload.userId + "/" + payload.id
        os.makedirs(playbook_dir, exist_ok=True)
        run_id = str(uuid.uuid4())
        playbook_path = os.path.join(playbook_dir, f"{run_id}.yaml")

        components = sorted(payload.components, key=lambda c: c.position)

        roles = []
        for comp in components:
            handler = ROLE_DISPATCH.get(comp.ansibleRole)
            if not handler:
                raise HTTPException(status_code=400, detail=f"Unsupported role: {comp.ansibleRole}")

            param_dicts = [p.dict() for p in comp.parameters]
            task = handler(param_dicts, payload.userId)
            roles.append(task)

        playbook = [{
            "name": f"Blueprint {payload.blueprintId}",
            "hosts": "all",
            "become": True,
            "roles": roles
        }]

        with open(playbook_path, "w") as f:
            yaml.dump(playbook, f)

        return {
            "status": "success",
            "playbookPath": playbook_path,
            "blueprintId": payload.blueprintId,
            "userId": payload.userId,
            "id": payload.id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
