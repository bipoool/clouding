package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/queue"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterDeploymentRoutes(rg *gin.RouterGroup, db *sqlx.DB, publisher *queue.Publisher) {
	deploymentRepository := repository.NewDeploymentRepository(db)
	deploymentService := service.NewDeploymentService(deploymentRepository, publisher)
	deploymentController := v1.NewDeploymentController(deploymentService)


rg.POST("/deployments/type/:type", deploymentController.CreateDeployment)
rg.PUT("/deployments/:id/status", deploymentController.UpdateStatus)
rg.GET("/deployments/:id", deploymentController.GetByID)
rg.GET("/deployments/type/:type", deploymentController.GetByUserAndType)

}