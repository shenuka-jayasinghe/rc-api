//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { produceXml, insert2ksql } = require("../model/producer");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postTEI = async (req,res) => {
    let xmlData = '';

    // Accumulate data chunks
    req.on('data', chunk => {
        xmlData += chunk.toString(); // Convert buffer to string
    });

    // Once request data ends, respond with the received XML data
    req.on('end', async () => {
        try {
            // Process XML data
            await produceXml(xmlData);
            // Respond with the same XML data
            res.status(200).set('Content-Type', 'text/xml').send('xmlData');
        } catch (error) {
            console.error('Error processing XML data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
}
