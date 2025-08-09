package hostgroup

import (
	"time"

	"github.com/lib/pq"
)

type HostGroup struct {
	ID          *int          `json:"id" db:"id"`
	UserID      *string       `json:"userId" db:"user_id"`
	Name        *string       `json:"name" db:"name"`
	Description *string       `json:"description" db:"description"`
	HostIds     pq.Int64Array `json:"hostIds" db:"host_ids"`
	CreatedAt   *time.Time    `json:"createdAt" db:"created_at"`
	UpdatedAt   *time.Time    `json:"updatedAt" db:"updated_at"`
}

type HostGroupCreateResponse struct {
	ID        *int       `json:"id" db:"id"`
	CreatedAt *time.Time `json:"createdAt" db:"created_at"`
}

type HostGroupUpdateResponse struct {
	UpdatedAt *time.Time `json:"updatedAt" db:"updated_at"`
}

type HostGroupDeleteResponse struct {
	ID        *int `json:"id"`
	IsDeleted bool `json:"isDeleted"`
}

type AddHostToHostgroupRequest struct {
	HostIDs []int `json:"hostIds"`
}
