package main

import (
	"context"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

func logOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func sendToRabbitMQ(ch *amqp.Channel, queue string, _ context.Context, msg []byte) {
	err := ch.Publish("", queue, false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        msg,
	})
	logOnError(err, "Failed to publish a message")
}
