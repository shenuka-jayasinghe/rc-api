const { Kafka } = require('kafkajs');
//sudo docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'] // Kafka broker addresses
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

exports.processXml = async (xmlData) => {
    try {
        const xmlString = xmlData.toString();
        await sendToKafka(xmlString);
        console.log('XML data sent to Kafka topic.');
    } catch (error) {
        console.error('Error sending XML data to Kafka:', error);
        throw error;
    }
}

