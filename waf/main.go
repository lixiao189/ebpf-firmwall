package main

import (
	"bytes"
	"context"
	"fmt"
	"regexp"
	"time"

	// "context"
	"io"
	"log"
	"net/http"

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
	// Redirect any request to the target URL
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Log for debugging
		log.Println(r.RemoteAddr, r.Method, r.URL)

		getQuery := r.URL.Query()
		for _, queryArr := range getQuery {
			for _, queryData := range queryArr {
				// 使用正则匹配
				for _, rule := range Rules {
					if rule.Regex == "" {
						continue
					}
					// 如果匹配到规则，直接拦截
					if match, _ := regexp.MatchString(rule.Regex, queryData); match {
						log.Println("Blocked by regex:", r.RemoteAddr, queryData)
						sendToRabbitMQ(ch, Rabbit.Queue2, ctx, []byte(fmt.Sprintf("%v+1", r.RemoteAddr))) // 发送到 eBPF 系统直接添加黑名单
						http.Error(w, "Blocked by WAF", http.StatusForbidden)
						return
					}
				}

				// 发送 GET 请求参数到 RabbitMQ
				sendToRabbitMQ(ch, Rabbit.Queue1, ctx, []byte(fmt.Sprintf("%v+%v", r.RemoteAddr, queryData)))
			}
		}

		if r.Method != "GET" {
			// 读取 HTTP 请求 body
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "Failed to read request body", http.StatusInternalServerError)
				return
			}
			// 发送 body 数据到 RabbitMQ
			mqData := []byte(r.RemoteAddr + "+")
			mqData = append(mqData, body...)
			sendToRabbitMQ(ch, Rabbit.Queue1, ctx, mqData)

			// 将 body 写回请求体，以便转发给目标服务器
			r.Body = io.NopCloser(io.NopCloser(bytes.NewBuffer(body)))
		}

		// 转发请求到目标服务器
		ProxyMap[r.URL.Path].ServeHTTP(w, r)
	})

	if err := http.ListenAndServe(fmt.Sprintf("%v:%v", ServerConfig.Host, ServerConfig.Port), nil); err != nil {
		log.Println("Error starting server:", err)
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
