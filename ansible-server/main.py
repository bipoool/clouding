import os
import uuid
import yaml
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Union
from handlers import docker, nginx

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


ROLE_DISPATCH = {
    "nginxinc.nginx": nginx.build_nginx_task,
    "community.docker.docker_install": docker.build_docker_task
}


@app.post("/generate-playbook")
async def generate_playbook(payload: BlueprintPayload):
    try:
        os.makedirs(payload.userId, exist_ok=True)
        run_id = str(uuid.uuid4())
        playbook_path = os.path.join(payload.userId, f"{run_id}.yaml")

        components = sorted(payload.components, key=lambda c: c.position)

        tasks = []
        for comp in components:
            role_handler = ROLE_DISPATCH.get(comp.ansibleRole)
            if not role_handler:
                raise HTTPException(status_code=400, detail=f"Unsupported role: {comp.ansibleRole}")

            param_dicts = [p.dict() for p in comp.parameters]
            task = role_handler(param_dicts)
            tasks.append(task)

        playbook = [{
            "name": f"Blueprint {payload.blueprintId}",
            "hosts": "all",
            "become": True,
            "tasks": tasks
        }]

        with open(playbook_path, "w") as f:
            yaml.dump(playbook, f)

        return {
            "status": "success",
            "playbookPath": playbook_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate playbook: {e}")
