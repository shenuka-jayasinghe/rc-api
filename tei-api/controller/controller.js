//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { processXml } = require("../model/producer");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postTEI = async (req,res) => {
    try {
        await processXml(req.body);
        res.status(200).send('XML data processed and sent to Kafka topic.');
    } catch (error) {
        console.error('Error processing XML data:', error);
        res.status(500).send('Internal Server Error');
    }
}
