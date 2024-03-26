// sudo docker build -t shenukacj/json-api:0.0.2 . && sudo docker push shenukacj/json-api:0.0.2
const express = require('express');
const { healthCheck, updateJson, deleteJson, getJson, postJson, getAllEventsJson } = require('./controller/controller.js');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');

const app = express();
const port = 3002;

// Middleware to parse JSON bodies
app.use(express.json());

// Use middleware to parse XML bodies
app.use(bodyParser.text({ type: 'text/xml' }));


// Define routes

app.get('/api/v1/json/healthcheck', healthCheck);

app.post('/api/v1/json/:id', postJson);

app.put('/api/v1/json/:id', updateJson);

app.delete('/api/v1/json/:id', deleteJson);

app.get('/api/v1/json/allEvents/:id', getAllEventsJson);

app.get('/api/v1/json/:id', getJson);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

