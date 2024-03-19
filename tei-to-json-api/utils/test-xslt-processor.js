const fs = require('fs');
const { processDataWithDocker } = require('./xslt-processor');

const xmlFilePath = `${__dirname}/data.xml`;

fs.readFile(xmlFilePath, 'utf8', (err, xmlData) => {
  if (err) {
    console.error("Error reading XML file:", err);
    return;
  }

  processDataWithDocker(xmlData, true)
    .then((jsonData) => {
      console.log("JSON data:", jsonData);
    })
    .catch((err) => {
      console.error("Error:", err);
    });
});
