// sudo docker build -t shenukacj/tei-api:0.0.8 . && sudo docker push shenukacj/tei-api:0.0.8
const express = require('express');
const { healthCheck, postNewTei, updateTei, deleteTei, getTei, getAllEventsTei} = require('./controller/controller');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.text({ type: 'text/xml' }));



app.get('/api/v1/TEI/healthcheck', healthCheck);

app.post('/api/v1/TEI/:id', postNewTei);

app.put('/api/v1/TEI/:id', updateTei);

app.delete('/api/v1/TEI/:id', deleteTei);

app.get('/api/v1/TEI/:id', getTei);

app.get('/api/v1/TEI/allEvents/:id', getAllEventsTei);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
