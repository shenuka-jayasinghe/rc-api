const { mapToTei } = require("./narratives2tei");

const fs = require("fs").promises;

// Example usage:
const mappingFile = "./mapping.json";
const jsonFile = "./10397_20240407.json";
const templateFile = "template.xml";
const outputFile = "output.xml";

const teiTemplatePromise = fs.readFile(templateFile, 'utf-8');
const narrativesJsonStringPromise = fs.readFile(jsonFile, 'utf-8');
const mappingJsonArrayPromise = fs.readFile(mappingFile, 'utf-8')

Promise.all([teiTemplatePromise, narrativesJsonStringPromise, mappingJsonArrayPromise])
  .then(([teiTemplate, narrativesJsonString, mappingJsonArrayString]) => {

    return mappedTei = mapToTei(narrativesJsonString, teiTemplate, mappingJsonArrayString)
  })
  .then((mappedTei) => {
    console.log(mappedTei)
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });