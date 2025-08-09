package database

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

func NewSqlDatabase(host string, port string, user string, password string, dbName string) (db *sqlx.DB) {
	connString := fmt.Sprintf("host=%s port=%s user=%s "+"password=%s dbname=%s sslmode=disable", host, port, user, password, dbName)

	// Parse pgx config
	pgxConfig, err := pgx.ParseConfig(connString)
	if err != nil {
		panic(err)
	}
	// Disable statement cache & prefer simple protocol
	// @ TODO check the performance impact due to this
	pgxConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	db = sqlx.NewDb(stdlib.OpenDB(*pgxConfig), "pgx")
	db.SetMaxOpenConns(30)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	return db
}
