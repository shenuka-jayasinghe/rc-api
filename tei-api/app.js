// sudo docker build -t shenukacj/tei-api:0.0.7 . && sudo docker push shenukacj/tei-api:0.0.7
const express = require('express');
const { healthCheck, postNewTei, updateTei, deleteTei, getTei, getAllEventsTei} = require('./controller/controller');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.text({ type: 'text/xml' }));



app.get('/api/v1/TEI/healthcheck', healthCheck);

app.post('/api/v1/TEI/:title', postNewTei);

app.put('/api/v1/TEI/:title', updateTei);

app.delete('/api/v1/TEI/:title', deleteTei);

app.get('/api/v1/TEI/:title', getTei);

app.get('/api/v1/TEI/allEvents/:title', getAllEventsTei);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
