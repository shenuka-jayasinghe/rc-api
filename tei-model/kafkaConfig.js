const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
  });

const producer = kafka.producer();

 // Define Kafka topic
const topic = 'resource-events';