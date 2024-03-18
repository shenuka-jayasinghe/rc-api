const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-consumer',
    brokers: ['localhost:9092']
  });
  