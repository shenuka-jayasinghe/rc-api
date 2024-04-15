const xmlparser = require("express-xml-bodyparser");
const { Kafka } = require("kafkajs");
const client = require("../db/connection");
const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KAFKA_CLIENT = process.env.KAFKA_CLIENT;


const kafka = new Kafka({
  clientId: "tei-template-api",
  brokers: [KAFKA_CLIENT], // Kafka broker addresses
  //change to 'kafka:9092' before containerising
});

const producer = kafka.producer();

async function sendToKafka(xmlData) {
  await producer.connect();
  console.log(`connected to Kafka client: ${KAFKA_CLIENT}`)

  await producer.send({
    topic: "tei-template-topic", // Kafka topic name
    messages: [{ value: xmlData }],
  });
  await producer.disconnect();
}

exports.newTei = async (xmlData, id) => {
  try {
    const xmlString = xmlData.toString();
    const payLoad = {
      event: "new-tei-posted",
      id,
      timestamp: Date.now(),
      tei_template: xmlString,
    };
    await sendToKafka(JSON.stringify(payLoad));
    console.log("XML data sent to Kafka topic.");
  } catch (error) {
    console.error("Error sending XML data to Kafka:", error);
    throw error;
  }
};

exports.updateTeiModel = async (xmlData, id) => {
  try {
    const xmlString = xmlData.toString();
    const payLoad = {
      event: "tei-updated",
      id,
      timestamp: Date.now(),
      tei_template: xmlString,
    };
    console.log(payLoad);
    await sendToKafka(JSON.stringify(payLoad));
    console.log("XML data sent to Kafka topic.");
  } catch (error) {
    console.error("Error sending XML data to Kafka:", error);
    throw error;
  }
};

exports.deleteTeiModel = async (id) => {
  try {
    const payLoad = {
      event: "deleted tei template",
      id,
      timestamp: Date.now(),
      tei: "",
    };
    await sendToKafka(JSON.stringify(payLoad));
    console.log("Delete event sent successfully to Kafka topic.");
  } catch (error) {
    console.error("Error deleting TEI", error);
    throw error;
  }
};

exports.getAllEventsTeiModel = async (id) => {
  try {
    await client.connect();
    if (/\;/g.test(id)) {
      return "No SQL injections allowed";
    } else {
      const query = `SELECT * FROM tei_template_stream WHERE id = '${id}';`;
      const { data, status, error } = await client.query(query);
      if (error) {
        console.error("Error returned by KsqlDB:", error);
        throw new Error(error);
      }
      console.log(data);
      return data;
    }

  } catch (err) {
    console.error("Error thrown while doing the query:", err);
    throw err;
  } finally {
    await client.disconnect();
  }
};


exports.getTeiModel = async (id) => {
  try {
    await client.connect();
    if (/\;/g.test(id)) {
      return "No SQL injections allowed";
    } else {
      const query = `SELECT * FROM tei_template_stream WHERE id = '${id}';`;
      const { data, status, error } = await client.query(query);
      if (error) {
        console.error("Error returned by KsqlDB:", error);
        throw new Error(error);
      }
      const latestEvent = data.rows[data.rows.length-1]
      console.log(latestEvent)
      return latestEvent;
    }

  } catch (err) {
    console.error("Error thrown while doing the query:", err);
    throw err;
  } finally {
    await client.disconnect();
  }
};