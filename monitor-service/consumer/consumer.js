//consumes from item JSON service and prehydrates the collections topic
const { Kafka } = require("kafkajs");
const { produceEvent } = require("../model/model");

const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;
const CONSUMER_GROUP = process.env.CONSUMER_GROUP;

const kafka = new Kafka({
  clientId: "data-orchestrator-service",
  brokers: ['kafka:9092'], // Kafka broker addresses
});

// Create a consumer instance
const consumer = kafka.consumer({ groupId: CONSUMER_GROUP });


// Connect to Kafka broker and subscribe to the json-topic
exports.runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topics: ['narratives-topic','mapping-topic','tei-template-topic','tei-topic','json-topic','collections-topic'] });
  
    // Run the consumer
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const jsonStringData = message.value.toString('utf-8')
        console.log("TOPIC ==>", topic);
        const jsonData = JSON.parse(jsonStringData)
        const dataId = jsonData.id ? jsonData.id : jsonData.title
        const payLoad = {
            id: dataId,
            kafka_topic: topic,
            event: jsonData.event,
            timestamp: Date.now(),
            partition
          };
        await produceEvent(payLoad);
      },
    });
  };
  
  