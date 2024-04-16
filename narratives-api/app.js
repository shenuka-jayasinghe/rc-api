// sudo docker build -t shenukacj/narratives-api:0.0.1 . && sudo docker push shenukacj/narratives-api:0.0.1
const express = require('express');
const { healthCheck, updateNarrative, deleteNarrative, getNarrative, postNarrative, getAllEventsNarratives } = require('./controller/controller.js');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3006;

// Middleware to handle CORS
app.use(cors());

//middleware to extend payload sizes
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

// Middleware to parse JSON bodies
app.use(express.json());

// Use middleware to parse XML bodies
app.use(bodyParser.text({ type: 'text/xml' }));


// Define routes

app.get('/api/v1/narratives/healthcheck', healthCheck);

app.post('/api/v1/narratives/:id', postNarrative);

app.put('/api/v1/narratives/:id', updateNarrative);

app.delete('/api/v1/narratives/:id', deleteNarrative);

app.get('/api/v1/narratives/allEvents/:id', getAllEventsNarratives);

app.get('/api/v1/narratives/:id', getNarrative);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

