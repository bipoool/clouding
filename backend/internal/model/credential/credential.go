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
	ID        *int                   `db:"id" json:"id"`
	Name      *string                `db:"name" json:"name"`
	Type      *CredentialType        `db:"type" json:"type"`
	UserID    *string                `db:"user_id" json:"userId"`
	ExpiresAt *time.Time             `db:"expires_at" json:"expiresAt"`
	CreatedAt *time.Time             `db:"created_at" json:"createdAt"`
	UpdatedAt *time.Time             `db:"updated_at" json:"updatedAt"`
	Secret    map[string]interface{} `json:"secret"`
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
