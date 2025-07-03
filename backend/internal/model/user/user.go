package user

import (
	"time"
)

type User struct {
	ID        *string    `db:"id" json:"id"`
	Name      *string    `db:"name" json:"name"`
	Picture   *string    `db:"picture" json:"picture"`
	FullName  *string    `db:"full_name" json:"fullName"`
	AvatarUrl *string    `db:"avatar_url" json:"avatarUrl"`
	Email     *string    `db:"email" json:"email"`
	CreatedAt *time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt *time.Time `db:"updated_at" json:"updatedAt"`
}

// Response structs
type CreateUserResponse struct {
	ID *string `json:"id"`
}

type UpdateUserResponse struct {
	ID        *string    `json:"id"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

type DeleteUserResponse struct {
	ID        *string `json:"id"`
	IsDeleted bool    `json:"isDeleted"`
}
