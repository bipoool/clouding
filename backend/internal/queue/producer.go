package queue

import (
	"log/slog"

	"github.com/rabbitmq/amqp091-go"
)

type Publisher struct {
	Conn    *amqp091.Connection
	Channel *amqp091.Channel
	Queue   *amqp091.Queue
}

func NewPublisher(url, port, username, password, queueName string) *Publisher {

	endpoint := "amqp://" + username + ":" + password + "@" + url + ":" + port

	conn, err := amqp091.Dial(endpoint)
	if err != nil {
		panic(err)
	}

	ch, err := conn.Channel()
	if err != nil {
		slog.Error("Error in Rabbitmq connection")
		panic(err)
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
		Conn:    conn,
		Channel: ch,
		Queue:   &q,
	}
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

func (p *Publisher) Close() error {
	err := p.Channel.Close()
	if err != nil {
		return err
	}
	err = p.Conn.Close()
	if err != nil {
		return err
	}
	return nil
}
