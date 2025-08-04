from dataclasses import dataclass, field
from typing import Optional, Dict, List, Any
import json

@dataclass
class BlueprintParameter:
    id: str
    name: str
    value: Any

@dataclass
class ComponentParameter:
    id: str
    name: str
    valueType: str
    default: Any
    description: str
    rules: Dict[str, Any]
    uiType: str
    options: List[str] = field(default_factory=list)

@dataclass
class FileConfig:
    filename: str
    url: str

@dataclass
class Blueprint:
    id: int
    name: str
    status: str
    def validate(self) -> Optional[str]:
        if not self.name or not self.status:
            return "name and status cannot be None"
        return None

@dataclass
class BlueprintComponent:
    id: int
    componentid: int
    position: int
    ansiblerole: str
    blueprintparameters: dict
    componentparameters: dict

    def validateParameters(self) -> Optional[str]:
        if not self.blueprintparameters or not self.componentparameters:
            return "parameters cannot be None"

        component_params = [ComponentParameter(**cp) for cp in self.componentparameters]
        blueprint_params = [BlueprintParameter(**bp) for bp in self.blueprintparameters]

        component_param_map = {cp.id: cp for cp in component_params}
        name_to_id_map = {cp.name: cp.id for cp in component_params}
        blueprint_param_map = {bp.id: bp for bp in blueprint_params}

        for cid, component_param in component_param_map.items():
            user_param = blueprint_param_map.get(cid)

            # Unconditional required
            if component_param.rules.get("required") and user_param is None:
                return f"missing required parameter: {component_param.name}"

            # Conditional required_if
            required_if = component_param.rules.get("required_if", {})
            for other_param_name, expected_value in required_if.items():
                other_param_id = name_to_id_map.get(other_param_name)
                if not other_param_id:
                    return f"unknown parameter: {other_param_name}"
                other_param = blueprint_param_map.get(other_param_id)
                if not other_param:
                    return f"unknown parameter: {other_param_name}"
                if other_param and str(other_param.value) == expected_value:
                    if user_param is None:
                        return (
                            f"parameter {component_param.name} is required because "
                            f"{other_param_name} is {expected_value}"
                        )

            # If present, validate value type and options
            if user_param:
                val = user_param.value

                if component_param.valueType == "string":
                    if not isinstance(val, str):
                        return f"parameter {component_param.name} expects a string value"

                elif component_param.valueType == "file_list":
                    try:
                        file_list = json.loads(json.dumps(val))  # simulate deep copy
                        for f in file_list:
                            if not f.get("filename") and not f.get("url"):
                                return (
                                    f"parameter {component_param.name} has invalid file list entry: "
                                    f"missing filename or URL"
                                )
                    except Exception:
                        return f"parameter {component_param.name} expects file list structure, got: {val}"

                if component_param.uiType == "select":
                    str_val = str(val)
                    if component_param.options and str_val not in component_param.options:
                        return f"parameter {component_param.name} has invalid value: {val}"

        # Validate unknown parameters
        for bid, bp in blueprint_param_map.items():
            if bid not in component_param_map:
                return f"unknown parameter: {bp.name} (id: {bp.id})"

        return None  # Success

@dataclass
class AnsiblePlan:
    name: str
    status: str
    blueprintid: int
    components: List[BlueprintComponent]
