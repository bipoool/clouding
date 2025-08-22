package logStreamer

import (
	joblogs "clouding/backend/internal/model/jobLogs"
	"context"
	"time"
)

type LogStreamer interface {
	StreamLogs(ctx context.Context, jobId string) (<-chan *joblogs.Log, error)
	GetLogs(ctx context.Context, jobId string, start, end time.Time) ([]*joblogs.Log, int64, error)
}

func NewLogStreamer() LogStreamer {
	return NewLokiLogStreamer()
}
