package router

import (
	v1 "clouding/backend/internal/router/v1"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func SetupRouter(ginRouteGroup *gin.RouterGroup, db *sqlx.DB) {
	v1.RegisterHostRoutes(ginRouteGroup, db)
	v1.RegisterUserRoutes(ginRouteGroup, db)
}
