package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
)

func WafController(c *gin.Context, ch *amqp.Channel, ctx context.Context) {
	// 获取请求地址 方法 路径
	log.Println(c.Request.RemoteAddr, c.Request.Method, c.Request.URL)

	getQuery := c.Request.URL.Query()
	for _, queryArr := range getQuery {
		for _, queryData := range queryArr {
			for _, rule := range Rules {
				if rule.Regex == "" {
					continue
				}

				if match, _ := regexp.MatchString(rule.Regex, queryData); match {
					log.Println("Blocked by regex:", c.Request.RemoteAddr, queryData)
					sendToRabbitMQ(ch, Rabbit.Queue2, ctx, []byte(fmt.Sprintf("%v+1", c.Request.RemoteAddr))) // 发送到 eBPF 系统直接添加黑名单
					c.String(http.StatusForbidden, "Blocked by WAF")
					return
				}
			}

			// 发送 GET 请求参数到 RabbitMQ
			sendToRabbitMQ(ch, Rabbit.Queue1, ctx, []byte(fmt.Sprintf("%v+%v", c.Request.RemoteAddr, queryData)))
		}
	}

	if c.Request.Method != "GET" {
		// 读取 HTTP 请求 body
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to read request body")
			return
		}
		// 发送 body 数据到 RabbitMQ
		mqData := []byte(c.Request.RemoteAddr + "+")
		mqData = append(mqData, body...)
		sendToRabbitMQ(ch, Rabbit.Queue1, ctx, mqData)

		// 将 body 写回请求体，以便转发给目标服务器
		c.Request.Body = io.NopCloser(io.NopCloser(bytes.NewBuffer(body)))
	}

	// 通过反向代理转发请求
	path := c.Request.URL.Path
	for api, proxy := range ProxyMap {
		if strings.HasPrefix(path, api) {
			c.Request.URL.Path = strings.TrimPrefix(path, api)
			proxy.ServeHTTP(c.Writer, c.Request)
			return
		}
	}

	c.String(http.StatusNotFound, "Not Found")
}

func LoginController(c *gin.Context) {
	var req LoginRequest
	if err := c.BindJSON(&req); err != nil {
		c.String(http.StatusBadRequest, "Bad Request")
		return
	}

	session := sessions.Default(c)

	if session.Get("name") != nil {
		c.JSON(http.StatusOK, ResponseOK("Already logged in"))
		return
	}

	if req.Username == ServerConfig.User && req.Password == ServerConfig.Pass {
		session.Set("name", req.Username)
		session.Set("hasAdmin", true)

		session.Save()
		c.JSON(http.StatusOK, ResponseOK("Login success"))
	} else {
		c.JSON(http.StatusOK, ResponseLoginFailed("Login failed"))
	}
}

func InfoController(c *gin.Context) {
	session := sessions.Default(c)

	if session.Get("name") == nil {
		c.JSON(http.StatusOK, ResponseFailed(StatusNotLogin, "not login"))
	}

	name := session.Get("name").(string)
	hasAdmin := session.Get("hasAdmin").(bool)

	c.JSON(http.StatusOK, ResponseOK(UserInfo{
		Name:     name,
		HasAdmin: hasAdmin,
	}))
}
