package repository

import (
	"clouding/backend/internal/model/host"
	"context"
	"database/sql"
	_ "embed" // Required for embedding
	"time"

	sq "github.com/Masterminds/squirrel"

	"github.com/jmoiron/sqlx"
)

// HostRepository defines data access for hosts
type HostRepository interface {
	GetHost(ctx context.Context, id int) (*host.Host, error)
	GetAllHosts(ctx context.Context, userId int) ([]*host.Host, error)
	CreateHost(ctx context.Context, h *host.Host) error
	UpdateHost(ctx context.Context, h *host.Host) error
	DeleteHost(ctx context.Context, id int) error
}

// Queries

//go:embed sql/host/getHostById.sql
var getHostByIdQuery string

//go:embed sql/host/getHostsByUserId.sql
var getHostsByUserId string

//go:embed sql/host/createHost.sql
var createHostQuery string

//go:embed sql/host/deleteHostById.sql
var deleteHostQuery string

type hostRepository struct {
	db *sqlx.DB
}

func NewHostRepository(db *sqlx.DB) HostRepository {
	return &hostRepository{
		db: db,
	}
}

func (r *hostRepository) GetHost(ctx context.Context, id int) (*host.Host, error) {
	var host host.Host

	err := r.db.GetContext(ctx, &host, getHostByIdQuery, id)

	if err != nil {
		return nil, err
	}

	return &host, nil
}

func (r *hostRepository) GetAllHosts(ctx context.Context, userId int) ([]*host.Host, error) {
	var hosts []*host.Host

	err := r.db.SelectContext(ctx, &hosts, getHostsByUserId, userId)

	if err != nil {
		return nil, err
	}
	if len(hosts) == 0 {
		return nil, sql.ErrNoRows
	}

	return hosts, nil
}

func (r *hostRepository) CreateHost(ctx context.Context, h *host.Host) error {
	rows, err := r.db.NamedQueryContext(ctx, createHostQuery, h)
	if err != nil {
		return err
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&h.ID)
	}

	return sql.ErrNoRows
}
func (r *hostRepository) UpdateHost(ctx context.Context, h *host.Host) error {

	builder := sq.
		Update("hosts").
		Set("updated_at", "NOW()").
		Where(sq.Eq{"id": h.ID}).
		Suffix("RETURNING updated_at").
		PlaceholderFormat(sq.Dollar)

	// Add only fields that are non-nil
	if h.UserID != nil {
		builder = builder.Set("user_id", *h.UserID)
	}
	if h.Name != nil {
		builder = builder.Set("name", *h.Name)
	}
	if h.IP != nil {
		builder = builder.Set("ip", *h.IP)
	}
	if h.Os != nil {
		builder = builder.Set("os", *h.Os)
	}
	if h.MetaData != nil {
		builder = builder.Set("meta_data", *h.MetaData)
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

func (r *hostRepository) DeleteHost(ctx context.Context, id int) error {
	if err := r.db.GetContext(ctx, &id, deleteHostQuery, id); err != nil {
		return err
	}
	return nil
}
