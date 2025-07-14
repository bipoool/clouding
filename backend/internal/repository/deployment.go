package repository

import (
	"clouding/backend/internal/model/deployment"
	"context"
	"database/sql"
	_ "embed"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// DeploymentRepository defines data access for deployments
type DeploymentRepository interface {
	Create(ctx context.Context, d *deployment.Deployment) error
	UpdateStatus(ctx context.Context, id string, status deployment.DeploymentStatus) error
	GetByID(ctx context.Context, id string) (*deployment.Deployment, error)
	GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error)
	GetHostIDsByGroupID(ctx context.Context, groupId int) ([]int, error)
}

// Embedded SQL queries

//go:embed sql/deployment/createDeployment.sql
var createDeploymentQuery string

//go:embed sql/deployment/updateDeploymentStatus.sql
var updateStatusQuery string

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
		d.Status = "pending"
	}

	rows, err := r.db.NamedQueryContext(ctx, createDeploymentQuery, d)
	if err != nil {
		return err
	}
	defer rows.Close()

	if rows.Next() {
		if err := rows.StructScan(d); err != nil {
			return err
		}
	} else {
		// No rows → means conflict occurred and insert was skipped
	}

	return nil
}

func (r *deploymentRepository) UpdateStatus(ctx context.Context, id string, status deployment.DeploymentStatus) error {
	_, err := r.db.ExecContext(ctx, updateStatusQuery, status, id)
	return err
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

func (r *deploymentRepository) GetHostIDsByGroupID(ctx context.Context, groupID int) ([]int, error) {
	query := `SELECT host_ids FROM host_group WHERE id = $1`

	var hostIDs64 []int64
	err := r.db.QueryRowContext(ctx, query, groupID).Scan(pq.Array(&hostIDs64))
	if err != nil {
		return nil, err
	}

	hostIDs := make([]int, len(hostIDs64))
	for i, id := range hostIDs64 {
		hostIDs[i] = int(id)
	}

	return hostIDs, nil
}
