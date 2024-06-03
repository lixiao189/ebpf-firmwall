package main

import "github.com/gin-gonic/gin"

type User struct {
	UserName string `json:"username"`
	Password string `json:"password"`
}

func main() {
	r := gin.Default()
	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "test",
		})
	})

	r.POST("/login", func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		if user.UserName != "admin" || user.Password != "admin" {
			c.JSON(401, gin.H{"error": "unauthorized"})
			return
		}

		c.JSON(200, gin.H{"message": "login success"})
	})

	r.Run(":8081") // listen and serve on 0.0.0.0:8081
}
