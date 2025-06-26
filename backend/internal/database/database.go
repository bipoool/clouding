package database

import (
	"fmt"
	"log/slog"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func NewSqlDatabase(host string, port string, user string, password string, dbName string) (db *sqlx.DB) {
	connString := fmt.Sprintf("host=%s port=%s user=%s "+"password=%s dbname=%s sslmode=disable", host, port, user, password, dbName)
	db, err := sqlx.Connect("postgres", connString)

	if err != nil {
		slog.Error("Failed to initialize SQL DB")
		panic(err)
	}

	db.SetMaxOpenConns(30)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	return db
}
