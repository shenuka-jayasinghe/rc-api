const express = require('express');
const { healthCheck, postTEI } = require('./tei-controller.js/controller');
const xmlParser = require('express-xml-bodyparser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use middleware to parse XML bodies
app.use(xmlParser());


// Define routes

app.get('/api/v1/TEI/healthcheck', healthCheck);

app.post('/api/v1/TEI', postTEI);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
