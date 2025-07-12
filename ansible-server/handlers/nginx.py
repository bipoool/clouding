import os
import requests

def handle_nginx_service_custom(value: dict, user_id: str, role_name: str) -> dict:
    filepath = value["filepath"]
    url = value["url"]

    # Save override file to: ./overrides/{userId}/{roleName}/{filepath}
    target_path = os.path.join("overrides", user_id, role_name, filepath)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)

    resp = requests.get(url)
    if resp.status_code != 200:
        raise Exception(f"Failed to download file from {url}")
    
    with open(target_path, "wb") as f:
        f.write(resp.content)

    return {
        "nginx_service_custom": True,
        "nginx_service_custom_file": target_path
    }


# Mapping: param name -> handler function
property_handlers = {
    "nginx_service_custom": handle_nginx_service_custom
}


def build_nginx_role(parameters: list, user_id: str) -> dict:
    role_name = "nginxinc.nginx"
    vars_dict = {}

    for param in parameters:
        name = param["name"]
        value = param["value"]

        if name in property_handlers:
            vars_dict.update(property_handlers[name](value, user_id, role_name))
        else:
            vars_dict[name] = value

    return {
        "role": role_name,
        "vars": vars_dict
    }
