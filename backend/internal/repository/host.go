package repository

import (
	"clouding/backend/internal/model/host"
	"context"
	"database/sql"
	_ "embed" // Required for embedding
	"errors"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/lib/pq"

	"github.com/jmoiron/sqlx"
)

// HostRepository defines data access for hosts
type HostRepository interface {
	GetHosts(ctx context.Context, id []int) ([]*host.Host, error)
	GetAllHosts(ctx context.Context, userId string) ([]*host.Host, error)
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

func (r *hostRepository) GetHosts(ctx context.Context, ids []int) ([]*host.Host, error) {
	var hosts []*host.Host

	err := r.db.SelectContext(ctx, &hosts, getHostByIdQuery, pq.Array(ids))

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return hosts, nil
}

func (r *hostRepository) GetAllHosts(ctx context.Context, userId string) ([]*host.Host, error) {
	var hosts []*host.Host

	err := r.db.SelectContext(ctx, &hosts, getHostsByUserId, userId)

	if err != nil {
		return nil, err
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

	return nil
}
func (r *hostRepository) UpdateHost(ctx context.Context, h *host.Host) error {

	builder := sq.
		Update("hosts").
		Set("updated_at", "NOW()").
		Where(sq.Eq{"id": h.ID}).
		Suffix("RETURNING updated_at").
		PlaceholderFormat(sq.Dollar)

	if h.Name != nil {
		builder = builder.Set("name", *h.Name)
	}
	if h.IP != nil {
		builder = builder.Set("ip", *h.IP)
	}
	if h.Os != nil {
		builder = builder.Set("os", *h.Os)
	}
	if h.CredentialID != nil {
		builder = builder.Set("credential_id", *h.CredentialID)
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
	result, err := r.db.ExecContext(ctx, deleteHostQuery, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
