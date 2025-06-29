package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterUserRoutes(rg *gin.RouterGroup, db *sqlx.DB) {
	userRepository := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepository)
	userController := v1.NewUserController(userService)

	rg.GET("/users/:id", userController.GetUser)
	rg.POST("/users", userController.CreateUser)
	rg.PUT("/users/:id", userController.UpdateUser)
	rg.DELETE("/users/:id", userController.DeleteUser)
}
