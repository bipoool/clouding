package service

import (
	"clouding/backend/internal/model/component"
	"clouding/backend/internal/repository"
	"context"
)

type ComponentService interface {
	GetComponent(ctx context.Context, id int) (*component.Component, error)
	GetAllComponents(ctx context.Context) ([]*component.Component, error)
}

type componentService struct {
	repo repository.ComponentRepository
}

func NewComponentService(repo repository.ComponentRepository) ComponentService {
	return &componentService{repo: repo}
}

func (s *componentService) GetComponent(ctx context.Context, id int) (*component.Component, error) {
	return s.repo.GetComponent(ctx, id)
}

func (s *componentService) GetAllComponents(ctx context.Context) ([]*component.Component, error) {
	return s.repo.GetAllComponents(ctx)
}
