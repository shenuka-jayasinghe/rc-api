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

exports.newTei = async (xmlData, title) => {
    try {
        const xmlString = xmlData.toString();
        const payLoad = {
            event: 'New TEI posted',
            title,
            timestamp: Date.now(),
            tei: xmlString
        }
        console.log(payLoad)
        await sendToKafka(JSON.stringify(payLoad));
        console.log('XML data sent to Kafka topic.');
    } catch (error) {
        console.error('Error sending XML data to Kafka:', error);
        throw error;
    }
}

