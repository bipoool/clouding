package server

import (
	"clouding/backend/internal/config"
	"clouding/backend/internal/database"
	"clouding/backend/internal/logger"
	"clouding/backend/internal/middleware"
	"clouding/backend/internal/router"
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Server struct {
	ctx        context.Context
	wg         *sync.WaitGroup
	ginEngine  *gin.Engine
	httpServer *http.Server
	db         *sqlx.DB
}

func Start() {
	// Load configuration
	config.LoadCloudingConfig(".")

	// Initialize logger
	log := logger.New()
	slog.SetDefault(log)

	// Initiate database
	db := database.NewSqlDatabase(
		config.Config.Sql.Host,
		config.Config.Sql.Port,
		config.Config.Sql.User,
		config.Config.Sql.Password,
		config.Config.Sql.Db,
	)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	wg := &sync.WaitGroup{}

	// Set up Gin
	ginEngine := gin.New()
	ginEngine.Use(gin.Recovery())
	ginEngine.Use(middleware.SlogMiddleware())
	ginEngine.Use(middleware.JWTAuthMiddleware())
	v1RouteGroup := ginEngine.Group("/api/v1")

	//Register routes here
	router.SetupRouter(v1RouteGroup, db)

	httpServer := &http.Server{
		Addr:    ":" + config.Config.Server.Port,
		Handler: ginEngine,
	}

	server := &Server{
		ctx:        ctx,
		wg:         wg,
		ginEngine:  ginEngine,
		httpServer: httpServer,
		db:         db,
	}

	// Print banner
	server.printBanner()

	go server.runServer()

	// Shutdown on SIGTERM and SIGINT
	<-ctx.Done()
	server.shutdown()
}

func (s *Server) runServer() {
	// Start server
	if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("Listen", "Error", err.Error())
	}
}

func (s *Server) shutdown() {
	slog.Info("Shutting down the server")
	// Give server 10s to gracefully shutdown
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := s.httpServer.Shutdown(shutdownCtx); err != nil {
		slog.Error("server forced to shutdown", "Error", err)
	}
	s.db.Close()
	s.wg.Wait()
}

func (s *Server) printBanner() {
	fmt.Println(`
 ██████╗██╗      ██████╗ ██╗   ██╗██████╗ ██╗███╗   ██╗ ██████╗ 
██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗██║████╗  ██║██╔════╝ 
██║     ██║     ██║   ██║██║   ██║██║  ██║██║██╔██╗ ██║██║  ███╗
██║     ██║     ██║   ██║██║   ██║██║  ██║██║██║╚██╗██║██║   ██║
╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝██║██║ ╚████║╚██████╔╝
 ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝`)
}
