package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/queue"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils/logStreamer"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterDeploymentRoutes(rg *gin.RouterGroup, db *sqlx.DB, publisher *queue.Publisher) {
	ls := logStreamer.NewLogStreamer()
	deploymentRepository := repository.NewDeploymentRepository(db)
	deploymentService := service.NewDeploymentService(deploymentRepository, publisher)
	deploymentController := v1.NewDeploymentController(deploymentService, ls)

	rg.POST("/deployments/type/:type", deploymentController.Create)
	rg.PUT("/deployments/:id/status", deploymentController.UpdateStatus)
	rg.GET("/deployments/:id", deploymentController.GetByID)
	rg.GET("/deployments/type/:type", deploymentController.GetByUserAndType)
	rg.GET("/deployments/:id/hosts", deploymentController.GetDeploymentHostMappingByIds)
	rg.GET("/deployments/progress/:jobId", deploymentController.StreamJobProgress)

}
