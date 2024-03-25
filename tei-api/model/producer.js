const xmlparser = require('express-xml-bodyparser');
const { Kafka } = require('kafkajs');
const client = require('../db/connection')

const kafka = new Kafka({
    clientId: 'my-app2',
    brokers: ['kafka:9092'] // Kafka broker addresses
    //change to 'kafka:9092' before containerising
});

const producer = kafka.producer();

async function sendToKafka(xmlData) {
    await producer.connect();

    await producer.send({
        topic: 'new-topic', // Kafka topic name
        messages: [{ value: xmlData }]
    });
    await producer.disconnect();
}

exports.produceXml = async (xmlData) => {
    try {
        const xmlString = xmlData.toString();
        const payLoad = {
            id: 'testId',
            timestamp: Date.now(),
            tei: xmlString
        }
        await sendToKafka(JSON.stringify(payLoad));
        console.log('XML data sent to Kafka topic.');
    } catch (error) {
        console.error('Error sending XML data to Kafka:', error);
        throw error;
    }
}

exports.insert2ksql = async (xmlData) => {
    try {
        const xmlString = xmlData.toString();
        // Construct the TEI data object
        const timestamp = Date.now();
        console.log(timestamp)
        const row = {
            id: 'randomid',
            timestamp: timestamp,
            tei: xmlString
        };
        const { status, error } = await client.insertInto('TEI', row);

        if (error) {
            throw new Error(`Error posting TEI data to ksqlDB: ${error}`);
        }
        console.log('TEI data posted to ksqlDB.');
        return { status };
    } catch (error) {
        console.error('Error posting TEI data:', error);
        throw error;
    }
}


// echo '{"id":"testId","timestamp":1648575075000,"tei":"<xml>Data</xml>"}' | kafka-console-producer.sh --broker-list kafka:9092 --topic test-topic
