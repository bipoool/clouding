package repository

import (
	"clouding/backend/internal/model/component"
	"context"
	"database/sql"
	_ "embed"

	"github.com/jmoiron/sqlx"
)

type ComponentRepository interface {
	GetComponent(ctx context.Context, id int) (*component.Component, error)
	GetAllComponents(ctx context.Context) ([]*component.Component, error)
}

// Queries
//
//go:embed sql/component/getComponentById.sql
var getComponentByIdQuery string

//go:embed sql/component/getAllComponents.sql
var getAllComponentsQuery string

type componentRepository struct {
	db *sqlx.DB
}

func NewComponentRepository(db *sqlx.DB) ComponentRepository {
	return &componentRepository{db: db}
}

func (r *componentRepository) GetComponent(ctx context.Context, id int) (*component.Component, error) {
	var comp component.Component
	if err := r.db.GetContext(ctx, &comp, getComponentByIdQuery, id); err != nil {
		return nil, err
	}
	return &comp, nil
}

func (r *componentRepository) GetAllComponents(ctx context.Context) ([]*component.Component, error) {
	var comps []*component.Component
	if err := r.db.SelectContext(ctx, &comps, getAllComponentsQuery); err != nil {
		return nil, err
	}
	if len(comps) == 0 {
		return nil, sql.ErrNoRows
	}
	return comps, nil
}
