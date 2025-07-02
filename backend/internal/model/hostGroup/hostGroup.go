package hostgroup

import (
	"time"
)

type HostGroup struct {
	ID        *int       `db:"id" json:"id"`
	UserID    *int       `db:"user_id" json:"userId"`
	Name      *string    `db:"name" json:"name"`
	HostIDs   *[]int     `db:"host_ids" json:"hostIds"` // Assumes host IDs are integers stored as int[] in PostgreSQL
	CreatedAt *time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt *time.Time `db:"updated_at" json:"updatedAt"`
}

type CreateHostGroupResponse struct {
	ID *int `json:"id"`
}

type UpdateHostGroupResponse struct {
	ID        *int       `json:"id"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

type DeleteHostGroupResponse struct {
	ID        *int `json:"id"`
	IsDeleted bool `json:"isDeleted"`
}
