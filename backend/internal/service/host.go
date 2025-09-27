package service

import (
	 "clouding/backend/internal/model/host"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/utils"
	"context"
	"sync"
	"time"
)

// HostService defines business logic for hosts
type HostService interface {
	GetHosts(ctx context.Context, ids []int) ([]*host.Host, error)
	GetAllHostsByUserId(ctx context.Context, userId string) ([]*host.Host, error)
	CreateHost(ctx context.Context, h *host.Host) error
	UpdateHost(ctx context.Context, h *host.Host) error
	DeleteHost(ctx context.Context, id int) error
	GetHostsHealth(ctx context.Context, ids []int) ([]*host.HostHealth, error)
}

type hostService struct {
	repo repository.HostRepository
}

func NewHostService(repo repository.HostRepository) HostService {
	return &hostService{repo: repo}
}

func (s *hostService) GetHosts(ctx context.Context, ids []int) ([]*host.Host, error) {
	return s.repo.GetHosts(ctx, ids)
}
func (s *hostService) GetAllHostsByUserId(ctx context.Context, userId string) ([]*host.Host, error) {
	return s.repo.GetAllHosts(ctx, userId)
}

func (s *hostService) CreateHost(ctx context.Context, h *host.Host) error {
	return s.repo.CreateHost(ctx, h)
}
func (s *hostService) UpdateHost(ctx context.Context, h *host.Host) error {
	return s.repo.UpdateHost(ctx, h)
}
func (s *hostService) DeleteHost(ctx context.Context, id int) error {
	return s.repo.DeleteHost(ctx, id)
}



func (s *hostService) GetHostsHealth(ctx context.Context, ids []int) ([]*host.HostHealth, error) {
	hosts, err := s.repo.GetHosts(ctx, ids)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	var wg sync.WaitGroup
	mu := &sync.Mutex{}
	var results []*host.HostHealth

	for _, h := range hosts {
		if h.IP == nil {
			continue
		}

		wg.Add(1)

		go func(h *host.Host) {
			defer wg.Done()

			status, details := "unhealthy", "timeout or error"
			done := make(chan struct{})

			go func() {
				status, details = utils.PerformHealthCheck(*h.IP, "22") 
				close(done)
			}()

			select {
			case <-ctx.Done():
				status, details = "unhealthy", "health check timed out"
			case <-done:
			}

			health := &host.HostHealth{
				HostID:    h.ID,
				IP:        h.IP,
				Status:    &status,
				Details:   &details,
				CheckedAt: utils.PtrTime(time.Now()),
			}

			mu.Lock()
			results = append(results, health)
			mu.Unlock()
		}(h)
	}

	wg.Wait()
	return results, nil
}

