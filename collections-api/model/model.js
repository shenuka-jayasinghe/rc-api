const { Kafka } = require("kafkajs");
const client = require("../db/connection");
const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;

const kafka = new Kafka({
  clientId: "collections-api",
  brokers: ['kafka:9092'], // Kafka broker addresses
});


const producer = kafka.producer();

async function sendToKafka(payLoad) {
  await producer.connect();
  await producer.send({
    topic: "collections-topic", // Kafka topic name
    messages: [{ value: payLoad }],
  });
  await producer.disconnect();
}

postCollectionModel = async (json, title) => {
  try {
    const payLoad = {
      event: "new-collection-created",
      title,
      timestamp: Date.now(),
      json
    };
    console.log('Title Model==>', title)
    // console.log(payLoad);
    await sendToKafka(JSON.stringify(payLoad));
    console.log("new collection data successfully sent to Kafka");
  } catch (error) {
    console.error("Error sending collection data to Kafka:", error);
    throw error;
  }
};

updateCollectionModel = async (updatedCollection, title) => {
  try {
    const payLoad = {
        event: "updated-collection",
        title,
        timestamp: Date.now(),
        json: updatedCollection,
      };
      await sendToKafka(JSON.stringify(payLoad));
      console.log("Update event sent to Kafka");
  } catch (error) {
    console.error("Error sending collection data to Kafka:", error);
    throw error;
  }
};

deleteCollectionModel = async (title) => {
    try {
      const payLoad = {
          event: "deleted-collection",
          title,
          timestamp: Date.now(),
          json: '',
        };
        console.log(payLoad);
        await sendToKafka(JSON.stringify(payLoad));
        console.log("Delete event sent to Kafka");
    } catch (error) {
      console.error("Error sending collection data to Kafka:", error);
      throw error;
    }
  };

getAllEventsCollectionsModel = async (title) => {
    try {
      await client.connect();
      if (/\;/g.test(title)) {
        return "No SQL injections allowed";
      } else {
        const query = `SELECT * FROM collection_stream WHERE title = '${title}';`;
        const { data, status, error } = await client.query(query);
        if (error) {
          console.error("Error returned by KsqlDB:", error);
          throw new Error(error);
        }
        return data;
      }
  
    } catch (err) {
      console.error("Error thrown while doing the query:", err);
      throw err;
    } finally {
      await client.disconnect();
    }
  };

  getCollectionModel = async (title) => {
    try {
      await client.connect();
      if (/\;/g.test(title)) {
        return "No SQL injections allowed";
      } else {
        const query = `SELECT * FROM collection_stream WHERE title = '${title}';`;
        const { data, status, error } = await client.query(query);
        if (error) {
          console.error("Error returned by KsqlDB:", error);
          throw new Error(error);
        }
        const latestEvent = data.rows[data.rows.length-1]
        return latestEvent;
      }
  
    } catch (err) {
      console.error("Error thrown while doing the query:", err);
      throw err;
    } finally {
      await client.disconnect();
    }
  };

  getAllCollectionsModel = async () => {
    try {
      await client.connect();
        const query = `SELECT * FROM collection_stream;`;
        const { data, status, error } = await client.query(query);
        if (error) {
          console.error("Error returned by KsqlDB:", error);
          throw new Error(error);
        }
        // Process the data in JavaScript
        const processedData = getLatestByTitle(data.rows);

        return processedData;
    }
    catch (err) {
      console.error("Error fetching all collections", err);
    }
    finally {
      await client.disconnect();
    }
  }


  // Function to process the data
  function getLatestByTitle(data) {
    const latestByTitle = {};

    data.forEach(obj => {
        const { TITLE, TIMESTAMP } = obj;
        if (!latestByTitle[TITLE] || TIMESTAMP > latestByTitle[TITLE].TIMESTAMP) {
            latestByTitle[TITLE] = obj;
        }
    });

    return Object.values(latestByTitle);
}

prehydrateCollections = async (inputItemId, inputItemJson) => {
  const collectionData = await getAllCollectionsModel(); //array
  const collectionsAndItems = collectionData.map((collection) => {
    const collectionJson = JSON.parse(collection.JSON)
    console.log("typeof collectionJSON", typeof collectionJson)
    const itemIds = collectionJson.items.map((item) => {
      return item.id ? item.id : '';
    })
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
    console.log("inputItemJson.json[0] ==>", inputItemJson.json[0])
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
      //Goes into the model (in model directory) to update Collection
      updateCollectionModel(updatedCollectionData, collectionJson.title)
    })
  }
  else {
    console.log("changedTitles ==>", changedTitles)
  }
}

module.exports = {postCollectionModel, updateCollectionModel, deleteCollectionModel, getCollectionModel, getAllCollectionsModel, getAllEventsCollectionsModel, prehydrateCollections }