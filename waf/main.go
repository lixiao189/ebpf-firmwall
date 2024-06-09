package main

import (
	"context"
	"fmt"
	"time"

	// "context"

	"log"

	"github.com/fvbock/endless"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
)

func wafStart(ch *amqp.Channel, ctx context.Context) {
	r := gin.Default()
	store, err := redis.NewStore(10, "tcp", fmt.Sprintf("%v:%v", RedisConfig.Host, RedisConfig.Port), "", []byte("secret"))
	logOnError(err, "Failed to connect to Redis")
	r.Use(sessions.Sessions("mysession", store))

	v1 := r.Group("/api/v1")
	{
		userAPI := v1.Group("/user")
		{
			userAPI.POST("/login", LoginController)
            userAPI.GET("/info", InfoController)
		}
	}

	r.NoRoute(func(c *gin.Context) {
		WafController(c, ch, ctx)
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
