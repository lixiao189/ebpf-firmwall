package main

import (
	"bytes"
	"context"
	"fmt"
	"time"

	// "context"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	amqp "github.com/rabbitmq/amqp091-go"
)

func sendToRabbitMQ(ch *amqp.Channel, _ context.Context, msg []byte) {
	err := ch.Publish("", Rabbit.Queue, false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        msg,
	})
	logOnError(err, "Failed to publish a message")
}

func wafStart(ch *amqp.Channel, ctx context.Context) {
	target, err := url.Parse(BACKEND)
	if err != nil {
		log.Println("Error parsing target URL:", err)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	d := proxy.Director
	proxy.Director = func(r *http.Request) {
		d(r)
		r.Host = target.Host
	}

	// Redirect any request to the target URL
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Log for debugging
		log.Println(r.RemoteAddr, r.Method, r.URL)

		getQuery := r.URL.Query()
		for _, queryArr := range getQuery {
			for _, queryData := range queryArr {
				// 发送 GET 请求参数到 RabbitMQ
				sendToRabbitMQ(ch, ctx, []byte(fmt.Sprintf("%v+%v", r.RemoteAddr, queryData)))
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
			sendToRabbitMQ(ch, ctx, mqData)

			// 将 body 写回请求体，以便转发给目标服务器
			r.Body = io.NopCloser(io.NopCloser(bytes.NewBuffer(body)))
		}

		proxy.ServeHTTP(w, r)
	})

	if err := http.ListenAndServe("0.0.0.0:8080", nil); err != nil {
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
	_, err = ch.QueueDeclare(Rabbit.Queue, false, false, false, false, nil)
	logOnError(err, "Failed to declare a queue")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	wafStart(ch, ctx)
}
