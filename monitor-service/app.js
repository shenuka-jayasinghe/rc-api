// sudo docker build -t shenukacj/monitor-service:0.0.1 . && sudo docker push shenukacj/monitor-service:0.0.1
const express = require('express');
const { healthCheck, getEvents, getLastEvent } = require('./controller/controller.js');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { runConsumer } = require('./consumer/consumer.js');

const app = express();
const port = 3007;

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

app.get('/api/v1/monitor/healthcheck', healthCheck);

app.get('/api/v1/monitor/:id', getEvents);

app.get('/api/v1/monitor/last/:id', getLastEvent);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//Run Consumer
runConsumer();