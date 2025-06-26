package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterHostRoutes(rg *gin.RouterGroup, db *sqlx.DB) {
	hostRepository := repository.NewHostRepository(db)
	hostService := service.NewHostService(hostRepository)
	hostController := v1.NewHostController(hostService)

	rg.GET("/hosts", hostController.GetAllHosts)
	rg.GET("/hosts/:id", hostController.GetHost)
	rg.POST("/hosts", hostController.CreateHost)
	rg.PUT("/hosts/:id", hostController.UpdateHost)
	rg.DELETE("/hosts/:id", hostController.DeleteHost)
}
