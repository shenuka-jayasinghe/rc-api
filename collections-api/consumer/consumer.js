const { Kafka } = require("kafkajs");
const { getAllCollectionsModel, updateCollectionModel } = require('../model/model');

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

//check which collections the item belongs to and updated the pre-hydrated the collections topic

async function updateCollections(inputItemId, inputItemJson){
  const collectionData = await getAllCollectionsModel(); //array
  const collectionsAndItems = collectionData.map((collection) => {
    const collectionJson = JSON.parse(collection.JSON)
    const itemIds = collectionJson.items.map((item) => item.id)
    const collectionAndItems = {
      title: collectionJson.title,
      itemIds
    }
    return collectionAndItems
  })
  const changedCollections = collectionsAndItems.filter((collection) => {
    return collection.itemIds.some(itemId => itemId === inputItemId);
  })
  const changedTitles = changedCollections.map(collection => collection.title)
  if(changedTitles){
    const itemCollectionData = {
    id : inputItemId,
    title: inputItemJson.json[0].descriptiveMetadata[0].title.displayForm,
    thumbnailUrl : inputItemJson.json[0].descriptiveMetadata[0].thumbnailUrl,
    abstract: inputItemJson.json[0].descriptiveMetadata[0].abstract.displayForm
    }
    const updateCollections  = collectionData.map(collection => {
      const collectionJson = JSON.parse(collection.JSON)
      const newItems = collectionJson.items.map((item) => {
        if(item.id === inputItemId){
          return itemCollectionData
        }
        else {
          return item
        }
      })
      const updatedCollectionData = {
        title: collectionJson.title,
        thumbnailUrl: collectionJson.thumbnailUrl,
        description: collectionJson.description,
        items: newItems
      }
      updateCollectionModel(updatedCollectionData, collectionJson.title)
    })
  }
  else {
    console.log("changedTitles ==>", changedTitles)
  }
}

//replace the new json data in that array

// Connect to Kafka broker and subscribe to the json-topic
exports.runConsumer = async () => {
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
      updateCollections(jsonId, jsonData)    
    },
  });
};

