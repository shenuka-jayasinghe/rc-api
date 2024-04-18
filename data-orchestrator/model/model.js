const ENV = process.env.NODE_ENV || "local";
const axios = require("axios");
const { mapToTei } = require("../utils/narratives2tei");
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`;
require("dotenv").config({ path: pathToEnvFile });

const mappingUrl = process.env.MAPPING_URL;
const narrativesUrl = process.env.NARRATIVES_URL;
const tei2jsonUrl = process.env.TEI2JSON_URL;
const teiTemplateUrl = process.env.TEI_TEMPLATE_URL;
const teiUrl = process.env.TEI_URL;
const jsonUrl = process.env.JSON_URL;

async function processNarratives(id, narrativeMessageString) {
  try {
    const narrativeMessage = JSON.parse(narrativeMessageString);
    const narrativeJsonString = JSON.stringify(narrativeMessage.json);

    // Fetch TEI template
    const teiTemplateResponse = await axios.get(
      `${teiTemplateUrl}/api/v1/tei/template/${id}`
    );
    const teiTemplateMessage = teiTemplateResponse.data;
    const teiTemplateString = teiTemplateMessage["TEI_TEMPLATE"];

    // Fetch mapping
    const mappingResponse = await axios.get(
      `${mappingUrl}/api/v1/mapping/${id}`
    );
    console.log("get", `${mappingUrl}/api/v1/mapping/${id}`);
    const mappingMessage = mappingResponse.data;
    const mappingString = mappingMessage["JSON"];

    // Perform mapping to TEI
    const processedTeis = await mapToTei(
      narrativeJsonString,
      teiTemplateString,
      mappingString
    );

    // Convert TEI to JSON
    for (const idAndTei of processedTeis) {
      try {
        const options = {
          method: "post",
          url: `${tei2jsonUrl}/api/v1/tei2json/cudl-xslt/${idAndTei.id}`,
          data: idAndTei.tei,
        };
        const jsonResponse = await axios(options);
        console.log("Successfully converted TEI to JSON:", jsonResponse.data);
      } catch (error) {
        console.error("Error converting TEI to JSON:", error);
      }
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Server responded with error:", error.response.status);
      console.error("Error data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }
    // Rethrow the error for the caller to handle if needed
    throw error;
  }
}

module.exports = { processNarratives };