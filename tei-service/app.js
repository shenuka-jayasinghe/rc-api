// sudo docker build -t shenukacj/tei-api:0.0.10 . && sudo docker push shenukacj/tei-api:0.0.10
const express = require('express');
const { healthCheck, postNewTei, updateTei, deleteTei, getTei, getAllEventsTei} = require('./controller/controller');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.text({ type: 'text/xml' }));

// Middleware to handle CORS
app.use(cors());


app.get('/api/v1/tei/healthcheck', healthCheck);

app.post('/api/v1/tei/:id', postNewTei);

app.put('/api/v1/tei/:id', updateTei);

app.delete('/api/v1/tei/:id', deleteTei);

app.get('/api/v1/tei/:id', getTei);

app.get('/api/v1/tei/allEvents/:id', getAllEventsTei);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
