// sudo docker build -t shenukacj/tei2json-api:0.0.9 . && sudo docker push shenukacj/tei2json-api:0.0.9
const express = require('express');
const { healthCheck, cudlXslt } = require('./controller/controller.js');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Use middleware to parse XML bodies
app.use(bodyParser.text({ type: 'text/xml' }));


// Define routes

app.get('/api/v1/tei2json/healthcheck', healthCheck);

app.post('/api/v1/tei2json/cudl-xslt/:id',  cudlXslt);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

