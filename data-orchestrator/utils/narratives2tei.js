

async function mapToTei(narrativesJsonString,teiTemplate, mappingJsonArrayString) {
    // Read TEI template file
    console.log(`
    typeof narrativesJsonString ==> ${typeof narrativesJsonString} \
    typeof teiTemplate ==> ${typeof teiTemplate} \
    typeof mappingJsonArrayString ==> ${typeof mappingJsonArrayString} \
    `)
    const mappingJsonArray = JSON.parse(mappingJsonArrayString)
    const narrativesJson = JSON.parse(narrativesJsonString);
    const dataArrayofObj = narrativesJson.data.enarratives.ObjObjectsRef_tab;
  
    // Iterate over each object in the JSON data
    const outputArray = [];
    dataArrayofObj.forEach((item) => {
      let mappedTei = teiTemplate;
      const id = item.irn
  
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
        } 
      });
      const idAndTei = {
        id,
        tei: mappedTei
      }
      outputArray.push(idAndTei)
    });
    return outputArray
  }
  
module.exports = { mapToTei }