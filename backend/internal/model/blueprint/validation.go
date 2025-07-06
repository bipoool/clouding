package blueprint

import (
	"clouding/backend/internal/model/component"
	"encoding/json"
	"fmt"
)

func ValidateBlueprintParametersUsingComponentParameters(
	blueprintParams *BlueprintParameters,
	componentParams *component.ComponentParameters,
) error {
	if blueprintParams == nil || componentParams == nil {
		return fmt.Errorf("parameters cannot be nil")
	}

	// build a map of component parameter definitions for easy lookup
	componentParamMap := make(map[string]component.ComponentParameter)
	nameToIdMap := make(map[string]string)
	for _, p := range *componentParams {
		componentParamMap[p.ID] = p
		nameToIdMap[p.Name] = p.ID
	}

	// map user-supplied blueprint parameters by id
	blueprintParamMap := make(map[string]BlueprintParameter)
	for _, bp := range *blueprintParams {
		blueprintParamMap[bp.ID] = bp
	}

	// validation loop
	for id, componentParam := range componentParamMap {
		userParam, exists := blueprintParamMap[id]

		// unconditional required
		if componentParam.Rules.Required && !exists {
			return fmt.Errorf("missing required parameter: %s", componentParam.Name)
		}

		// conditional required_if
		if componentParam.Rules.RequiredIf != nil {
			for otherParam, expectedValue := range componentParam.Rules.RequiredIf {
				otherParamId := nameToIdMap[otherParam]
				otherValue, ok := blueprintParamMap[otherParamId]
				if ok && fmt.Sprintf("%v", otherValue.Value) == expectedValue {
					if !exists {
						return fmt.Errorf(
							"parameter %s is required because %s is %s",
							componentParam.Name, otherParam, expectedValue,
						)
					}
				}
			}
		}

		// if present, validate type and options
		if exists {
			val := userParam.Value

			switch componentParam.ValueType {
			case component.ValueTypeString:
				if _, ok := val.(string); !ok {
					return fmt.Errorf("parameter %s expects a string value", componentParam.Name)
				}
			case component.ValueTypeFileList:
				// we expect an array of FileConfig objects
				valBytes, err := json.Marshal(val)
				if err != nil {
					return fmt.Errorf("parameter %s expects file list but could not marshal: %w", componentParam.Name, err)
				}
				var fileList []component.FileConfig
				if err := json.Unmarshal(valBytes, &fileList); err != nil {
					return fmt.Errorf("parameter %s expects file list structure, got: %v", componentParam.Name, val)
				}

				for _, f := range fileList {
					if f.Filename == nil && f.URL == nil {
						return fmt.Errorf("parameter %s has invalid file list entry: missing filename or URL", componentParam.Name)
					}
				}
			}

			// validate options if UIType is select/radio
			if componentParam.UIType == component.UITypeSelect {
				strVal := fmt.Sprintf("%v", val)
				found := false
				for _, option := range componentParam.Options {
					if option == strVal {
						found = true
						break
					}
				}
				if !found && len(componentParam.Options) > 0 {
					return fmt.Errorf("parameter %s has invalid value: %v", componentParam.Name, val)
				}
			}
		}
	}

	// Validate that all blueprint parameters are defined in component
	for id, blueprintParam := range blueprintParamMap {
		if _, exists := componentParamMap[id]; !exists {
			return fmt.Errorf("unknown parameter: %s (id: %s)", blueprintParam.Name, id)
		}
	}

	return nil
}
