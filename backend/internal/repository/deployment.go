package repository

import (
	"clouding/backend/internal/model/deployment"
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	"log/slog"

	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// DeploymentRepository defines data access for deployments
type DeploymentRepository interface {
	Create(ctx context.Context, d *deployment.Deployment) error
	UpdateStatus(ctx context.Context, id string, updateDeploymentStatusPayload *deployment.UpdateDeploymentStatusPayload) error
	GetByID(ctx context.Context, id string) (*deployment.Deployment, error)
	GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error)
	GetDeploymentHostMappingByIds(ctx context.Context, ids []string) ([]*deployment.DeploymentHostMapping, error)
}

// Embedded SQL queries

//go:embed sql/deployment/getDeploymentById.sql
var getDeploymentByIdQuery string

//go:embed sql/deployment/getDeploymentByUser.sql
var getByUserAndTypeQuery string

//go:embed sql/deployment/getDeploymentHostMapping.sql
var getDeploymentHostMapping string

type deploymentRepository struct {
	db *sqlx.DB
}

func NewDeploymentRepository(db *sqlx.DB) DeploymentRepository {
	return &deploymentRepository{
		db: db,
	}
}

func (r *deploymentRepository) Create(ctx context.Context, d *deployment.Deployment) error {
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

	deploymentBuilder := sq.Insert("deployments").
		Columns("id", "user_id", "blueprint_id", "type", "status").
		PlaceholderFormat(sq.Dollar)
	deploymentBuilder = deploymentBuilder.Values(
		d.ID, d.UserID, d.BlueprintID, d.Type, deployment.StatusPending,
	)

	deployementQuery, deploymentArgs, err := deploymentBuilder.ToSql()

	if err != nil {
		return fmt.Errorf("failed to build deployment query: %w", err)
	}

	// @ TODO - handle unique voilation
	_, err = tx.Exec(deployementQuery, deploymentArgs...)
	if err != nil {
		return err
	}

	deploymentHostMappingBuilder := sq.Insert("deployment_host_mappings").
		Columns("deployment_id", "host_id", "status").
		PlaceholderFormat(sq.Dollar)

	for _, hostId := range d.HostIDs {
		deploymentHostMappingBuilder = deploymentHostMappingBuilder.Values(
			d.ID, hostId, deployment.StatusPending,
		)
	}

	deployementHostMappingQuery, deploymentHostMappingArgs, err := deploymentHostMappingBuilder.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build deployement host mapping query: %w", err)
	}

	_, err = tx.Exec(deployementHostMappingQuery, deploymentHostMappingArgs...)
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		slog.Error(
			"DB commit failed for deployemt",
			"ID", d.ID,
			"userId", d.UserID,
			"blueprintId", d.BlueprintID,
			"type", d.Type,
			"status", d.Status,
		)
		return err
	}

	return err
}

func (r *deploymentRepository) UpdateStatus(ctx context.Context, id string, updateDeploymentStatusPayload *deployment.UpdateDeploymentStatusPayload) error {
	builder := sq.
		Update("deployments").
		Set("status", updateDeploymentStatusPayload.Status).
		Set("updated_at", sq.Expr("NOW()")).
		Where(sq.Eq{"id": id}).
		Suffix("RETURNING updated_at").
		PlaceholderFormat(sq.Dollar)

	query, args, err := builder.ToSql()
	if err != nil {
		return err
	}

	err = r.db.QueryRowContext(ctx, query, args...).Scan(&updateDeploymentStatusPayload.UpdatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (r *deploymentRepository) GetByID(ctx context.Context, id string) (*deployment.Deployment, error) {
	var d deployment.Deployment

	err := r.db.GetContext(ctx, &d, getDeploymentByIdQuery, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // not found
		}
		return nil, err
	}
	return &d, nil
}

func (r *deploymentRepository) GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error) {
	var deployments []*deployment.Deployment

	err := r.db.SelectContext(ctx, &deployments, getByUserAndTypeQuery, userId, dType)
	if err != nil {
		return nil, err
	}
	return deployments, nil
}

func (r *deploymentRepository) GetDeploymentHostMappingByIds(ctx context.Context, ids []string) ([]*deployment.DeploymentHostMapping, error) {
	var deploymentHostMapping []*deployment.DeploymentHostMapping
	if err := r.db.SelectContext(ctx, &deploymentHostMapping, getDeploymentHostMapping, pq.Array(ids)); err != nil {
		return nil, err
	}
	return deploymentHostMapping, nil
}
