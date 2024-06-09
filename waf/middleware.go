// Package main provides ...
package main

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		user := session.Get("name")
		if user == nil {
			c.JSON(http.StatusOK, ResponseFailed(StatusNotLogin, "not login"))
			c.Abort()
			return
		}
		c.Next()
	}
}
