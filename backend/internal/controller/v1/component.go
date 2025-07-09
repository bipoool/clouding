package v1

import (
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ComponentController struct {
	Service service.ComponentService
}

func NewComponentController(s service.ComponentService) *ComponentController {
	return &ComponentController{Service: s}
}

func (c *ComponentController) GetComponent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Debug("ComponentId not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	comp, err := c.Service.GetComponent(ctx.Request.Context(), id)
	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(comp))
}

func (c *ComponentController) GetComponentByIds(ctx *gin.Context) {
	idsStr := ctx.Param("ids")
	idsStrArr := strings.Split(idsStr, ",")
	var ids []int

	for _, idStr := range idsStrArr {
		id, err := strconv.Atoi(idStr)
		if err != nil {
			slog.Debug("ComponentId not correct", "ERR", err)
			ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
			return
		}
		ids = append(ids, id)
	}

	comps, err := c.Service.GetComponentByIds(ctx.Request.Context(), ids)
	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(comps))
}

func (c *ComponentController) GetAllComponents(ctx *gin.Context) {
	comps, err := c.Service.GetAllComponents(ctx.Request.Context())
	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(comps))
}
