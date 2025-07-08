package v1

import (
	v1 "clouding/backend/internal/controller/v1"
	"clouding/backend/internal/repository"
	"clouding/backend/internal/service"
	secretmanager "clouding/backend/internal/utils/secretManager"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterCredentialRoutes(rg *gin.RouterGroup, db *sqlx.DB) {
	secretsManager := secretmanager.NewSecretManager()
	repo := repository.NewCredentialRepository(db, secretsManager)
	service := service.NewCredentialService(repo)
	controller := v1.NewCredentialController(service)

	rg.GET("/credentials", controller.GetAllByUserId)
	rg.GET("/credentials/:id", controller.GetById)
	rg.POST("/credentials", controller.Create)
	rg.PUT("/credentials/:id", controller.Update)
	rg.DELETE("/credentials/:id", controller.Delete)
}
