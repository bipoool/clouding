package repository

import (
	"clouding/backend/internal/model/blueprint"
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"log/slog"
	"time"

	"github.com/jmoiron/sqlx"
)

type BlueprintRepository interface {
	GetBlueprint(ctx context.Context, id int) (*blueprint.Blueprint, error)
	GetAllBlueprints(ctx context.Context, userId string) ([]*blueprint.Blueprint, error)
	CreateBlueprint(ctx context.Context, b *blueprint.Blueprint, components []*blueprint.BlueprintComponent) error
	UpdateBlueprint(ctx context.Context, b *blueprint.Blueprint, components []*blueprint.BlueprintComponent) error
	DeleteBlueprint(ctx context.Context, id int) error
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

//go:embed sql/blueprint/updateBlueprint.sql
var updateBlueprintQuery string

//go:embed sql/blueprint/updateBlueprintComponent.sql
var updateBlueprintComponentQuery string

//go:embed sql/blueprint/deleteBlueprintComponent.sql
var deleteBlueprintComponentQuery string

//go:embed sql/blueprint/deleteBlueprintById.sql
var deleteBlueprintByIdQuery string

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
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				slog.Error("Failed to rollback transaction after panic", "error", rollbackErr)
			}
			panic(p)
		} else if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				slog.Error("Failed to rollback transaction after panic", "error", rollbackErr)
			}
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

func (r *blueprintRepository) UpdateBlueprint(ctx context.Context, b *blueprint.Blueprint, components []*blueprint.BlueprintComponent) (err error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				slog.Error("Failed to rollback transaction after panic", "error", rollbackErr)
			}
			panic(p)
		} else if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				slog.Error("Failed to rollback transaction after panic", "error", rollbackErr)
			}
		}
	}()

	// Update blueprint using static SQL
	updateBlueprintStmt, err := tx.PrepareNamedContext(ctx, updateBlueprintQuery)
	if err != nil {
		return err
	}
	defer updateBlueprintStmt.Close()

	var updatedAt time.Time
	rows, err := updateBlueprintStmt.QueryContext(ctx, b)
	if err != nil {
		return err
	}
	if rows.Next() {
		if err = rows.Scan(&updatedAt); err != nil {
			rows.Close()
			return err
		}
	}
	rows.Close()
	b.UpdatedAt = &updatedAt

	existingComponents, err := r.GetComponentsByBlueprintID(ctx, *b.ID)
	if err != nil {
		return err
	}
	existingComponentMap := make(map[int]*blueprint.BlueprintComponent)
	for _, comp := range existingComponents {
		if comp.ID != nil {
			existingComponentMap[*comp.ID] = comp
		}
	}
	newComponentMap := make(map[int]*blueprint.BlueprintComponent)
	for _, comp := range components {
		if comp.ID != nil {
			newComponentMap[*comp.ID] = comp
		}
	}

	for id := range existingComponentMap {
		if _, exists := newComponentMap[id]; !exists {
			_, err = tx.ExecContext(ctx, deleteBlueprintComponentQuery, id)
			if err != nil {
				return err
			}
		}
	}

	updateComponentStmt, err := tx.PrepareNamedContext(ctx, updateBlueprintComponentQuery)
	if err != nil {
		return err
	}
	defer updateComponentStmt.Close()

	createComponentStmt, err := tx.PrepareNamedContext(ctx, createBlueprintComponentQuery)
	if err != nil {
		return err
	}
	defer createComponentStmt.Close()

	for _, comp := range components {
		comp.BlueprintID = b.ID
		if comp.ID != nil && existingComponentMap[*comp.ID] != nil {
			var compUpdatedAt time.Time
			compRows, err := updateComponentStmt.QueryContext(ctx, comp)
			if err != nil {
				return err
			}
			if compRows.Next() {
				if err = compRows.Scan(&compUpdatedAt); err != nil {
					compRows.Close()
					return err
				}
			}
			compRows.Close()
			comp.UpdatedAt = &compUpdatedAt
		} else {
			compRows, err := createComponentStmt.QueryContext(ctx, comp)
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
	}

	return tx.Commit()
}

func (r *blueprintRepository) DeleteBlueprint(ctx context.Context, id int) error {
	result, err := r.db.ExecContext(ctx, deleteBlueprintByIdQuery, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
