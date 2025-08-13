package v1

import (
	"clouding/backend/internal/model/deployment"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"strings"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"time"

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


	ctx.Header("Content-Type", "text/event-stream")
	ctx.Header("Cache-Control", "no-cache")
	ctx.Header("Connection", "keep-alive")


	logChan := make(chan string)
	done := make(chan struct{})

	go func() {
		defer close(logChan)
		defer close(done)

		lastTimestamp := time.Now().Add(-1 * time.Minute).UnixNano()

		for {
			select {
			case <-ctx.Done():
				return
			default:
				logs, newTs, err := utils.QueryLokiLogs(jobId, lastTimestamp)
				if err != nil {
					logChan <- fmt.Sprintf(`{"error": "%s"}`, err.Error())
					return
				}

				for _, log := range logs {
					logChan <- log
				}
				
				lastTimestamp = newTs

				if utils.CheckIfJobFinished(logs) {
					log.Println(" Job finished detected in logs")
					return
				}

				time.Sleep(2 * time.Second)
			}
		}
	}()

	for {
		select {
		case <-ctx.Done():
			return
		case log, ok := <-logChan:
			if !ok {
				return
			}
			ctx.SSEvent("message", log)
			ctx.Writer.Flush()
		}
	}
}

