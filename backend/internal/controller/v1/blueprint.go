package v1

import (
	"clouding/backend/internal/model/blueprint"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BlueprintController struct {
	Service service.BlueprintService
}

func NewBlueprintController(s service.BlueprintService) *BlueprintController {
	return &BlueprintController{Service: s}
}

func (c *BlueprintController) GetAll(ctx *gin.Context) {
	userId := ctx.GetString("userId")
	blueprints, err := c.Service.GetAllByUserID(ctx.Request.Context(), userId)
	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(blueprints))
}

func (c *BlueprintController) GetById(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Debug("ID not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	bp, err := c.Service.GetByID(ctx.Request.Context(), id)
	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(bp))
}

func (c *BlueprintController) GetComponents(ctx *gin.Context) {
	blueprintIdStr := ctx.Param("id")
	blueprintId, err := strconv.Atoi(blueprintIdStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	comps, err := c.Service.GetComponentsByBlueprintID(ctx.Request.Context(), blueprintId)
	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(comps))
}

func (c *BlueprintController) Create(ctx *gin.Context) {
	userId := ctx.GetString("userId")
	var bp blueprint.Blueprint
	if err := ctx.ShouldBindJSON(&bp); err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	bp.UserID = &userId
	if err := c.Service.Create(ctx.Request.Context(), &bp); err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	// Build response with component details
	response := &blueprint.CreateBlueprintResponse{
		ID: bp.ID,
	}

	ctx.JSON(http.StatusCreated, utils.NewSuccessResponse(response))
}

func (c *BlueprintController) Update(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Debug("ID not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	userId := ctx.GetString("userId")
	var bp blueprint.Blueprint
	if err := ctx.ShouldBindJSON(&bp); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	// Set the ID from URL parameter and user ID
	bp.ID = &id
	bp.UserID = &userId

	if err := c.Service.Update(ctx.Request.Context(), &bp); err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	// Build response with component details
	response := &blueprint.UpdateBlueprintResponse{
		ID:        bp.ID,
		UpdatedAt: bp.UpdatedAt,
	}

	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(response))
}

func (c *BlueprintController) UpdateBlueprintComponents(ctx *gin.Context) {
	blueprintIdStr := ctx.Param("id")
	blueprintId, err := strconv.Atoi(blueprintIdStr)
	if err != nil {
		slog.Debug("ID not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	// userId := ctx.GetString("userId")
	var components []*blueprint.BlueprintComponent
	if err := ctx.ShouldBindJSON(&components); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	if err := c.Service.UpdateBlueprintComponents(ctx.Request.Context(), blueprintId, components); err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	// Build response with component details
	response := make([]*blueprint.UpdateBlueprintComponentResponse, len(components))

	for i, comp := range components {
		response[i] = &blueprint.UpdateBlueprintComponentResponse{
			BlueprintComponentID: comp.ID,
			ComponentID:          comp.ComponentID,
			Position:             comp.Position,
		}
	}

	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(response))
}

func (c *BlueprintController) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Debug("ID not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	if err := c.Service.Delete(ctx.Request.Context(), id); err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(gin.H{"id": id}))
}
