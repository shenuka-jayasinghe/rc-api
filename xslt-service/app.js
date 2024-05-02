// sudo docker build -t shenukacj/mdc-xslt:0.0.1 . && sudo docker push shenukacj/mdc-xslt:0.0.1
const express = require('express');
const { healthCheck, xslt } = require('./controller/controller.js');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { runConsumer } = require('./consumer/consumer.js');

const app = express();
const port = 3009;

//Middleware to handle CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Use middleware to parse XML bodies
app.use(bodyParser.text({ type: 'text/xml' }));


// Define routes

app.get('/api/v1/xslt/healthcheck', healthCheck);
app.post('/api/v1/xslt/:id',  xslt);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// run consumer
runConsumer();