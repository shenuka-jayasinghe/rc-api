//consumes from item JSON service and prehydrates the collections topic
const { Kafka } = require("kafkajs");

const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;

const kafka = new Kafka({
  clientId: "data-orchestrator-service",
  brokers: ['kafka:9092'], // Kafka broker addresses
});

// Create a consumer instance
const consumer = kafka.consumer({ groupId: 'my-group' });


// Connect to Kafka broker and subscribe to the json-topic
exports.runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topics: ['json-topic','tei-topic','collections-topic', 'tei-template-topic','mapping-topic','narratives-topic'] });
  
    // Run the consumer
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const jsonStringData = message.value.toString('utf-8')
        console.log("MESSAGE ==>", jsonStringData);
        const jsonData = JSON.parse(jsonStringData)
        const dataId = jsonData.id
        console.log("JSON ID ===>", dataId)
      },
    });
  };
  
  