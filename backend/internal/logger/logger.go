package logger

import (
	"clouding/backend/internal/config"
	"log/slog"
	"os"
	"time"

	"github.com/rs/zerolog"
)

func getSLogLevel() slog.Level {
	switch config.Config.Server.LogLevel {
	case "debug":
		return slog.LevelDebug
	case "info":
		return slog.LevelInfo
	default:
		return slog.LevelInfo
	}
}

func New() *slog.Logger {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	zerologLogger := zerolog.New(zerolog.ConsoleWriter{
		Out:        os.Stderr,
		NoColor:    false,
		TimeFormat: time.RFC3339,
	}).Level(toZerologLevel(getSLogLevel())).With().Timestamp().Logger()
	return slog.New(newZerologHandler(&zerologLogger))
}
