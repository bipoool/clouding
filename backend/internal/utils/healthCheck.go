package utils

import (
	"fmt"
	"net"
	"time"
)


func PerformHealthCheck(ip string, port string) (string, string){
	if port == "" {
		port = "80" 
	}

	address := fmt.Sprintf("%s:%s", ip, port)
	timeout := 2 * time.Second

	conn, err := net.DialTimeout("tcp", address, timeout)
	if err != nil {
		return "unhealthy", fmt.Sprintf("Connection failed: %v", err)
	}
	defer conn.Close()

	return "healthy", fmt.Sprintf("Successfully connected to %s", address)
}


