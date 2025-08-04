package queue

import (
	"log/slog"

	"github.com/rabbitmq/amqp091-go"
)

type Publisher struct {
	Channel *amqp091.Channel
	Queue   amqp091.Queue
}

func NewPublisher(conn *amqp091.Connection, queueName string) (*Publisher, error) {
	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	q, err := ch.QueueDeclare(
		queueName,
		true,  
		false,
		false, 
		false, 
		nil,   
	)
	if err != nil {
		slog.Error("Error declaring queue", "queue", queueName, "error", err)
		panic(err)
	}

	return &Publisher{
		Channel: ch,
		Queue:   q,
	}, nil
}

func (p *Publisher) Publish(body []byte) error {
	return p.Channel.Publish(
		"",           // exchange
		p.Queue.Name, // routing key
		false,        // mandatory
		false,        // immediate
		amqp091.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}
