//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { updateCollectionModel, deleteCollectionModel, getCollectionModel, postCollectionModel, getAllEventsCollectionsModel } = require("../model/model");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}

exports.postCollection = async (req,res) => {
    const  { title } = req.params;
    const json = req.body;
    console.log('Title Controller==>', title)
    await postCollectionModel(json, title).then( () => {
        res.status(200).send('new collection data sent to Kafka')
    }) 
}

exports.updateCollection = async (req,res) => {
    const  { title } = req.params;
    const json = req.body;
    await updateCollectionModel(json, title).then( () => {
        res.status(200).send('collection data updated')
    }) 
}

exports.deleteCollection = async (req,res) => {
    const  { title } = req.params;
    await deleteCollectionModel(title).then( () => {
        res.status(200).send('collection data deleted')
    }) 
}

exports.getAllEventsCollections = async (req, res) => {
    const { title } = req.params;
    try{
        console.log(title)
        const data = await getAllEventsCollectionsModel(title);
        res.status(200).send(data.rows)
    }
    catch(error) {
        console.error('Error fetching TEI:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getCollection = async (req, res) => {
    const { title } = req.params;
    try{
        console.log(title)
        const data = await getCollectionModel(title);
        res.status(200).send(data)
    }
    catch(error) {
        console.error('Error fetching TEI:', error);
        res.status(500).send('Internal Server Error');
    }
}