//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { newTei } = require("../model/producer");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postNewTei = async (req,res) => {
    let xmlData = '';
    const { title } = req.params

    // Accumulate data chunks
    req.on('data', chunk => {
        xmlData += chunk.toString(); // Convert buffer to string
    });

    // Once request data ends, respond with the received XML data
    req.on('end', async () => {
        try {
            // Process XML data
            await newTei(xmlData, title);
            // Respond with the same XML data
            res.status(200).set('Content-Type', 'text/xml').send('xmlData');
        } catch (error) {
            console.error('Error processing XML data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
}
