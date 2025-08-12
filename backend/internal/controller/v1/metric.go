package v1

import (
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

type MetricController struct {
	Service service.MetricService
}

func NewMetricController(s service.MetricService) *MetricController {
	return &MetricController{Service: s}
}

func (m *MetricController) GetOverview(c *gin.Context) {
	userId := c.GetString("userId")
	groups, err := m.Service.GetOverview(c.Request.Context(), userId)
	if err != nil {
		slog.Debug("Error while fetching overview", "User", userId, "ERR", err)
		c.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.NewSuccessResponse(groups))
}
