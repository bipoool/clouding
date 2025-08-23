package utils

import (
	"clouding/backend/internal/config"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

type LokiLog struct {
	Timestamp int64
	Message   string
}

func QueryLokiLogs(jobId string, since int64) ([]string, int64, error) {

	baseURL := config.Config.Loki.URL

	params := url.Values{}
	params.Add("query", fmt.Sprintf(`{jobId="%s"}`, jobId))
	params.Add("direction", "forward")

	reqURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	resp, err := http.Get(reqURL)
	if err != nil {
		return nil, since, fmt.Errorf("failed to query Loki: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, since, fmt.Errorf("Loki error: %s", string(body))
	}

	var result struct {
		Data struct {
			Result []struct {
				Values [][]interface{} `json:"values"`
			} `json:"result"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, since, fmt.Errorf("failed to decode Loki response: %w", err)
	}

	var logs []string
	var latestTs int64 = since

	for _, stream := range result.Data.Result {
		for _, val := range stream.Values {
			if len(val) >= 2 {

				tsStr, _ := val[0].(string)
				logStr, _ := val[1].(string)

				tsInt, err := strconv.ParseInt(tsStr, 10, 64)
				if err != nil {
					continue
				}
				if tsInt > latestTs {
					latestTs = tsInt
				}

				var logJSON map[string]interface{}
				if err := json.Unmarshal([]byte(logStr), &logJSON); err == nil {
					// Condition 1: res.changed == true

					if res, ok := logJSON["res"].(map[string]interface{}); ok {
						if changed, ok := res["changed"].(bool); ok && changed {
							logs = append(logs, logStr)
						}
					}

					// Condition 2: event == "runner_on_failed"
					if event, ok := logJSON["event"].(string); ok && event != "runner_on_ok" {
						logs = append(logs, logStr)
					}

				}
			}
		}
	}

	return logs, latestTs, nil
}

func CheckIfJobFinished(logs []string) bool {
	for _, log := range logs {
		if strings.Contains(log, "playbook_on_stats") {
			return true
		}
	}
	return false
}
