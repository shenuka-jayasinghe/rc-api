const xmlparser = require('express-xml-bodyparser');
const { Kafka } = require('kafkajs');
const client = require('../db/connection')
const { v4: uuidv4 } = require('uuid');


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka:9092'] // Kafka broker addresses
});

const producer = kafka.producer();

async function sendToKafka(xmlData) {
    await producer.connect();

    await producer.send({
        topic: 'xml-topic', // Kafka topic name
        messages: [{ value: xmlData }]
    });
    await producer.disconnect();
}

exports.produceXml = async (xmlData) => {
    try {
        const xmlString = xmlData.toString();
        await sendToKafka(xmlString);
        console.log('XML data sent to Kafka topic.');
    } catch (error) {
        console.error('Error sending XML data to Kafka:', error);
        throw error;
    }
}

function generateId() {
    return uuidv4(); // Using UUID to generate unique IDs
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


