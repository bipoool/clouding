package v1

import (
	"clouding/backend/internal/model/deployment"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"clouding/backend/internal/utils/logStreamer"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type DeploymentController struct {
	Service     service.DeploymentService
	LogStreamer logStreamer.LogStreamer
}

func NewDeploymentController(s service.DeploymentService, ls logStreamer.LogStreamer) *DeploymentController {
	return &DeploymentController{Service: s, LogStreamer: ls}
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
	idsStr := ctx.Param("id")
	// @ TODO fetch unique values here
	idsStrArr := strings.Split(idsStr, ",")
	result, err := c.Service.GetDeploymentHostMappingByIds(ctx.Request.Context(), idsStrArr)
	if err != nil {
		slog.Error("Error fetching deployments hosts mapping", "err", err)
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(result))
}

func (c *DeploymentController) StreamJobProgress(ctx *gin.Context) {
	jobId := ctx.Param("jobId")

	h := ctx.Writer.Header()
	h.Set("Content-Type", "text/event-stream")
	h.Set("Cache-Control", "no-cache")
	h.Set("Connection", "keep-alive")
	h.Set("X-Accel-Buffering", "no") // disable Nginx buffering

	flusher, ok := ctx.Writer.(http.Flusher)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse("streaming unsupported"))
		return
	}

	ctx.Status(http.StatusOK)
	flusher.Flush()

	// Heartbeat to keep connection alive
	heartbeat := time.NewTicker(15 * time.Second)
	defer heartbeat.Stop()

	reqCtx := ctx.Request.Context()
	logChan, err := c.LogStreamer.StreamLogs(reqCtx, jobId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	for {
		select {
		case <-reqCtx.Done():
			return
		case log, ok := <-logChan:
			if !ok {
				return
			}
			if log.Error != "" {
				ctx.SSEvent("error", utils.NewInternalErrorResponse(log.Error))
				return
			}
			ctx.SSEvent("logs", utils.NewSuccessResponse(log))
			flusher.Flush()
		case <-heartbeat.C:
			ctx.SSEvent("heartbeat", utils.NewSuccessResponse("heartbeat"))
			flusher.Flush()
		}
	}
}
