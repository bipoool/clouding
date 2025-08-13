package repository

import (
	hostgroup "clouding/backend/internal/model/hostGroup"
	"context"
	"database/sql"
	_ "embed" // Required for embedding
	"time"

	sq "github.com/Masterminds/squirrel"

	"github.com/jmoiron/sqlx"
)

// HostRepository defines data access for hosts
type HostGroupRepository interface {
	GetAllHostGroups(ctx context.Context, userId string) ([]*hostgroup.HostGroup, error)
	GetHostGroupByID(ctx context.Context, id int) (*hostgroup.HostGroup, error)
	CreateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error
	UpdateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error
	AddHostsToGroup(ctx context.Context, groupID int, newHosts []int) error
	RemoveHostFromGroup(ctx context.Context, groupID int, hostID int) error
	DeleteHostGroup(ctx context.Context, id int) error
}

// SQL Queries (embed the .sql files)

//go:embed sql/hostGroup/getAllHostGroupByUser.sql
var getAllHostGroupsQuery string

//go:embed sql/hostGroup/getHostGroupById.sql
var getHostGroupByIDQuery string

//go:embed sql/hostGroup/createHostGroup.sql
var createHostGroupQuery string

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

func (r *hostGroupRepository) GetAllHostGroups(ctx context.Context, userId string) ([]*hostgroup.HostGroup, error) {
	var hostGroups []*hostgroup.HostGroup
	if err := r.db.SelectContext(ctx, &hostGroups, getAllHostGroupsQuery, userId); err != nil {
		return nil, err
	}
	return hostGroups, nil
}

func (r *hostGroupRepository) GetHostGroupByID(ctx context.Context, id int) (*hostgroup.HostGroup, error) {
	var hostGroup hostgroup.HostGroup
	if err := r.db.GetContext(ctx, &hostGroup, getHostGroupByIDQuery, id); err != nil {
		return nil, err
	}
	return &hostGroup, nil
}

func (r *hostGroupRepository) CreateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error {
	rows, err := r.db.NamedQueryContext(ctx, createHostGroupQuery, h)
	if err != nil {
		return err
	}
	defer rows.Close()
	var id int
	var createdAt time.Time
	var updatedAt time.Time
	if rows.Next() {
		err = rows.Scan(&id, &createdAt, &updatedAt)
		if err != nil {
			return err
		}
		h.ID = &id
		h.CreatedAt = &createdAt
		h.UpdatedAt = &updatedAt
	}
	return nil
}

func (r *hostGroupRepository) UpdateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error {
	builder := sq.Update("host_groups").
		Set("updated_at", sq.Expr("NOW()")).
		Where(sq.Eq{"id": *h.ID}).
		Suffix("RETURNING updated_at").
		PlaceholderFormat(sq.Dollar)

	if h.Name != nil {
		builder = builder.Set("name", *h.Name)
	}
	if h.Description != nil {
		builder = builder.Set("description", *h.Description)
	}

	updateHostGroupQuery, args, err := builder.ToSql()
	if err != nil {
		return err
	}

	var updatedAt time.Time
	err = r.db.GetContext(ctx, &updatedAt, updateHostGroupQuery, args...)
	if err != nil {
		return err
	}
	h.UpdatedAt = &updatedAt
	return err
}

func (r *hostGroupRepository) AddHostsToGroup(ctx context.Context, groupID int, newHosts []int) error {

	builder := sq.Insert("host_groups_to_host_mapping").
		Columns("host_group_id", "host_id").
		PlaceholderFormat(sq.Dollar)

	for _, hostId := range newHosts {
		builder = builder.Values(groupID, hostId)
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, query, args...)

	return err
}

func (r *hostGroupRepository) RemoveHostFromGroup(ctx context.Context, groupID int, hostID int) error {
	_, err := r.db.ExecContext(ctx, removeHostFromGroupQuery, hostID, groupID)
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
