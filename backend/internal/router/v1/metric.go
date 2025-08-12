package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterMetricRoutes(rg *gin.RouterGroup, db *sqlx.DB) {
	metricRepository := repository.NewMetricRepository(db)
	metricService := service.NewMetricService(metricRepository)
	metricController := v1.NewMetricController(metricService)

	rg.GET("/metrics/overview", metricController.GetOverview)
}
