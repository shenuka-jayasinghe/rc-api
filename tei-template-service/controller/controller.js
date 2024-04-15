//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { newTei, updateTeiModel, deleteTeiModel, getTeiModel, getAllEventsTeiModel } = require("../model/model");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postNewTei = async (req,res) => {
    let xmlData = '';
    const { id } = req.params

    // Accumulate data chunks
    req.on('data', chunk => {
        xmlData += chunk.toString(); // Convert buffer to string
    });

    // Once request data ends, respond with the received XML data
    req.on('end', async () => {
        try {
            // Process XML data
            await newTei(xmlData, id);
            // Respond with the same XML data
            res.status(200).set('Content-Type', 'text/xml').send(xmlData);
        } catch (error) {
            console.error('Error processing XML data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
}


exports.updateTei = async (req,res) => {
    let xmlData = '';
    const { id } = req.params

    // Accumulate data chunks
    req.on('data', chunk => {
        xmlData += chunk.toString(); // Convert buffer to string
    });

    // Once request data ends, respond with the received XML data
    req.on('end', async () => {
        try {
            // Process XML data
            await updateTeiModel(xmlData, id);
            // Respond with the same XML data
            res.status(200).set('Content-Type', 'text/xml').send(xmlData);
        } catch (error) {
            console.error('Error processing XML data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
}

exports.deleteTei = async (req,res) => {
    const  { id } = req.params
    try {
        await deleteTeiModel(id);
        res.status(200).send('TEI template deleted successfully');
    }
    catch (error) {
        console.error('Error deleting TEI template:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getAllEventsTei = async (req,res) => {
    const { id } = req.params;
    try{
        console.log(id)
        const data = await getAllEventsTeiModel(id);
        res.status(200).send(data.rows)
    }
    catch(error) {
        console.error('Error fetching TEI template:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getTei = async (req,res) => {
    const { id } = req.params;
    try{
        console.log(id)
        const data = await getTeiModel(id);
        res.status(200).send(data)
    }
    catch(error) {
        console.error('Error fetching TEI template:', error);
        res.status(500).send('Internal Server Error');
    }
}