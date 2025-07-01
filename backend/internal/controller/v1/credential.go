package v1

import (
	"clouding/backend/internal/model/credential"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CredentialController struct {
	Service service.CredentialService
}

func NewCredentialController(s service.CredentialService) *CredentialController {
	return &CredentialController{Service: s}
}

func (c *CredentialController) GetAllByUserId(ctx *gin.Context) {
	userIdStr := ctx.Query("userId")
	userId, err := strconv.Atoi(userIdStr)
	if err != nil {
		slog.Debug("UserId not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	creds, err := c.Service.GetAllByUserId(ctx.Request.Context(), userId)
	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(creds))
}

func (c *CredentialController) GetById(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Debug("ID not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	cred, err := c.Service.GetById(ctx.Request.Context(), id)
	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(cred))
}

func (c *CredentialController) Create(ctx *gin.Context) {
	req := credential.Credential{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	if err := c.Service.Create(ctx.Request.Context(), &req); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := &credential.CreateCredentialResponse{
		ID: req.ID,
	}

	ctx.JSON(http.StatusCreated, utils.NewSuccessResponse(resp))
}

func (c *CredentialController) Update(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	var cred credential.Credential
	if err := ctx.ShouldBindJSON(&cred); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	cred.ID = &id

	if err := c.Service.Update(ctx.Request.Context(), &cred); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := &credential.UpdateCredentialResponse{
		ID:        &id,
		UpdatedAt: cred.UpdatedAt,
	}

	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(resp))
}

func (c *CredentialController) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	if err := c.Service.Delete(ctx.Request.Context(), id); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	resp := &credential.DeleteCredentialResponse{
		ID:        &id,
		IsDeleted: true,
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(resp))
}
