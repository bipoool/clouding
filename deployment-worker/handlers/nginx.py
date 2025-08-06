import os
import requests

def handleNginxServiceCustom(value: dict, playbookDir: str, roleName: str) -> dict:
    filepath = value["filepath"]
    url = value["url"]

    # Save override file to: ./overrides/{userId}/{roleName}/{filepath}
    targetPath = os.path.join(playbookDir, "overrides", roleName, filepath)
    os.makedirs(os.path.dirname(targetPath), exist_ok=True)

    resp = requests.get(url)
    if resp.status_code != 200:
        raise Exception(f"Failed to download file from {url}")
    
    with open(targetPath, "wb") as f:
        f.write(resp.content)

    return {
        "nginx_service_custom": True,
        "nginx_service_custom_file": targetPath
    }


# Mapping: param name -> handler function
propertyHandlers = {
    "nginx_service_custom": handleNginxServiceCustom
}


def buildNginxRole(parameters: list, playbookDir: str) -> dict:
    roleName = "nginxinc.nginx"
    varsDict = {}

    for param in parameters:
        name = param["name"]
        value = param["value"]

        if name in propertyHandlers:
            varsDict.update(propertyHandlers[name](value, playbookDir, roleName))
        else:
            varsDict[name] = value

    return {
        "role": roleName,
        "vars": varsDict
    }
