package repository

import (
	hostgroup "clouding/backend/internal/model/hostGroup"
	"context"
	"database/sql"
	_ "embed" // Required for embedding
	"time"

	sq "github.com/Masterminds/squirrel"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// HostRepository defines data access for hosts
type HostGroupRepository interface {
	GetHostGroupByID(ctx context.Context, id int) (*hostgroup.HostGroup, error)
	GetAllHostGroups(ctx context.Context, userId int) ([]*hostgroup.HostGroup, error)
	CreateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error
	UpdateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error
	AddHostsToGroup(ctx context.Context, groupID int, newHosts []int) error
	RemoveHostFromGroup(ctx context.Context, groupID int, hostID int) error
	DeleteHostGroup(ctx context.Context, id int) error
}

// SQL Queries (embed the .sql files)

var getHostGroupByIDQuery string

var getAllHostGroupsQuery string

var createHostGroupQuery string

var updateHostGroupQuery string

var addHostsToGroupQuery string

var removeHostFromGroupQuery string

var deleteHostGroupQuery string

type hostGroupRepository struct {
	db *sqlx.DB
}

func NewHostGroupRepository(db *sqlx.DB) HostGroupRepository {
	return &hostGroupRepository{
		db: db,
	}
}

func (r *hostGroupRepository) GetHostGroupByID(ctx context.Context, id int) (*hostgroup.HostGroup, error) {
	var hostGroup hostgroup.HostGroup
	if err := r.db.GetContext(ctx, &hostGroup, getHostGroupByIDQuery, id); err != nil {
		return nil, err
	}
	return &hostGroup, nil
}

func (r *hostGroupRepository) GetAllHostGroups(ctx context.Context, userId int) ([]*hostgroup.HostGroup, error) {
	var hostGroups []*hostgroup.HostGroup
	if err := r.db.SelectContext(ctx, &hostGroups, getAllHostGroupsQuery, userId); err != nil {
		return nil, err
	}
	return hostGroups, nil
}

func (r *hostGroupRepository) CreateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error {
	rows, err := r.db.NamedQueryContext(ctx, createHostGroupQuery, h)
	if err != nil {
		return err
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&h.ID)
	}
	return sql.ErrNoRows
}

func (r *hostGroupRepository) UpdateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error {
	// Use squirrel for dynamic update
	builder := sq.
		Update("host_group").
		Set("updated_at", "NOW()").
		Where(sq.Eq{"id": h.ID}).
		PlaceholderFormat(sq.Dollar)

	if h.Name != nil {
		builder = builder.Set("name", *h.Name)
	}
	if h.HostIDs != nil {
		builder = builder.Set("host_ids", h.HostIDs)
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return err
	}

	var updatedAt time.Time
	if err := r.db.GetContext(ctx, &updatedAt, query, args...); err != nil {
		return err
	}
	h.UpdatedAt = &updatedAt
	return nil
}

func (r *hostGroupRepository) AddHostsToGroup(ctx context.Context, groupID int, newHosts []int) error {
	_, err := r.db.ExecContext(ctx, addHostsToGroupQuery, groupID, pq.Array(newHosts))
	return err
}

func (r *hostGroupRepository) RemoveHostFromGroup(ctx context.Context, groupID int, hostID int) error {
	_, err := r.db.ExecContext(ctx, removeHostFromGroupQuery, groupID, hostID)
	return err
}

func (r *hostGroupRepository) DeleteHostGroup(ctx context.Context, id int) error {
	result, err := r.db.ExecContext(ctx, deleteHostGroupQuery, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
