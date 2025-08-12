package service

import (
	"clouding/backend/internal/model/metric"
	"clouding/backend/internal/repository"
	"context"
)

type MetricService interface {
	GetOverview(ctx context.Context, userId string) ([]*metric.Overview, error)
}

type metricService struct {
	repo repository.MetricRepository
}

func NewMetricService(repo repository.MetricRepository) MetricService {
	return &metricService{
		repo: repo,
	}
}

func (r *metricService) GetOverview(ctx context.Context, userId string) ([]*metric.Overview, error) {
	return r.repo.GetOverview(ctx, userId)
}
