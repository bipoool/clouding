package hostgroup

import (
	"encoding/json"
	"time"
)

type HostGroup struct {
	ID        int             `json:"id" db:"id"`
	UserID    string          `json:"userId" db:"user_id"`
	Name      *string         `json:"name" db:"name"`
	HostIDs   []int           `json:"hostIds,omitempty" db:"host_ids"` // for CREATE and raw access
	Hosts     json.RawMessage `json:"hosts,omitempty"`                 // for GET (joined from hosts table)
	CreatedAt *time.Time      `json:"createdAt" db:"created_at"`
	UpdatedAt *time.Time      `json:"updatedAt" db:"updated_at"`
}
