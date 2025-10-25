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
    rules: Dict[str, Any]
    uiType: str
    default: Any = None
    description: str = ""
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

        componentParams = [ComponentParameter(**cp) for cp in self.componentparameters]
        blueprintParams = [BlueprintParameter(**bp) for bp in self.blueprintparameters]

        componentParamMap = {cp.id: cp for cp in componentParams}
        nameToIdMap = {cp.name: cp.id for cp in componentParams}
        blueprintParamMap = {bp.id: bp for bp in blueprintParams}

        for cid, componentParam in componentParamMap.items():
            userParam = blueprintParamMap.get(cid)

            # Unconditional required
            if componentParam.rules.get("required") and userParam is None:
                return f"missing required parameter: {componentParam.name}"

            # Conditional required_if
            requiredIf = componentParam.rules.get("required_if", {})
            for otherParamName, expectedValue in requiredIf.items():
                otherParamId = nameToIdMap.get(otherParamName)
                if not otherParamId:
                    return f"unknown parameter: {otherParamName}"
                otherParam = blueprintParamMap.get(otherParamId)
                if not otherParam:
                    return f"unknown parameter: {otherParamName}"
                if otherParam and str(otherParam.value) == expectedValue:
                    if userParam is None:
                        return (
                            f"parameter {componentParam.name} is required because "
                            f"{otherParamName} is {expectedValue}"
                        )

            # If present, validate value type and options
            if userParam:
                val = userParam.value

                if componentParam.valueType == "string":
                    if not isinstance(val, str):
                        return f"parameter {componentParam.name} expects a string value"

                elif componentParam.valueType == "file_list":
                    try:
                        fileList = json.loads(json.dumps(val))  # simulate deep copy
                        for f in fileList:
                            if not f.get("filename") and not f.get("url"):
                                return (
                                    f"parameter {componentParam.name} has invalid file list entry: "
                                    f"missing filename or URL"
                                )
                    except Exception:
                        return f"parameter {componentParam.name} expects file list structure, got: {val}"

                if componentParam.uiType == "select":
                    strVal = str(val)
                    if componentParam.options and strVal not in componentParam.options:
                        return f"parameter {componentParam.name} has invalid value: {val}"

        # Validate unknown parameters
        for bid, bp in blueprintParamMap.items():
            if bid not in componentParamMap:
                return f"unknown parameter: {bp.name} (id: {bp.id})"

        return None  # Success
