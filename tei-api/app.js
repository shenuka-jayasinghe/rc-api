// sudo docker build -t shenukacj/tei-api:0.0.4 . && sudo docker push shenukacj/tei-api:0.0.4
const express = require('express');
const { healthCheck, postNewTei} = require('./controller/controller');
// const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');

const app = express();
const port = 3003;

// Middleware to parse JSON bodies
// app.use(express.json());

// Use middleware to parse XML bodies
// app.use(xmlParser());
app.use(bodyParser.text({ type: 'text/xml' }));


// Define routes

app.get('/api/v1/TEI/healthcheck', healthCheck);

app.post('/api/v1/TEI/:title', postNewTei);

app.get('/api/')

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
