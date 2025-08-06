package repository

import (
	"clouding/backend/internal/model/deployment"
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"fmt"

	"github.com/Masterminds/squirrel"
	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
)

// DeploymentRepository defines data access for deployments
type DeploymentRepository interface {
	Create(ctx context.Context, d *deployment.Deployment) error
	UpdateStatus(ctx context.Context, id string, updateDeploymentStatus *deployment.UpdateDeploymentStatus) error
	GetByID(ctx context.Context, id string) (*deployment.Deployment, error)
	GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error)
}

// Embedded SQL queries

//go:embed sql/deployment/getDeploymentById.sql
var getDeploymentByIdQuery string

//go:embed sql/deployment/getDeploymentByUser.sql
var getByUserAndTypeQuery string

type deploymentRepository struct {
	db *sqlx.DB
}

func NewDeploymentRepository(db *sqlx.DB) DeploymentRepository {
	return &deploymentRepository{
		db: db,
	}
}

func (r *deploymentRepository) Create(ctx context.Context, d *deployment.Deployment) error {

	if d.Status == "" {
		d.Status = deployment.StatusPending
	}

	builder := sq.Insert("deployments").
		Columns("id", "user_id", "host_id", "host_group_id", "blueprint_id", "type", "status").
		PlaceholderFormat(sq.Dollar)

	for _, hostId := range d.HostIDs {
		builder = builder.Values(
			d.ID, d.UserID, hostId, d.HostGroupID, d.BlueprintID, d.Type, d.Status,
		)
	}

	query, args, err := builder.ToSql()

	if err != nil {
		return fmt.Errorf("failed to build query: %w", err)
	}

	// @ TODO handle unique key voilation
	_, err = r.db.Exec(query, args...)
	return err
}

func (r *deploymentRepository) UpdateStatus(ctx context.Context, id string, updateDeploymentStatus *deployment.UpdateDeploymentStatus) error {
	builder := squirrel.
		Update("deployments").
		Set("status", updateDeploymentStatus.Status).
		Set("updated_at", squirrel.Expr("NOW()")).
		Where(squirrel.Eq{"id": id}).
		Suffix("RETURNING updated_at").
		PlaceholderFormat(squirrel.Dollar)

	query, args, err := builder.ToSql()
	if err != nil {
		return err
	}

	err = r.db.QueryRow(query, args...).Scan(&updateDeploymentStatus.UpdatedAt)
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
