package router

import (
	"clouding/backend/internal/queue"
	v1 "clouding/backend/internal/router/v1"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func SetupRouter(ginRouteGroup *gin.RouterGroup, db *sqlx.DB, publisher *queue.Publisher) {
	v1.RegisterHostRoutes(ginRouteGroup, db)
	v1.RegisterHostGroupRoutes(ginRouteGroup, db)
	v1.RegisterUserRoutes(ginRouteGroup, db)
	v1.RegisterCredentialRoutes(ginRouteGroup, db)
	v1.RegisterComponentRoutes(ginRouteGroup, db)
	v1.RegisterBlueprintRoutes(ginRouteGroup, db)
	v1.RegisterDeploymentRoutes(ginRouteGroup, db, publisher)
}
