const xmlparser = require("express-xml-bodyparser");
const { Kafka } = require("kafkajs");
const client = require("../db/connection");

const kafka = new Kafka({
  clientId: "my-app2",
  brokers: ["kafka:9092"], // Kafka broker addresses
  //change to 'kafka:9092' before containerising
});

const producer = kafka.producer();

async function sendToKafka(xmlData) {
  await producer.connect();

  await producer.send({
    topic: "tei-topic", // Kafka topic name
    messages: [{ value: xmlData }],
  });
  await producer.disconnect();
}

exports.newTei = async (xmlData, title) => {
  try {
    const xmlString = xmlData.toString();
    const payLoad = {
      event: "new-tei-posted",
      title,
      timestamp: Date.now(),
      tei: xmlString,
    };
    console.log("PAYLOAD==>", payLoad);
    await sendToKafka(JSON.stringify(payLoad));
    console.log("XML data sent to Kafka topic.");
  } catch (error) {
    console.error("Error sending XML data to Kafka:", error);
    throw error;
  }
};

exports.updateTeiModel = async (xmlData, title) => {
  try {
    const xmlString = xmlData.toString();
    const payLoad = {
      event: "tei-updated",
      title,
      timestamp: Date.now(),
      tei: xmlString,
    };
    console.log(payLoad);
    await sendToKafka(JSON.stringify(payLoad));
    console.log("XML data sent to Kafka topic.");
  } catch (error) {
    console.error("Error sending XML data to Kafka:", error);
    throw error;
  }
};

exports.deleteTeiModel = async (title) => {
  try {
    const payLoad = {
      event: "deleted",
      title,
      timestamp: Date.now(),
      tei: "",
    };
  } catch (error) {
    console.error("Error deleting TEI", error);
    throw error;
  }
};

exports.getTeiModel = async (title) => {
  try {
    await client.connect();
    if (/\;/g.test(title)) {
      return "No SQL injections allowed";
    } else {
      const query = `SELECT * FROM tei_stream WHERE title = '${title}';`;
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
