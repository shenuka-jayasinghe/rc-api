const { Kafka } = require('kafkajs');
const { processDataWithDocker } = require('../utils/xslt-processor');
//sudo docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka:9092'] // Kafka broker addresses
});

const producer = kafka.producer();



async function sendToKafka(payLoad) {
    await producer.connect();
    await producer.send({
        topic: 'json-topic', // Kafka topic name
        messages: [{ value: payLoad }]
    });
    await producer.disconnect();
}

exports.processXml = async (xmlData, title) => {
    try {
        const xmlString = xmlData.toString();
        const processedData = await processDataWithDocker(xmlString, false); //true for 'sudo docker'
        const dataJSONstring = JSON.stringify(processedData);
        const payLoad = {
            event: 'new-xslt-transformation',
            title,
            type:'cudl-xslt',
            timestamp: Date.now(),
            json: dataJSONstring
        }
        console.log(payLoad)
        await sendToKafka(JSON.stringify(payLoad));
        console.log('JSON data successfully sent to Kafka')
        return processedData
    } catch (error) {
        console.error('Error sending JSON data to Kafka:', error);
        throw error;
    }
}

