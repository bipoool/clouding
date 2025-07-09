package repository

import (
	"clouding/backend/internal/model/component"
	"context"
	"database/sql"
	_ "embed"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type ComponentRepository interface {
	GetComponent(ctx context.Context, id int) (*component.Component, error)
	GetComponentByIds(ctx context.Context, ids []int) ([]*component.Component, error)
	GetAllComponents(ctx context.Context) ([]*component.Component, error)
}

// Queries
//
//go:embed sql/component/getComponentById.sql
var getComponentByIdQuery string

//go:embed sql/component/getAllComponents.sql
var getAllComponentsQuery string

//go:embed sql/component/getComponentsByIds.sql
var getComponentsByIdsQuery string

type componentRepository struct {
	db *sqlx.DB
}

func NewComponentRepository(db *sqlx.DB) ComponentRepository {
	return &componentRepository{db: db}
}

func (r *componentRepository) GetComponent(ctx context.Context, id int) (*component.Component, error) {
	var comp component.Component
	if err := r.db.GetContext(ctx, &comp, getComponentByIdQuery, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &comp, nil
}

func (r *componentRepository) GetComponentByIds(ctx context.Context, ids []int) ([]*component.Component, error) {
	var comps []*component.Component
	if len(ids) == 0 {
		return comps, nil
	}
	if err := r.db.SelectContext(ctx, &comps, getComponentsByIdsQuery, pq.Array(ids)); err != nil {
		return nil, err
	}
	return comps, nil
}

func (r *componentRepository) GetAllComponents(ctx context.Context) ([]*component.Component, error) {
	var comps []*component.Component
	if err := r.db.SelectContext(ctx, &comps, getAllComponentsQuery); err != nil {
		return nil, err
	}
	return comps, nil
}
