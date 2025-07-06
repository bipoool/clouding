package repository

import (
	"clouding/backend/internal/model/blueprint"
	"context"
	"database/sql"
	_ "embed"
	"errors"

	"github.com/jmoiron/sqlx"
)

type BlueprintRepository interface {
	GetBlueprint(ctx context.Context, id int) (*blueprint.Blueprint, error)
	GetAllBlueprints(ctx context.Context, userId string) ([]*blueprint.Blueprint, error)
	CreateBlueprint(ctx context.Context, b *blueprint.Blueprint, components []*blueprint.BlueprintComponent) error
	GetComponentsByBlueprintID(ctx context.Context, blueprintId int) ([]*blueprint.BlueprintComponent, error)
}

// Queries
//
//go:embed sql/blueprint/getBlueprintById.sql
var getBlueprintByIdQuery string

//go:embed sql/blueprint/getBlueprintsByUserId.sql
var getBlueprintsByUserIdQuery string

//go:embed sql/blueprint/createBlueprint.sql
var createBlueprintQuery string

//go:embed sql/blueprint/getComponentsByBlueprintId.sql
var getComponentsByBlueprintIdQuery string

//go:embed sql/blueprint/createBlueprintComponent.sql
var createBlueprintComponentQuery string

type blueprintRepository struct {
	db *sqlx.DB
}

func NewBlueprintRepository(db *sqlx.DB) BlueprintRepository {
	return &blueprintRepository{db: db}
}

func (r *blueprintRepository) GetBlueprint(ctx context.Context, id int) (*blueprint.Blueprint, error) {
	var bp blueprint.Blueprint
	err := r.db.GetContext(ctx, &bp, getBlueprintByIdQuery, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &bp, nil
}

func (r *blueprintRepository) GetAllBlueprints(ctx context.Context, userId string) ([]*blueprint.Blueprint, error) {
	var bps []*blueprint.Blueprint
	err := r.db.SelectContext(ctx, &bps, getBlueprintsByUserIdQuery, userId)
	if err != nil {
		return nil, err
	}
	return bps, nil
}

func (r *blueprintRepository) CreateBlueprint(ctx context.Context, b *blueprint.Blueprint, components []*blueprint.BlueprintComponent) (err error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	// Prepare and insert blueprint
	createBluePrintstmt, err := tx.PrepareNamedContext(ctx, createBlueprintQuery)
	if err != nil {
		return err
	}
	defer createBluePrintstmt.Close()
	rows, err := createBluePrintstmt.QueryContext(ctx, b)
	if err != nil {
		return err
	}

	if rows.Next() {
		if err = rows.Scan(&b.ID); err != nil {
			rows.Close()
			return err
		}
	}
	rows.Close()

	createBlueprintComponentstmt, err := tx.PrepareNamedContext(ctx, createBlueprintComponentQuery)
	if err != nil {
		return err
	}
	defer createBlueprintComponentstmt.Close()
	// Prepare component insert
	for _, comp := range components {
		comp.BlueprintID = b.ID
		var compRows *sql.Rows
		compRows, err = createBlueprintComponentstmt.QueryContext(ctx, comp)
		if err != nil {
			return err
		}
		if compRows.Next() {
			if err = compRows.Scan(&comp.ID); err != nil {
				compRows.Close()
				return err
			}
		}
		compRows.Close()
	}
	return tx.Commit()
}

func (r *blueprintRepository) GetComponentsByBlueprintID(ctx context.Context, blueprintId int) ([]*blueprint.BlueprintComponent, error) {
	var comps []*blueprint.BlueprintComponent
	err := r.db.SelectContext(ctx, &comps, getComponentsByBlueprintIdQuery, blueprintId)
	if err != nil {
		return nil, err
	}
	return comps, nil
}
