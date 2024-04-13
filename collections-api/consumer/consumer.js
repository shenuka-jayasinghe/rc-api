const { Kafka } = require('kafkajs');
const axios = require('axios');
const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;

const kafka = new Kafka({
  clientId: "collections-api",
  brokers: [KAFKA_CLIENT], // Kafka broker addresses
});

// Create a consumer instance
const consumer = kafka.consumer({ groupId: 'my-group' });

// Connect to Kafka broker and subscribe to the json-topic
const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: ['json-topic'] });
  console.log("KAFKA_CLIENT ===>",KAFKA_CLIENT)

  // Run the consumer
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const jsonStringData = message.value.toString('utf-8')
      console.log("MESSAGE ==>", jsonStringData);
      const jsonData = JSON.parse(jsonStringData)
      const jsonId = jsonData.id
      console.log("JSON ID ===>", jsonId)
    },
  });
};

// Call the run function
run().catch(console.error);
