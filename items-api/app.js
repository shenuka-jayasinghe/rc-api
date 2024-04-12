const { Kafka } = require('kafkajs');

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092'] // Change this to match your Kafka broker(s)
});

// Initialize consumer
const consumer = kafka.consumer({ groupId: 'my-group' });

// Initialize producer
const producer = kafka.producer();

const topicsToConsume = ['json-topic', 'tei-topic'];
const topicToProduce = 'items-topic';

const consumeAndProduce = async () => {
  await consumer.connect();
  await producer.connect();

  await Promise.all(
    topicsToConsume.map(async (topic) => {
      await consumer.subscribe({ topic, fromBeginning: true });
    })
  );

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
        topic,
        partition,
        offset: message.offset,
      });

      // Produce the message to the output topic
      await producer.send({
        topic: topicToProduce,
        messages: [{ value: message.value }],
      });
    },
  });
};

consumeAndProduce().catch(console.error);
