// sudo docker build -t shenukacj/collections-api:0.0.25 . && sudo docker push shenukacj/collections-api:0.0.25
const express = require('express');
const { healthCheck, updateCollection, deleteCollection, getCollection, postCollection, getAllEventsCollections, getAllCollections } = require('./controller/controller.js');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { runConsumer } = require('./consumer/consumer.js');

const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const PORT = process.env.PORT;

const app = express();

// Middleware to handle CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

//middleware to extend payload sizes
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));


// Define routes

app.get('/api/v1/collections/healthcheck', healthCheck);

app.post('/api/v1/collections/:title', postCollection);

app.put('/api/v1/collections/:title', updateCollection);

app.delete('/api/v1/collections/:title', deleteCollection);

app.get('/api/v1/collections/allEvents/:title', getAllEventsCollections);

app.get('/api/v1/collections/:title', getCollection);

app.get('/api/v1/collections', getAllCollections);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

//Run Consumer
runConsumer().catch(console.error);
