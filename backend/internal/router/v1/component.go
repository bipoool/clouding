package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterComponentRoutes(rg *gin.RouterGroup, db *sqlx.DB) {
	componentRepository := repository.NewComponentRepository(db)
	componentService := service.NewComponentService(componentRepository)
	componentController := v1.NewComponentController(componentService)

	rg.GET("/components", componentController.GetAllComponents)
	rg.GET("/components/:id", componentController.GetComponentByIds)
}
