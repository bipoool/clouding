package host

import (
	"encoding/json"
	"time"
)

type Host struct {
	ID           *int             `db:"id" json:"id"`
	UserID       *string          `db:"user_id" json:"userId"`
	Name         *string          `db:"name" json:"name"`
	IP           *string          `db:"ip" json:"ip"`
	Os           *string          `db:"os" json:"os"`
	CredentialID *string          `db:"credential_id" json:"credentialId"`
	MetaData     *json.RawMessage `db:"meta_data" json:"metaData"`
	CreatedAt    *time.Time       `db:"created_at" json:"createdAt"`
	UpdatedAt    *time.Time       `db:"updated_at" json:"updatedAt"`
}

type HostHealth struct {
	HostID    *int      `json:"hostId,omitempty"`
	IP        *string   `json:"ip,omitempty"`
	Status    *string   `json:"status,omitempty"`
	Details   *string   `json:"details,omitempty"`
	CheckedAt time.Time `json:"checkedAt,omitempty"`
}

// Response structs
type CreateHostResponse struct {
	ID *int `json:"id"`
}

type UpdateHostResponse struct {
	ID        *int       `json:"id"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

type DeleteHostResponse struct {
	ID        *int `json:"id"`
	IsDeleted bool `json:"isDeleted"`
}
