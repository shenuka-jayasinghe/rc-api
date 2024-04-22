//you can double check in the kafka topic using:
//docker exec -it kafka /opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
const { getEventsModel, getLastEventModel  } = require("../model/model");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello!')
}


exports.getEvents = async (req, res) => {
    const { id } = req.params;
    try{
        console.log(id)
        const data = await getEventsModel(id);
        res.status(200).send(data.rows)
    }
    catch(error) {
        console.error('Error fetching event(s):', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getLastEvent = async (req, res) => {
    const { id } = req.params;
    try{
        console.log(id)
        const data = await getLastEventModel(id);
        res.status(200).send(data)
    }
    catch(error) {
        console.error('Error fetching event:', error);
        res.status(500).send('Internal Server Error');
    }
}