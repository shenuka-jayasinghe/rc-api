const { Kafka } = require("kafkajs");
const client = require("../db/connection");
//sudo docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"], // Kafka broker addresses
});

const producer = kafka.producer();

async function sendToKafka(payLoad) {
  await producer.connect();
  await producer.send({
    topic: "json-topic", // Kafka topic name
    messages: [{ value: payLoad }],
  });
  await producer.disconnect();
}

exports.postJsonModel = async (json, title) => {
  try {
    const payLoad = {
      event: "new-json-item",
      title,
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

exports.updateJsonModel = async (updatedJson, title) => {
  try {
    const payLoad = {
        event: "updated-json",
        title,
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

exports.deleteJsonModel = async (title) => {
    try {
      const payLoad = {
          event: "deleted-json",
          title,
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

exports.getAllEventsJsonModel = async (title) => {
    try {
      await client.connect();
      if (/\;/g.test(title)) {
        return "No SQL injections allowed";
      } else {
        const query = `SELECT * FROM json_stream WHERE title = '${title}';`;
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

  exports.getJsonModel = async (title) => {
    try {
      await client.connect();
      if (/\;/g.test(title)) {
        return "No SQL injections allowed";
      } else {
        const query = `SELECT * FROM json_stream WHERE title = '${title}';`;
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

