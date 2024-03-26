//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { updateJsonModel, deleteJsonModel, getJsonModel, postJsonModel, getAllEventsJsonModel } = require("../model/model");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postJson = async (req,res) => {
    const  { title } = req.params;
    const json = req.body;
    await postJsonModel(json, title).then( () => {
        res.status(200).send('new JSON data sent to Kafka')
    }) 
}

exports.updateJson = async (req,res) => {
    const  { title } = req.params;
    const json = req.body;
    await updateJsonModel(json, title).then( () => {
        res.status(200).send('JSON data updated')
    }) 
}

exports.deleteJson = async (req,res) => {
    const  { title } = req.params;
    await deleteJsonModel(title).then( () => {
        res.status(200).send('JSON data deleted')
    }) 
}

exports.getAllEventsJson = async (req, res) => {
    const { title } = req.params;
    try{
        console.log(title)
        const data = await getAllEventsJsonModel(title);
        res.status(200).send(data.rows)
    }
    catch(error) {
        console.error('Error fetching TEI:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getJson = async (req, res) => {
    const { title } = req.params;
    try{
        console.log(title)
        const data = await getJsonModel(title);
        res.status(200).send(data)
    }
    catch(error) {
        console.error('Error fetching TEI:', error);
        res.status(500).send('Internal Server Error');
    }
}