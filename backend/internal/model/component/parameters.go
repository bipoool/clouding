package component

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"log/slog"
)

type ParameterRule struct {
	Required   bool              `json:"required"`
	RequiredIf map[string]string `json:"required_if,omitempty"`
}

type FileConfig struct {
	Filename string `json:"filename"`
	URL      string `json:"url"`
}

type ValueType string

const (
	ValueTypeString ValueType = "string"
	ValueTypeArray  ValueType = "fileList"
)

type UIType string

const (
	UITypeText     UIType = "text"
	UITypeSelect   UIType = "select"
	UITypeFile     UIType = "file"
	UITypeFileList UIType = "fileList"
	UITypeTextarea UIType = "textarea"
	UITypeCheckbox UIType = "checkbox"
	UITypeRadio    UIType = "radio"
)

type Parameter struct {
	Name        string        `json:"name"`
	ValueType   ValueType     `json:"valueType"`
	UIType      UIType        `json:"uiType"`
	Rules       ParameterRule `json:"rules"`
	Default     interface{}   `json:"default"`
	Description string        `json:"description"`
	Options     []string      `json:"options,omitempty"`
}

type Parameters []Parameter

func (p *Parameters) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		slog.Error("value cannot be converted to Parameters", "value", value)
		return fmt.Errorf("%v value cannot be converted to Parameters", value)
	}
	return json.Unmarshal(bytes, p)
}

func (p Parameters) Value() (driver.Value, error) {
	return json.Marshal(p)
}
