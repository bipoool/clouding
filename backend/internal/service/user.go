package service

import (
	"clouding/backend/internal/model/user"
	"clouding/backend/internal/repository"
	"context"
)

// UserService defines business logic for users
type UserService interface {
	GetUser(ctx context.Context, id string) (*user.User, error)
	CreateUser(ctx context.Context, u *user.User) error
	UpdateUser(ctx context.Context, u *user.User) error
	DeleteUser(ctx context.Context, id string) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetUser(ctx context.Context, id string) (*user.User, error) {
	return s.repo.GetUser(ctx, id)
}

func (s *userService) CreateUser(ctx context.Context, u *user.User) error {
	return s.repo.CreateUser(ctx, u)
}

func (s *userService) UpdateUser(ctx context.Context, u *user.User) error {
	return s.repo.UpdateUser(ctx, u)
}

func (s *userService) DeleteUser(ctx context.Context, id string) error {
	return s.repo.DeleteUser(ctx, id)
}
