def buildCloudingJavaRole(parameters: list, playbookDir: str) -> dict:
    roleName = "clouding.Java"
    varsDict = {}

    for param in parameters:
        name = param["name"]
        value = param["value"]
        varsDict[name] = value

    return {
        "role": roleName,
        "vars": varsDict
    }
