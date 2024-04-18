//consumes from item JSON service and prehydrates the collections topic
const { Kafka } = require("kafkajs");
const { updateCollections, prehydrateCollections } = require('../model/model');

const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;
console.log("KAFKA_CLIENT ==>",KAFKA_CLIENT)
const kafka = new Kafka({
  clientId: "collections-api",
  brokers: ['kafka:9092'], // Kafka broker addresses
});

// Create a consumer instance
const consumer = kafka.consumer({ groupId: 'my-group' });

//check which collections the item belongs to and updates the collections topic based on changes


//replace the new json data in that array

// Connect to Kafka broker and subscribe to the json-topic
exports.runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: ['json-topic'] });

  // Run the consumer
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const messageStringData = message.value.toString('utf-8')
      console.log("MESSAGE ==>", messageStringData);
      const messageData = JSON.parse(messageStringData)
      const itemId = messageData.id
      console.log("Item ID ===>", itemId)
      prehydrateCollections(itemId, messageStringData)
    },
  });
};

