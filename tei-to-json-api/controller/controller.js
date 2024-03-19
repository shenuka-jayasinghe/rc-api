//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { testPost, produceMessage } = require("../model/producer");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postTEI = async (req,res) => {
    const message = req.body;
    
    try {
        await produceMessage(message);
        res.status(200).send('Message sent to Kafka successfully');
        console.log('TEI Message sent to Kafka successfully')

    }
    catch(error) {
        console.error('Error producing message: ', error);
        res.status(500).send('Internal Server Error');
    }
}
