package v1

import (
	"clouding/backend/internal/model/user"
	"clouding/backend/internal/service"
	"clouding/backend/internal/utils"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	Service service.UserService
}

func NewUserController(s service.UserService) *UserController {
	return &UserController{Service: s}
}

func (c *UserController) GetUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		slog.Debug("UserId not correct", "ERR", err)
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	userObj, err := c.Service.GetUser(ctx.Request.Context(), id)

	if err != nil {
		slog.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, utils.NewInternalErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(userObj))
}

func (c *UserController) CreateUser(ctx *gin.Context) {
	var userObj user.User
	if err := ctx.ShouldBindJSON(&userObj); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	if err := c.Service.CreateUser(ctx.Request.Context(), &userObj); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, &user.CreateUserResponse{ID: userObj.ID})
}

func (c *UserController) UpdateUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	var userObj user.User
	if err := ctx.ShouldBindJSON(&userObj); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}
	userObj.ID = &id

	if err := c.Service.UpdateUser(ctx.Request.Context(), &userObj); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	resp := &user.UpdateUserResponse{
		ID:        userObj.ID,
		UpdatedAt: userObj.UpdatedAt,
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(resp))
}

func (c *UserController) DeleteUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.NewWrongParamResponse(err.Error()))
		return
	}

	if err := c.Service.DeleteUser(ctx.Request.Context(), id); err != nil {
		ctx.JSON(http.StatusNotFound, utils.NewInternalErrorResponse(err.Error()))
		return
	}

	res := &user.DeleteUserResponse{
		ID:        &id,
		IsDeleted: true,
	}
	ctx.JSON(http.StatusOK, utils.NewSuccessResponse(res))
}
