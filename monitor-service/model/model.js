const { Kafka } = require("kafkajs");
const client = require("../db/connection");
const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;

const kafka = new Kafka({
  clientId: "monitor-api",
  brokers: [KAFKA_CLIENT], // Kafka broker addresses
});

const producer = kafka.producer();

async function sendToKafka(payLoad) {
  await producer.connect();
  await producer.send({
    topic: "monitor-topic", // Kafka topic name
    messages: [{ value: payLoad }],
  });
  await producer.disconnect();
}

exports.produceEvent = async (payLoad) => {
  try {
    await sendToKafka(JSON.stringify(payLoad));
    console.log(`new event data successfully sent to Kafka monitor-topic ${payLoad}`);
  } catch (error) {
    console.error("Error sending JSON data to Kafka:", error);
    throw error;
  }
};

exports.getEventsModel = async (id) => {
    try {
      await client.connect();
      if (/\;/g.test(id)) {
        return "No SQL injections allowed";
      } else {
        const query = `SELECT * FROM monitor_stream WHERE id = '${id}';`;
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

  exports.getLastEventModel = async (id) => {
    try {
      await client.connect();
      if (/\;/g.test(id)) {
        return "No SQL injections allowed";
      } else {
        const query = `SELECT * FROM monitor_stream WHERE id = '${id}';`;
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

