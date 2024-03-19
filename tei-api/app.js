const express = require('express');
const { healthCheck, postTEI } = require('./controller/controller');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
// app.use(express.json());

// Use middleware to parse XML bodies
// app.use(xmlParser());
app.use(bodyParser.text({ type: 'text/xml' }));


// Define routes

app.get('/api/v1/TEI/healthcheck', healthCheck);

app.post('/api/v1/TEI', postTEI);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
