package component

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type Component struct {
	ID          *int                 `db:"id" json:"id"`
	Name        *string              `db:"name" json:"name"`
	DisplayName *string              `db:"display_name" json:"displayName"`
	Description *string              `db:"description" json:"description"`
	Label       *string              `db:"label" json:"label"`
	AnsibleRole *string              `db:"ansible_role" json:"ansibleRole"`
	Parameters  *ComponentParameters `db:"parameters" json:"parameters"`
	CreatedAt   *time.Time           `db:"created_at,omitempty" json:"createdAt"`
	UpdatedAt   *time.Time           `db:"updated_at,omitempty" json:"updatedAt"`
}

type ParameterRule struct {
	Required   bool              `json:"required"`
	RequiredIf map[string]string `json:"required_if,omitempty"`
}

type FileConfig struct {
	Filename *string `json:"filename"`
	URL      *string `json:"url"`
}

type ValueType string

const (
	ValueTypeString   ValueType = "string"
	ValueTypeFileList ValueType = "fileList"
)

type UIType string

const (
	UITypeText     UIType = "text"
	UITypeSelect   UIType = "select"
	UITypeFile     UIType = "file"
	UITypeFileList UIType = "fileList"
	UITypeTextarea UIType = "textarea"
)

type ComponentParameter struct {
	Id          string        `json:"id"`
	Name        string        `json:"name"`
	ValueType   ValueType     `json:"valueType"`
	UIType      UIType        `json:"uiType"`
	Rules       ParameterRule `json:"rules"`
	Default     interface{}   `json:"default,omitempty"`
	Description string        `json:"description"`
	Options     []string      `json:"options,omitempty"`
}

type ComponentParameters []ComponentParameter

func (p *ComponentParameters) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		actualType := fmt.Sprintf("%T", value)
		return fmt.Errorf("cannot scan Parameters: expected []byte, got %s", actualType)
	}

	if err := json.Unmarshal(bytes, p); err != nil {
		return fmt.Errorf("failed to unmarshal Parameters JSON: %w", err)
	}

	return nil
}

func (p ComponentParameters) Value() (driver.Value, error) {
	bytes, err := json.Marshal(p)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal Parameters: %w", err)
	}
	return bytes, nil
}
