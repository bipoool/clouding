package v1

import (
	"clouding/backend/internal/model/host"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type HostController struct {
	Service service.HostService
}

func NewHostController(s service.HostService) *HostController {
	return &HostController{Service: s}
}

func (c *HostController) GetHost(ctx *gin.Context) {

	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		slog.Debug("HostId not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	host, err := c.Service.GetHost(ctx.Request.Context(), id)

	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(host))
}

func (c *HostController) GetAllHosts(ctx *gin.Context) {
	userIdStr := ctx.Query("userId")
	userId, err := strconv.Atoi(userIdStr)

	if err != nil {
		slog.Debug("UserId not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	hosts, err := c.Service.GetAllHostsByUserId(ctx.Request.Context(), userId)

	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(hosts))
}

func (c *HostController) CreateHost(ctx *gin.Context) {
	var hostObj host.Host
	if err := ctx.ShouldBindJSON(&hostObj); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	if err := c.Service.CreateHost(ctx.Request.Context(), &hostObj); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := &host.CreateHostResponse{
		ID: hostObj.ID,
	}

	ctx.JSON(http.StatusCreated, utils.NewSuccessResponse(resp))
}

func (c *HostController) UpdateHost(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	var hostObj host.Host
	if err := ctx.ShouldBindJSON(&hostObj); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	hostObj.ID = &id

	if err := c.Service.UpdateHost(ctx.Request.Context(), &hostObj); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := &host.UpdateHostResponse{
		ID:        hostObj.ID,
		UpdatedAt: hostObj.UpdatedAt,
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(resp))
}

func (c *HostController) DeleteHost(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	if err := c.Service.DeleteHost(ctx.Request.Context(), id); err != nil {
		ctx.JSON(http.StatusNotFound, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := &host.DeleteHostResponse{
		ID:        &id,
		IsDeleted: true,
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(resp))
}
