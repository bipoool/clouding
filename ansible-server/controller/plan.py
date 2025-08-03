import os
import uuid
import yaml
from fastapi import HTTPException

from handlers import docker, nginx
from models import plan
from models.blueprint import AnsiblePlan, BlueprintComponent
from repositories import blueprint as blueprintRepository

ROLE_DISPATCH = {
    "nginxinc.nginx": nginx.build_nginx_role,
    "community.docker.docker_install": docker.build_docker_task
}

PLAYBOOK_BASE_PATH = "runs"

def generatePlan(payload: plan.Plan):
    try:
        playbook_dir = os.path.join(PLAYBOOK_BASE_PATH, payload.userId, payload.jobId)
        os.makedirs(playbook_dir, exist_ok=True)
        run_id = str(uuid.uuid4())
        playbook_path = os.path.join(playbook_dir, f"{run_id}.yaml")

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
            "name": f"{blueprint.name} - {run_id}",
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
            "jobId": payload.jobId
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
