exports.testPost = (testData) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Data saved:', testData);
            resolve();
        }, 1000); // Simulating 1 second delay
    });
}

// kafkaService.js

const { Kafka } = require('kafkajs');
const xml = require('xml-js');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

exports.produceMessage = async (messageJSON) => {
// Stringify the XML message
const message = xml.js2xml(messageJSON, { compact: true, spaces: 4 });
 
  await producer.connect();
  await producer.send({
    topic: 'test-topic',
    messages: [
      { value: message }
    ],
  });
  await producer.disconnect();
}



