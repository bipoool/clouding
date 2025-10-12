package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterBlueprintRoutes(rg *gin.RouterGroup, db *sqlx.DB) {
	blueprintRepo := repository.NewBlueprintRepository(db)
	componentRepo := repository.NewComponentRepository(db)
	deploymentRepo := repository.NewDeploymentRepository(db)
	service := service.NewBlueprintService(blueprintRepo, componentRepo, deploymentRepo)
	controller := v1.NewBlueprintController(service)

	rg.GET("/blueprints", controller.GetAll)
	rg.GET("/blueprints/:id", controller.GetById)
	rg.GET("/blueprints/:id/components", controller.GetComponents)
	rg.POST("/blueprints", controller.Create)
	rg.PUT("/blueprints/:id", controller.Update)
	rg.DELETE("/blueprints/:id", controller.Delete)
	rg.GET("/blueprints/:id/deployments", controller.GetDeployments)
	rg.PUT("/blueprints/:id/components", controller.UpdateBlueprintComponents)
}
