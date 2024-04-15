// sudo docker build -t shenukacj/tei-template-api:0.0.5 . && sudo docker push shenukacj/tei-template-api:0.0.5
const express = require('express');
const { healthCheck, postNewTei, updateTei, deleteTei, getTei, getAllEventsTei} = require('./controller/controller');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3004;

app.use(bodyParser.text({ type: 'text/xml' }));

// Middleware to handle CORS
app.use(cors());


app.get('/api/v1/tei/template/healthcheck', healthCheck);

app.post('/api/v1/tei/template/:id', postNewTei);

app.put('/api/v1/tei/template/:id', updateTei);

app.delete('/api/v1/tei/template/:id', deleteTei);

app.get('/api/v1/tei/template/:id', getTei);

app.get('/api/v1/tei/template/allEvents/:id', getAllEventsTei);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
