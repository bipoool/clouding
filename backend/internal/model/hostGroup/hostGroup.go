package hostgroup

import (
	host "clouding/backend/internal/model/host"
	"time"
    "github.com/lib/pq"

)

type HostGroup struct {
	ID        int         `json:"id" db:"id"`
	UserID    string      `json:"userId" db:"user_id"`
	Name      *string     `json:"name" db:"name"`
	HostIDs   pq.Int64Array       `json:"hostIds,omitempty" db:"host_ids"` // for CREATE and raw access
	Hosts     []host.Host `json:"hosts,omitempty" db:"host_ids"`
	CreatedAt *time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt *time.Time  `json:"updatedAt" db:"updated_at"`
}
