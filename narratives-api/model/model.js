const { Kafka } = require("kafkajs");
const client = require("../db/connection");
const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;

const kafka = new Kafka({
  clientId: "narratives-api",
  brokers: [KAFKA_CLIENT], // Kafka broker addresses
});

const producer = kafka.producer();

async function sendToKafka(payLoad) {
  await producer.connect();
  await producer.send({
    topic: "narratives-topic", // Kafka topic name
    messages: [{ value: payLoad }],
  });
  await producer.disconnect();
}

exports.postNarrativeModel = async (json, id) => {
  try {
    const payLoad = {
      event: "new-narrative-item",
      id,
      timestamp: Date.now(),
      json
    };
    console.log(payLoad);
    await sendToKafka(JSON.stringify(payLoad));
    console.log("new JSON data successfully sent to Kafka");
  } catch (error) {
    console.error("Error sending JSON data to Kafka:", error);
    throw error;
  }
};

exports.updateNarrativeModel = async (updatedJson, id) => {
  try {
    const payLoad = {
        event: "updated-narrative",
        id,
        timestamp: Date.now(),
        json: updatedJson,
      };
      console.log(payLoad);
      await sendToKafka(JSON.stringify(payLoad));
      console.log("Update event sent to Kafka");
  } catch (error) {
    console.error("Error sending JSON data to Kafka:", error);
    throw error;
  }
};

exports.deleteNarrativeModel = async (id) => {
    try {
      const payLoad = {
          event: "deleted-narrative",
          id,
          timestamp: Date.now(),
          json: '',
        };
        console.log(payLoad);
        await sendToKafka(JSON.stringify(payLoad));
        console.log("Delete event sent to Kafka");
    } catch (error) {
      console.error("Error sending JSON data to Kafka:", error);
      throw error;
    }
  };

exports.getAllEventsNarrativesModel = async (id) => {
    try {
      await client.connect();
      if (/\;/g.test(id)) {
        return "No SQL injections allowed";
      } else {
        const query = `SELECT * FROM narratives_stream WHERE id = '${id}';`;
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

  exports.getNarrativeModel = async (id) => {
    try {
      await client.connect();
      if (/\;/g.test(id)) {
        return "No SQL injections allowed";
      } else {
        const query = `SELECT * FROM narratives_stream WHERE id = '${id}';`;
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

