package repository

import (
	hostgroup "clouding/backend/internal/model/hostGroup"
	"context"
	"database/sql"
	_ "embed" // Required for embedding

	sq "github.com/Masterminds/squirrel"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// HostRepository defines data access for hosts
type HostGroupRepository interface {
	GetHostGroupByID(ctx context.Context, id int) (*hostgroup.HostGroup, error)
	GetAllHostGroups(ctx context.Context, userId int) ([]*hostgroup.HostGroup, error)
	CreateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error
	UpdateHostGroup(ctx context.Context, h *hostgroup.HostGroup, groupID int) error
	AddHostsToGroup(ctx context.Context, groupID int, newHosts []int) error
	RemoveHostFromGroup(ctx context.Context, groupID int, hostID int) error
	DeleteHostGroup(ctx context.Context, id int) error
}

// SQL Queries (embed the .sql files)

//go:embed sql/hostGroup/getHostGroupByID.sql
var getHostGroupByIDQuery string

//go:embed sql/hostGroup/getAllHostGroupByUser.sql
var getAllHostGroupsQuery string

//go:embed sql/hostGroup/createHostGroup.sql
var createHostGroupQuery string

//go:embed sql/hostGroup/updateHostGroup.sql
var updateHostGroupQuery string

//go:embed sql/hostGroup/addNewHostToGroup.sql
var addHostsToGroupQuery string

//go:embed sql/hostGroup/removeHostFromGroup.sql
var removeHostFromGroupQuery string

//go:embed sql/hostGroup/deleteHostGroupById.sql
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
	data := map[string]interface{}{
		"user_id":  h.UserID,
		"name":     h.Name,
		"host_ids": pq.Array(h.HostIDs),
	}
	rows, err := r.db.NamedQueryContext(ctx, createHostGroupQuery, data)
	if err != nil {
		return err
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&h.ID, &h.CreatedAt, &h.UpdatedAt)
	}
	return sql.ErrNoRows
}

func (r *hostGroupRepository) UpdateHostGroup(ctx context.Context, h *hostgroup.HostGroup, groupID int) error {
	builder := sq.Update("host_group").
		Set("updated_at", sq.Expr("NOW()")).
		Where(sq.Eq{"id": groupID}).
		PlaceholderFormat(sq.Dollar)

	if h.Name != nil {
		builder = builder.Set("name", *h.Name)
	}

	if len(h.HostIDs) > 0 {
		builder = builder.Set("host_ids", pq.Array(h.HostIDs))
	}

	updateHostGroupQuery, args, err := builder.ToSql()
	if err != nil {
		return err
	}

	_, err = r.db.ExecContext(ctx, updateHostGroupQuery, args...)
	return err
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
