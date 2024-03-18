// server.js

const express = require('express');
const { healthCheck, postTest } = require('./tei-controller.js/controller');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.get('/', healthCheck);

app.get('/api/v1/TEI/healthcheck', healthCheck);

app.post('/api/v1/TEI/test', postTest)

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
