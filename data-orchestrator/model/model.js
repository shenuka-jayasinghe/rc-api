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

async function sendToTeiQueue(id, tei) {
  console.log(`TEI URL ==> ${teiUrl}`)
  try {
    const options = {
      method: "post",
      url: `${teiUrl}/api/v1/tei/${id}`,
      data: tei,
    };
    const jsonResponse = await axios(options);
    console.log("Successfully sent to TEI Queue:", jsonResponse.data);
    return jsonResponse.data; // Return the converted JSON data
  } catch (error) {
    console.error("Error sending to TEI Queue", error);
    throw error; // Rethrow the error for the caller to handle if needed
  }
}

async function fetchData(url, errorMessage) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(errorMessage, error.message);
    return null;
  }
}

async function processNarratives(id, narrativeMessageString) {
  try {
    console.log(`
    MAPPING_URL ==> ${mappingUrl}
    TEI_TEMPLATE_URL => ${teiTemplateUrl}
    `);
    const narrativeMessage = JSON.parse(narrativeMessageString);
    const narrativeJsonString = JSON.stringify(narrativeMessage.json);

    const teiTemplateMessage = await fetchData(
      `${teiTemplateUrl}/api/v1/tei/template/${id}`,
      `TEI template not available yet for id ${id}`
    );
    if (!teiTemplateMessage) return;

    const teiTemplateString = teiTemplateMessage["TEI_TEMPLATE"];

    const mappingMessage = await fetchData(
      `${mappingUrl}/api/v1/mapping/${id}`,
      `Mapping not available yet for id ${id}`
    );
    if (!mappingMessage) return;

    console.log("get", `${mappingUrl}/api/v1/mapping/${id}`);
    const mappingString = mappingMessage["JSON"];

    const narrativesMessage = await fetchData(
      `${narrativesUrl}/api/v1/narratives/${id}`,
      `Narratives not available yet for id ${id}`
    );
    if (!narrativesMessage) return;

    console.log("get", `${narrativesUrl}/api/v1/narratives/${id}`);
    const narrativesString = narrativesMessage["JSON"];

    const processedTeis = await mapToTei(
      narrativeJsonString,
      teiTemplateString,
      mappingString
    );

    // Convert TEI to JSON
    for (let i = 0; i < processedTeis.length; i++) {
      const idAndTei = processedTeis[i];
      try {
        await sendToTeiQueue(idAndTei.id, idAndTei.tei);
        console.log(`Processing item ${i + 1} out of ${processedTeis.length}`);
        if (i === processedTeis.length - 1) {
          console.log(`==================================
    *** Successfully to TEI Queue ***
    ==================================
    `);
        }
      } catch (error) {
        // Handle error if needed
      }
    }
  } catch (error) {
    console.error("Error processing narratives:", error.message);
    throw error;
  }
}

async function processMapping(id, mappingMessageString) {
  try {
    console.log(`
    NARRATIVES_URL ==> ${narrativesUrl}
    TEI_TEMPLATE_URL => ${teiTemplateUrl}
    `);
    const mappingMsg = JSON.parse(mappingMessageString);
    const mappingJsonString = JSON.stringify(mappingMsg.json);

    const teiTemplateMessage = await fetchData(
      `${teiTemplateUrl}/api/v1/tei/template/${id}`,
      `TEI template not available yet for id ${id}`
    );
    if (!teiTemplateMessage) return;

    const teiTemplateString = teiTemplateMessage["TEI_TEMPLATE"];

    const narrativesMessage = await fetchData(
      `${narrativesUrl}/api/v1/narratives/${id}`,
      `Narratives not available yet for id ${id}`
    );
    if (!narrativesMessage) return;

    console.log("get", `${narrativesUrl}/api/v1/narratives/${id}`);
    const narrativesString = narrativesMessage["JSON"];

    const mappingMessage = await fetchData(
      `${mappingUrl}/api/v1/mapping/${id}`,
      `Mapping not available yet for id ${id}`
    );
    if (!mappingMessage) return;

    console.log("get", `${mappingUrl}/api/v1/mapping/${id}`);
    const mappingString = mappingMessage["JSON"];

    const processedTeis = await mapToTei(
      narrativesString,
      teiTemplateString,
      mappingJsonString
    );

    // Convert TEI to JSON
    for (let i = 0; i < processedTeis.length; i++) {
      const idAndTei = processedTeis[i];
      try {
        await sendToTeiQueue(idAndTei.id, idAndTei.tei);
        console.log(`Processing item ${i + 1} out of ${processedTeis.length}`);
      } catch (error) {
        // Handle error if needed
      }
    }
    console.log(`==================================
    *** Successfully to TEI Queue ***
    ==================================
    `);
  } catch (error) {
    console.error("Error processing mapping:", error.message);
    throw error;
  }
}


async function processTeiTemplate(id, templateMessageString) {
  try {
    console.log(`
    NARRATIVES_URL ==> ${narrativesUrl}
    MAPPING_URL => ${mappingUrl}
    `);
    const templateMessage = JSON.parse(templateMessageString);
    const templateString = templateMessage["TEI_TEMPLATE"];

    const mappingMessage = await fetchData(
      `${mappingUrl}/api/v1/mapping/${id}`,
      `Mapping not available yet for id ${id}`
    );
    if (!mappingMessage) return;

    const narrativesMessage = await fetchData(
      `${narrativesUrl}/api/v1/narratives/${id}`,
      `Narratives not available yet for id ${id}`
    );
    if (!narrativesMessage) return;

    console.log("get", `${narrativesUrl}/api/v1/narratives/${id}`);
    const narrativesString = narrativesMessage["JSON"];

    const mappingString = mappingMessage["JSON"];

    const processedTeis = await mapToTei(
      narrativesString,
      templateString,
      mappingString
    );

    // Convert TEI to JSON
    for (let i = 0; i < processedTeis.length; i++) {
      const idAndTei = processedTeis[i];
      try {
        await sendToTeiQueue(idAndTei.id, idAndTei.tei);
        console.log(`Processing item ${i + 1} out of ${processedTeis.length}`);
      } catch (error) {
        // Handle error if needed
      }
    }
    console.log(`==================================
    *** Successfully to TEI Queue ***
    ==================================
    `);
  } catch (error) {
    console.error("Error processing TEI template:", error.message);
    throw error;
  }
}

module.exports = { processNarratives, processMapping, processTeiTemplate };
