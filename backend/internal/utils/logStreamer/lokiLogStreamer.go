package logStreamer

import (
	"clouding/backend/internal/config"
	"clouding/backend/internal/errors"
	joblogs "clouding/backend/internal/model/jobLogs"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

type LokiLogStreamer struct {
	URL string
}

func NewLokiLogStreamer() *LokiLogStreamer {
	baseURL, err := url.Parse(config.Config.Loki.URL)
	if err != nil {
		panic(err)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(baseURL.String() + "/ready")
	if err != nil {
		panic(fmt.Sprintf("cannot reach loki: %v", err))
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		panic(fmt.Sprintf("loki not ready: status %d", resp.StatusCode))
	}

	return &LokiLogStreamer{URL: baseURL.String()}
}

func (l *LokiLogStreamer) StreamLogs(ctx context.Context, jobId string) (<-chan *joblogs.Log, error) {
	start := time.Unix(0, 0)
	end := time.Now().Add(time.Hour * 1).UTC()
	logsChan := make(chan *joblogs.Log)
	ticker := time.NewTicker(2 * time.Second)

	go func() {
		defer close(logsChan)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				logs, latestTs, err := l.GetLogs(ctx, jobId, start, end)
				if err != nil {
					logsChan <- &joblogs.Log{Error: err.Error()}
					return
				}
				start = time.Unix(0, latestTs).Add(1 * time.Nanosecond)
				for _, log := range logs {
					logsChan <- log
					// End the stream when the job is finished
					if log.Event == "playbook_on_stats" {
						return
					}
				}
			}
		}
	}()

	return logsChan, nil
}

func (l *LokiLogStreamer) GetLogs(ctx context.Context, jobId string, start, end time.Time) ([]*joblogs.Log, int64, error) {
	u, _ := url.Parse(l.URL)
	u.Path = "/loki/api/v1/query_range"
	q := u.Query()
	q.Set("query", fmt.Sprintf(`{jobId="%s"}`, jobId))

	// Loki accepts RFC3339Nano or unix ns; we’ll send RFC3339Nano
	q.Set("start", start.UTC().Format(time.RFC3339Nano))
	q.Set("end", end.UTC().Format(time.RFC3339Nano))
	q.Set("direction", "forward") // "forward" -> oldest first
	u.RawQuery = q.Encode()

	req, err := http.NewRequest(http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, 0, err
	}

	client := http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req.WithContext(ctx))
	if err != nil {
		return nil, 0, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, 0, errors.ErrLokiQuery(resp.StatusCode, string(b))
	}

	var logs joblogs.JobLogs
	if err := json.NewDecoder(resp.Body).Decode(&logs); err != nil {
		return nil, 0, err
	}

	var logsResult []*joblogs.Log
	var latestTs int64 = 0

	// Parse the logs
	for _, stream := range logs.Data.Result {
		for _, val := range stream.Values {
			if len(val) >= 2 {
				tsInt, err := strconv.ParseInt(val[0].(string), 10, 64)
				if err != nil {
					// TODO: log error
					continue
				}
				if tsInt > latestTs {
					latestTs = tsInt
				}

				var log joblogs.Log
				if err := json.Unmarshal([]byte(val[1].(string)), &log); err == nil {
					if log.Res.Changed {
						logsResult = append(logsResult, &log)
					} else if log.Event == "runner_on_failed" {
						logsResult = append(logsResult, &log)
					} else if log.Event == "playbook_on_stats" {
						logsResult = append(logsResult, &log)
					}
				}
			}
		}
	}

	// Return the logs and the latest timestamp
	return logsResult, latestTs, nil
}
