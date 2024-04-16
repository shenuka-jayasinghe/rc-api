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

    const mappedTei = mapToTei(narrativesJsonString, teiTemplate, mappingJsonArrayString)
    console.log(mappedTei)
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });

async function mapToTei(narrativesJsonString,teiTemplate, mappingJsonArrayString) {
    // Read TEI template file
    const mappingJsonArray = JSON.parse(mappingJsonArrayString)
    const narrativesJson = JSON.parse(narrativesJsonString);
    const dataArrayofObj = narrativesJson.data.enarratives.ObjObjectsRef_tab;
  
    // Iterate over each object in the JSON data
    const outputTei = [];
    dataArrayofObj.forEach((item) => {
      let mappedTei = teiTemplate;
  
      // Iterate over each mapping rule
      mappingJsonArray.forEach((mappingJson) => {
        // Check if the mapping rule applies to the current item
        if (mappingJson.key) {
          const foundItems = item[mappingJson.key];
  
          // Check if the key exists in the current item
          if (foundItems) {
            let mapString = '';
  
            // Handle array data
            if (Array.isArray(foundItems) && foundItems.length > 0) {
              let limitItems = [];
  
              // Apply limit if specified
              if (mappingJson.limit) {
                limitItems = foundItems.slice(0, Number(mappingJson.limit));
              } else {
                limitItems = [...foundItems];
              }
  
              // Handle multiple items
              if (limitItems.length > 0) {
                // Apply join if specified
                mapString = mappingJson.join ? limitItems.join(mappingJson.join) : limitItems[0];
  
                // Apply function if specified
                if (mappingJson.function) {
                  const functionBody = mappingJson.function.match(/return (.+);/)[1];
                  const dynamicFunction = new Function("key", "value", functionBody);
                  mapString = dynamicFunction(mappingJson.key, mapString);
                }
              }
            }
  
            // Replace string in TEI template
            const replaceWith = mappingJson.outerstart && mappingJson.outerend
              ? mappingJson.outerstart + mapString + mappingJson.outerend
              : mapString;
  
            mappedTei = mappedTei.replace(mappingJson.search, replaceWith);
          }
        } else if (mappingJson.replace) {
          // Replace string in TEI template
          mappedTei = mappedTei.replace(mappingJson.search, mappingJson.replace);
        } else {
          console.log("There is no key or replace field in the mapping JSON.");
        }
      });
  
    //   console.log(mappedTei); // Output the mapped TEI template
      outputTei.push(mappedTei)
    });
    return outputTei
  }
  