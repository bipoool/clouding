package user

import (
	"time"
)

type User struct {
	ID        *int       `db:"id" json:"id"`
	Name      *string    `db:"name" json:"name"`
	Email     *string    `db:"email" json:"email"`
	CreatedAt *time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt *time.Time `db:"updated_at" json:"updatedAt"`
}

// Response structs
type CreateUserResponse struct {
	ID *int `json:"id"`
}

type UpdateUserResponse struct {
	ID        *int       `json:"id"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

type DeleteUserResponse struct {
	ID        *int `json:"id"`
	IsDeleted bool `json:"isDeleted"`
}
