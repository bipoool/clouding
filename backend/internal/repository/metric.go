package repository

import (
	"clouding/backend/internal/model/metric"
	"context"
	_ "embed" // Required for embeddings

	"github.com/jmoiron/sqlx"
)

type MetricRepository interface {
	GetOverview(ctx context.Context, userId string) ([]*metric.Overview, error)
}

// SQL Queries (embed the .sql files)

//go:embed sql/metric/overview.sql
var getOverviewByUserIdQuery string

type metricRepository struct {
	db *sqlx.DB
}

func NewMetricRepository(db *sqlx.DB) MetricRepository {
	return &metricRepository{
		db: db,
	}
}

func (r *metricRepository) GetOverview(ctx context.Context, userId string) ([]*metric.Overview, error) {
	var overview []*metric.Overview
	if err := r.db.SelectContext(ctx, &overview, getOverviewByUserIdQuery, userId); err != nil {
		return nil, err
	}
	return overview, nil
}
