package utils

import "github.com/gin-gonic/gin"

func NewApiErrorResponse(err string) gin.H {
	return gin.H{
		"error":   "API Error: " + err,
		"success": false,
		"data":    nil,
	}
}

func NewWrongParamResponse(err string) gin.H {
	return gin.H{
		"error":   "Parameter(s) not correct. " + err,
		"success": false,
		"data":    nil,
	}
}

func NewInternalErrorResponse(err string) gin.H {
	return gin.H{
		"error":   "Internal Exception: " + err,
		"success": false,
		"data":    nil,
	}
}

func NewSuccessResponse(data any) gin.H {
	return gin.H{
		"success": true,
		"error":   nil,
		"data":    data,
	}
}
