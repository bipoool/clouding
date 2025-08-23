package errors

import (
	"errors"
	"fmt"
)

var ErrNoRows = errors.New("no rows in result set")

func ErrLokiQuery(status int, body string) error {
	const max = 512
	safe := body
	if len(safe) > max {
		safe = safe[:max] + "...(truncated)"
	}
	return fmt.Errorf("error fetching logs from loki: status=%d body=%s", status, safe)
}
