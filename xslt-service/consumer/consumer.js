//consumes from item JSON service and prehydrates the collections topic
const { Kafka } = require("kafkajs");
const { processXml } = require("../model/model");

const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;

const kafka = new Kafka({
  clientId: "xslt-service",
  brokers: ['kafka:9092'], // Kafka broker addresses
});

// Create a consumer instance
const consumer = kafka.consumer({ groupId: 'xslt-group' });


// Connect to Kafka broker and subscribe to the json-topic
exports.runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topics: ['tei-topic'] });
  
    // Run the consumer
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const jsonStringData = message.value.toString('utf-8')
        console.log("MESSAGE ==>", jsonStringData);
        const jsonData = JSON.parse(jsonStringData)
        const dataId = jsonData.id
        console.log("ID ===>", dataId)
        console.log("topic ==>", topic)
        await processXml(jsonData.tei, dataId)
      },
    });
  };
  
  