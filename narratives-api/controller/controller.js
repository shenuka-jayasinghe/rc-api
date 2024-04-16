//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { updateNarrativeModel, deleteNarrativeModel, getNarrativeModel, postNarrativeModel, getAllEventsNarrativesModel } = require("../model/model");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postNarrative = async (req,res) => {
    const  { id } = req.params;
    const json = req.body;
    await postNarrativeModel(json, id).then( () => {
        res.status(200).send('new JSON data sent to Kafka')
    }) 
}

exports.updateNarrative = async (req,res) => {
    const  { id } = req.params;
    const json = req.body;
    await updateNarrativeModel(json, id).then( () => {
        res.status(200).send('Narratives data updated')
    }) 
}

exports.deleteNarrative = async (req,res) => {
    const  { id } = req.params;
    await deleteNarrativeModel(id).then( () => {
        res.status(200).send('Narratives data deleted')
    }) 
}

exports.getAllEventsNarratives = async (req, res) => {
    const { id } = req.params;
    try{
        console.log(id)
        const data = await getAllEventsNarrativesModel(id);
        res.status(200).send(data.rows)
    }
    catch(error) {
        console.error('Error fetching mapping item:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getNarrative = async (req, res) => {
    const { id } = req.params;
    try{
        console.log(id)
        const data = await getNarrativeModel(id);
        res.status(200).send(data)
    }
    catch(error) {
        console.error('Error fetching mapping item:', error);
        res.status(500).send('Internal Server Error');
    }
}