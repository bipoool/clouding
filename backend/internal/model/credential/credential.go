package credential

import "time"

type CredentialType string

const (
	CredentialTypeSSHKey   CredentialType = "ssh_key"
	CredentialTypeSSL      CredentialType = "ssl_cert"
	CredentialTypePassword CredentialType = "password"
	CredentialTypeAPIKey   CredentialType = "api_key"
)

type Credential struct {
	ID        *int              `db:"id" json:"id"`
	Name      *string           `db:"name" json:"name"`
	Type      *CredentialType   `db:"type" json:"type"`
	UserID    *string           `db:"user_id" json:"userId"`
	CreatedAt *time.Time        `db:"created_at" json:"created_at"`
	UpdatedAt *time.Time        `db:"updated_at" json:"updated_at"`
	Secret    map[string]string `json:"secret"`
}

// Response structs
type CreateCredentialResponse struct {
	ID *int `json:"id"`
}

type UpdateCredentialResponse struct {
	ID        *int       `json:"id"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

type DeleteCredentialResponse struct {
	ID        *int `json:"id"`
	IsDeleted bool `json:"isDeleted"`
}
