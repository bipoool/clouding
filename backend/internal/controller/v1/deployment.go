package v1

import (
	"clouding/backend/internal/model/deployment"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type DeploymentController struct {
	Service service.DeploymentService
}

func NewDeploymentController(s service.DeploymentService) *DeploymentController {
	return &DeploymentController{Service: s}
}

func (c *DeploymentController) Create(ctx *gin.Context) {
	userId := ctx.GetString("userId")
	deploymentType := ctx.Param("type")

	var req deployment.Deployment
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	req.Type = deployment.DeploymentType(deploymentType)
	req.UserID = &userId

	if err := c.Service.Create(ctx.Request.Context(), &req); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, utils.NewSuccessResponse(nil))
}

func (c *DeploymentController) UpdateStatus(ctx *gin.Context) {
	id := ctx.Param("id")
	var body deployment.UpdateDeploymentStatusPayload
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	if err := c.Service.UpdateStatus(ctx.Request.Context(), id, &body); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(body))
}

func (c *DeploymentController) GetByID(ctx *gin.Context) {
	id := ctx.Param("id")

	result, err := c.Service.GetByID(ctx.Request.Context(), id)
	if err != nil {
		slog.Error("Error fetching deployment", "err", err)
		ctx.JSON(http.StatusNotFound, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(result))
}

func (c *DeploymentController) GetByUserAndType(ctx *gin.Context) {
	userId := ctx.GetString("userId")
	dType := ctx.Param("type")

	if dType == "" {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse("Type required"))
		return
	}

	results, err := c.Service.GetByUserAndType(ctx.Request.Context(), userId, dType)
	if err != nil {
		slog.Error("Error fetching deployments", "err", err)
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(results))
}

func (c *DeploymentController) GetDeploymentHostMappingByIds(ctx *gin.Context) {
	idsStr := ctx.Param("ids")
	idsStrArr := strings.Split(idsStr, ",")
	var ids []int

	// @ TODO fetch unique values here
	for _, idStr := range idsStrArr {
		id, err := strconv.Atoi(idStr)
		if err != nil {
			slog.Debug("ComponentId not correct", "ERR", err)
			ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
			return
		}
		ids = append(ids, id)
	}

	result, err := c.Service.GetDeploymentHostMappingByIds(ctx.Request.Context(), ids)
	if err != nil {
		slog.Error("Error fetching deployments hosts mapping", "err", err)
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(result))
}
