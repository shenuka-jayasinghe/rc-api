// sudo docker build -t shenukacj/json-api:0.0.8 . && sudo docker push shenukacj/json-api:0.0.8
const express = require('express');
const { healthCheck, updateMapping, deleteMapping, getMapping, postMapping, getAllEventsMapping } = require('./controller/controller.js');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3005;

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

app.get('/api/v1/mapping/healthcheck', healthCheck);

app.post('/api/v1/mapping/:id', postMapping);

app.put('/api/v1/mapping/:id', updateMapping);

app.delete('/api/v1/mapping/:id', deleteMapping);

app.get('/api/v1/mapping/allEvents/:id', getAllEventsMapping);

app.get('/api/v1/mapping/:id', getMapping);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

