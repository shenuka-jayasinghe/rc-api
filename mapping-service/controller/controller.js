//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { updateMappingModel, deleteMappingModel, getMappingModel, postMappingModel, getAllEventsMappingModel } = require("../model/model");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postMapping = async (req,res) => {
    const  { id } = req.params;
    const json = req.body;
    await postMappingModel(json, id).then( () => {
        res.status(200).send('new JSON data sent to Kafka')
    }) 
}

exports.updateMapping = async (req,res) => {
    const  { id } = req.params;
    const json = req.body;
    await updateMappingModel(json, id).then( () => {
        res.status(200).send('Mapping data updated')
    }) 
}

exports.deleteMapping = async (req,res) => {
    const  { id } = req.params;
    await deleteMappingModel(id).then( () => {
        res.status(200).send('Mapping data deleted')
    }) 
}

exports.getAllEventsMapping = async (req, res) => {
    const { id } = req.params;
    try{
        console.log(id)
        const data = await getAllEventsMappingModel(id);
        res.status(200).send(data.rows)
    }
    catch(error) {
        console.error('Error fetching mapping item:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getMapping = async (req, res) => {
    const { id } = req.params;
    try{
        console.log(id)
        const data = await getMappingModel(id);
        res.status(200).send(data)
    }
    catch(error) {
        console.error('Error fetching mapping item:', error);
        res.status(500).send('Internal Server Error');
    }
}