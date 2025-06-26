package service

import (
	"clouding/backend/internal/model/host"
	"clouding/backend/internal/repository"
	"context"
)

// HostService defines business logic for hosts
type HostService interface {
	GetHost(ctx context.Context, id int) (*host.Host, error)
	GetAllHosts(ctx context.Context) ([]*host.Host, error)
	CreateHost(ctx context.Context, h *host.Host) error
	UpdateHost(ctx context.Context, h *host.Host) error
	DeleteHost(ctx context.Context, id int) error
}

type hostService struct {
	repo repository.HostRepository
}

func NewHostService(repo repository.HostRepository) HostService {
	return &hostService{repo: repo}
}

func (s *hostService) GetHost(ctx context.Context, id int) (*host.Host, error) {
	return s.repo.GetHost(ctx, id)
}
func (s *hostService) GetAllHosts(ctx context.Context) ([]*host.Host, error) { return nil, nil }
func (s *hostService) CreateHost(ctx context.Context, h *host.Host) error {
	return s.repo.CreateHost(ctx, h)
}
func (s *hostService) UpdateHost(ctx context.Context, h *host.Host) error {
	return s.repo.UpdateHost(ctx, h)
}
func (s *hostService) DeleteHost(ctx context.Context, id int) error {
	return s.repo.DeleteHost(ctx, id)
}
