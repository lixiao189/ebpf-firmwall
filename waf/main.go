package main

import (
	"bytes"
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	// "context"
	"io"
	"log"
	"net/http"

	"github.com/fvbock/endless"
	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
)

func sendToRabbitMQ(ch *amqp.Channel, queue string, _ context.Context, msg []byte) {
	err := ch.Publish("", queue, false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        msg,
	})
	logOnError(err, "Failed to publish a message")
}

func wafStart(ch *amqp.Channel, ctx context.Context) {
	r := gin.Default()
	r.Any("/*any", func(c *gin.Context) {
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
	})

	if err := endless.ListenAndServe(fmt.Sprintf("%v:%v", ServerConfig.Host, ServerConfig.Port), r); err != nil {
		log.Println("server err:", err)
	}
}

func main() {
	// connect to RabbitMQ
	conn, err := amqp.Dial(Rabbit.Server)
	logOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	// open a channel
	ch, err := conn.Channel()
	logOnError(err, "Failed to open a channel")
	defer ch.Close()

	// make sure the queue exists
	_, err = ch.QueueDeclare(Rabbit.Queue1, false, false, false, false, nil)
	logOnError(err, "Failed to declare a queue")
	_, err = ch.QueueDeclare(Rabbit.Queue2, false, false, false, false, nil)
	logOnError(err, "Failed to declare a queue")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	wafStart(ch, ctx)
}
