const { Kafka } = require("kafkajs");
const client = require("../db/connection");
const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;

const kafka = new Kafka({
  clientId: "collections-api",
  brokers: [KAFKA_CLIENT], // Kafka broker addresses
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

exports.postCollectionModel = async (json, title) => {
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

exports.updateCollectionModel = async (updatedCollection, title) => {
  try {
    const payLoad = {
        event: "updated-collection",
        title,
        timestamp: Date.now(),
        json: updatedCollection,
      };
      console.log(payLoad);
      await sendToKafka(JSON.stringify(payLoad));
      console.log("Update event sent to Kafka");
  } catch (error) {
    console.error("Error sending collection data to Kafka:", error);
    throw error;
  }
};

exports.deleteCollectionModel = async (title) => {
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

exports.getAllEventsCollectionsModel = async (title) => {
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

  exports.getCollectionModel = async (title) => {
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

  exports.getAllCollectionsModel = async () => {
    try {
      await client.connect();
        const query = `SELECT * FROM collection_stream;`;
        const { data, status, error } = await client.query(query);
        console.log(data.rows)
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
