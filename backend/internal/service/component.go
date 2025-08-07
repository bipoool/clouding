package service

import (
	"clouding/backend/internal/model/component"
	"clouding/backend/internal/repository"
	"context"
)

type ComponentService interface {
	GetComponentByIds(ctx context.Context, ids []int) ([]*component.Component, error)
	GetAllComponents(ctx context.Context) ([]*component.Component, error)
}

type componentService struct {
	repo repository.ComponentRepository
}

func NewComponentService(repo repository.ComponentRepository) ComponentService {
	return &componentService{repo: repo}
}

func (s *componentService) GetComponentByIds(ctx context.Context, ids []int) ([]*component.Component, error) {
	return s.repo.GetComponentByIds(ctx, ids)
}

func (s *componentService) GetAllComponents(ctx context.Context) ([]*component.Component, error) {
	return s.repo.GetAllComponents(ctx)
}
