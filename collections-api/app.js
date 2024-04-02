// sudo docker build -t shenukacj/collections-api:0.0.1 . && sudo docker push shenukacj/collections-api:0.0.1
const express = require('express');
const { healthCheck, updateCollection, deleteCollection, getCollection, postCollection, getAllEventsCollections } = require('./controller/controller.js');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3003;

// Middleware to handle CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());


// Define routes

app.get('/api/v1/collections/healthcheck', healthCheck);

app.post('/api/v1/collections/:title', postCollection);

app.put('/api/v1/collections/:title', updateCollection);

app.delete('/api/v1/collections/:title', deleteCollection);

app.get('/api/v1/collections/allEvents/:title', getAllEventsCollections);

app.get('/api/v1/collections/:title', getCollection);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

