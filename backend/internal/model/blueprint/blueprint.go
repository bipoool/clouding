package blueprint

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type Blueprint struct {
	ID          *int             `db:"id" json:"id"`
	Name        *string          `db:"name" json:"name"`
	Description *string          `db:"description" json:"description"`
	UserID      *string          `db:"user_id" json:"userId"`
	Status      *BlueprintStatus `db:"status" json:"status"`
	CreatedAt   *time.Time       `db:"created_at" json:"createdAt"`
	UpdatedAt   *time.Time       `db:"updated_at" json:"updatedAt"`
}

type BlueprintComponent struct {
	ID          *int                 `db:"id" json:"id"`
	BlueprintID *int                 `db:"blueprint_id" json:"blueprintId"`
	ComponentID *int                 `db:"component_id" json:"componentId"`
	Position    *int                 `db:"position" json:"position"`
	Parameters  *BlueprintParameters `db:"parameters" json:"parameters"`
	CreatedAt   *time.Time           `db:"created_at" json:"createdAt"`
	UpdatedAt   *time.Time           `db:"updated_at" json:"updatedAt"`
}

type BlueprintStatus string

const (
	BlueprintStatusDraft    BlueprintStatus = "draft"
	BlueprintStatusDeployed BlueprintStatus = "deployed"
	BlueprintStatusArchived BlueprintStatus = "archived"
)

type BlueprintParameter struct {
	ID    string      `json:"id"`
	Value interface{} `json:"value"`
	Name  string      `json:"name"`
}

type BlueprintParameters []BlueprintParameter

func (p *BlueprintParameters) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		actualType := fmt.Sprintf("%T", value)
		return fmt.Errorf("cannot scan BlueprintParameters: expected []byte, got %s", actualType)
	}

	if err := json.Unmarshal(bytes, p); err != nil {
		return fmt.Errorf("failed to unmarshal BlueprintParameters JSON: %w", err)
	}

	return nil
}

func (p BlueprintParameters) Value() (driver.Value, error) {
	bytes, err := json.Marshal(p)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal BlueprintParameters: %w", err)
	}
	return bytes, nil
}

type CreateBlueprintResponse struct {
	ID *int `json:"id"`
}

type CreateBlueprintComponentResponse struct {
	BlueprintComponentID *int `json:"id"`
	ComponentID          *int `json:"componentId"`
	Position             *int `json:"position"`
}

type UpdateBlueprintResponse struct {
	ID        *int       `json:"id"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

type UpdateBlueprintComponentResponse struct {
	BlueprintComponentID *int `json:"id"`
	ComponentID          *int `json:"componentId"`
	Position             *int `json:"position"`
}
