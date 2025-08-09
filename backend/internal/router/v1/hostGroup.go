package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterHostGroupRoutes(rg *gin.RouterGroup, db *sqlx.DB) {
	hostGroupRepository := repository.NewHostGroupRepository(db)
	hostGroupService := service.NewHostGroupService(hostGroupRepository)
	hostGroupController := v1.NewHostGroupController(hostGroupService)

	group := rg.Group("/hostGroups")
	{
		group.GET("", hostGroupController.GetAllHostGroups)
		group.GET("/:id", hostGroupController.GetHostGroupByID)
		group.POST("", hostGroupController.CreateHostGroup)
		group.PUT("/:id", hostGroupController.UpdateHostGroup)
		group.POST("/:id/hosts", hostGroupController.AddHostsToGroup)
		group.DELETE("/:id/hosts/:hostId", hostGroupController.RemoveHostFromGroup)
		group.DELETE("/:id", hostGroupController.DeleteHostGroup)

	}

}
