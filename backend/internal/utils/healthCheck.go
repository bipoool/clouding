package utils

import (
	"context"
	"fmt"
	"net"
	"time"
)

func PerformHealthCheck(ip string, port string, ctx context.Context) (bool, string) {
	if port == "" {
		port = "22"
	}

	address := net.JoinHostPort(ip, port)

	d := net.Dialer{Timeout: 2 * time.Second}
	conn, err := d.DialContext(ctx, "tcp", address)

	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer conn.Close()

	return true, fmt.Sprintf("Successfully connected to %s", address)
}
