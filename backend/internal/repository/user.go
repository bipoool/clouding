package repository

import (
	"clouding/backend/internal/model/user"
	"context"
	"database/sql"
	_ "embed" // Required for embedding
	"errors"
	"time"

	sq "github.com/Masterminds/squirrel"

	"github.com/jmoiron/sqlx"
)

// UserRepository defines data access for users
type UserRepository interface {
	GetUser(ctx context.Context, id string) (*user.User, error)
	CreateUser(ctx context.Context, u *user.User) error
	UpdateUser(ctx context.Context, u *user.User) error
	DeleteUser(ctx context.Context, id string) error
}

// Queries

//go:embed sql/user/getUserById.sql
var getUserByIdQuery string

//go:embed sql/user/createUser.sql
var createUserQuery string

//go:embed sql/user/deleteUserById.sql
var deleteUserQuery string

type userRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &userRepository{
		db: db,
	}
}

func (r *userRepository) GetUser(ctx context.Context, id string) (*user.User, error) {
	var userObj user.User

	err := r.db.GetContext(ctx, &userObj, getUserByIdQuery, id)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &userObj, nil
}

func (r *userRepository) CreateUser(ctx context.Context, u *user.User) error {
	rows, err := r.db.NamedQueryContext(ctx, createUserQuery, u)
	if err != nil {
		return err
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&u.ID)
	}

	return nil
}

func (r *userRepository) UpdateUser(ctx context.Context, u *user.User) error {
	builder := sq.
		Update("users").
		Set("updated_at", "NOW()").
		Where(sq.Eq{"id": u.ID}).
		Suffix("RETURNING updated_at").
		PlaceholderFormat(sq.Dollar)

	// Add only fields that are non-nil
	if u.Name != nil {
		builder = builder.Set("name", *u.Name)
	}
	if u.Email != nil {
		builder = builder.Set("email", *u.Email)
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return err
	}

	var updatedAt time.Time
	if err := r.db.GetContext(ctx, &updatedAt, query, args...); err != nil {
		return err
	}
	u.UpdatedAt = &updatedAt

	return nil
}

func (r *userRepository) DeleteUser(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, deleteUserQuery, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
