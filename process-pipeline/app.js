// sudo docker build -t shenukacj/event-orchestrator:0.0.1 . && sudo docker push shenukacj/event-orchestrator:0.0.1
const { Kafka } = require('kafkajs');
const axios = require('axios');
const express = require('express');

// Create a Kafka client instance
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const port = 3004;

// Create a consumer instance
const consumer = kafka.consumer({ groupId: 'my-group2' });

// Create a producer instance
const producer = kafka.producer();

// Define the topic names
const jsonTopic = 'json-topic';
const collectionsTopic = 'collections-topic';

// Connect to Kafka broker and subscribe to the json-topic
const run = async () => {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'json-topic' });

  // Start consuming messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Assuming messages are JSON strings, parse the message
      const jsonMessage = JSON.parse(message.value.toString());

      await getCollections();

      // Process the data, for example, adding a key-value pair
      

      // Produce the processed data to the collections-topic
      await producer.send({
        topic: collectionsTopic,
        messages: [
          { value: JSON.stringify(jsonMessage) }
        ]
      });
    },
  });

  async function getCollections(){
    const response = await axios.get(`http://localhost:3003/api/v1/collections`);
      const allItemIds = [];
      const collectionsAndItems = response.data.map((collection) => {
        const itemIds = [];
        collection.items.forEach((item) => {
          itemIds.push(item.id);
          allItemIds.push(item.id);
        });
        return {
          title: collection.title,
          itemIds
        };
      });
      console.log("collections and Items ===>",collectionsAndItems);
      console.log("allItemIds ===>",allItemIds);
      console.log("JSON message", jsonMessage);
      if (allItemIds.includes(jsonMessage.id)){
        console.log("THIS MESSAGE HAS THE ITEM ID!!!");
      }
      else {
        console.log("THIS MESSAGE DOES NOT HAVE THE ITEM ID!!!");
      }
  }

  // Create Express app
  const app = express();

  // Define a route to receive HTTP requests
  app.post('/receive', (req, res) => {
    // Handle incoming requests here
    res.send('Received HTTP request');
  });

  // Start the Express server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

// Run the consumer
run().catch(console.error);
