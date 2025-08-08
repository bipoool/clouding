package v1

import (
	hostgroup "clouding/backend/internal/model/hostGroup"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type HostGroupController struct {
	Service service.HostGroupService
}

func NewHostGroupController(s service.HostGroupService) *HostGroupController {
	return &HostGroupController{Service: s}
}

func (h *HostGroupController) GetAllHostGroups(c *gin.Context) {
	userId := c.GetString("userId")
	groups, err := h.Service.GetAllHostGroups(c.Request.Context(), userId)
	if err != nil {
		slog.Debug("Error while fetching all hosts for", "User", userId, "ERR", err)
		c.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.NewSuccessResponse(groups))
}

func (h *HostGroupController) GetHostGroupByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse("ID must be a number"))
		return
	}

	group, err := h.Service.GetHostGroupByID(c.Request.Context(), id)
	if err != nil {
		slog.Debug("HostGroupId not correct", "ERR", err)
		c.JSON(http.StatusNotFound, utils.NewApiErrorResponse("Host group not found"))
		return
	}
	c.JSON(http.StatusOK, utils.NewSuccessResponse(group))
}

func (h *HostGroupController) CreateHostGroup(c *gin.Context) {
	userId := c.GetString("userId")
	var group hostgroup.HostGroup
	if err := c.ShouldBindJSON(&group); err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	group.UserID = &userId
	if err := h.Service.CreateHostGroup(c.Request.Context(), &group); err != nil {
		c.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := hostgroup.HostGroupCreateResponse{
		ID:        group.ID,
		CreatedAt: group.CreatedAt,
	}
	c.JSON(http.StatusOK, utils.NewSuccessResponse(resp))
}

func (h *HostGroupController) UpdateHostGroup(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse("Invalid ID"))
		return
	}
	var group hostgroup.HostGroup
	if err := c.ShouldBindJSON(&group); err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	group.ID = &id
	if err := h.Service.UpdateHostGroup(c.Request.Context(), &group); err != nil {
		c.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := hostgroup.HostGroupUpdateResponse{
		UpdatedAt: group.UpdatedAt,
	}
	c.JSON(http.StatusOK, utils.NewSuccessResponse(resp))
}

func (h *HostGroupController) AddHostsToGroup(c *gin.Context) {
	groupIDStr := c.Param("id")
	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse("ID must be a number"))
		return
	}

	var body hostgroup.AddHostToHostgroupRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	if err := h.Service.AddHostsToGroup(c.Request.Context(), groupID, body.HostIDs); err != nil {
		c.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.NewSuccessResponse("Hosts added successfully"))
}

func (h *HostGroupController) RemoveHostFromGroup(c *gin.Context) {
	groupIDStr := c.Param("id")
	hostIDStr := c.Param("hostId")

	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse("Invalid group ID"))
		return
	}

	hostID, err := strconv.Atoi(hostIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse("Invalid host ID"))
		return
	}
	if err := h.Service.RemoveHostFromGroup(c.Request.Context(), groupID, hostID); err != nil {
		c.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.NewSuccessResponse("Host removed successfully"))
}

func (h *HostGroupController) DeleteHostGroup(c *gin.Context) {
	groupIDStr := c.Param("id")
	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.NewWrongParamResponse("Invalid group ID"))
		return
	}

	if err := h.Service.DeleteHostGroup(c.Request.Context(), groupID); err != nil {
		c.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := hostgroup.HostGroupDeleteResponse{
		ID:        &groupID,
		IsDeleted: true,
	}
	c.JSON(http.StatusOK, utils.NewSuccessResponse(resp))
}
