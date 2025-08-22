package errors

import (
	"errors"
	"fmt"
)

var ErrNoRows = errors.New("no rows in result set")

func ErrLokiQuery(status int, body string) error {
	return fmt.Errorf("error in fetching logs from loki: status=%d body=%s", status, body)
}
