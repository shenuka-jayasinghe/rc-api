//consumes from item JSON service and prehydrates the collections topic
const { Kafka } = require("kafkajs");
const { mapToTei } = require("../utils/narratives2tei");
const { processNarratives, processMapping, processTeiTemplate } = require("../model/model");

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
const consumer = kafka.consumer({ groupId: 'dos-group' });


// Connect to Kafka broker and subscribe to the json-topic
exports.runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topics: ['narratives-topic','mapping-topic','tei-template-topic','tei-topic','json-topic'] });
  
    // Run the consumer
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const jsonStringData = message.value.toString('utf-8')
        console.log("MESSAGE ==>", jsonStringData);
        const jsonData = JSON.parse(jsonStringData)
        const dataId = jsonData.id
        console.log("ID ===>", dataId)
        console.log("topic ==>", topic)

        if(topic === 'narratives-topic'){
          try{
          await processNarratives(dataId, jsonStringData)
          }
          catch (error){
            console.log('Error processing Narratives')
            throw error
          }
        }
        if(topic === 'mapping-topic'){
          try{
          await processMapping(dataId, jsonStringData)
          }
          catch (error){
            console.log('Error processing Mapping')
            throw error
          }
        }
        if(topic === 'tei-template-topic'){
          try{
          await processTeiTemplate(dataId, jsonStringData)
          }
          catch (error){
            console.log('Error processing TEI Template')
            throw error
          }
        }
      },
    });
  };
  
  