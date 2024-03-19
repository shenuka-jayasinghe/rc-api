const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs/promises");
const path = require("path");
const pathToEnvFile = `${__dirname}/.env.local`
require("dotenv").config({ path : pathToEnvFile })

const SUDO_PASSWORD = process.env.SUDO_PASSWORD;

exports.processDataWithDocker = async (
  xmlData,
  isSudoDocker,
  xsltDirectory = ""
) => {
  const sudoDockerString = isSudoDocker ? "sudo -S docker" : "docker";

  try {
    // Write the XML data to a temporary file
    await exec(`mkdir data`)
    const xmlFilePath = path.join(`${__dirname}/data`, "data.xml");
    await fs.writeFile(xmlFilePath, xmlData, "utf8");
    console.log("XML data written to:", xmlFilePath);

    if (xsltDirectory === "") {
      //No XSLT directory specified
      // Run the ant build command inside the Docker container with local volume mount
      await exec(`export SUDO_PASSWORD=${SUDO_PASSWORD}`);
      const command = `echo $SUDO_PASSWORD | ${sudoDockerString} run --rm -v ${__dirname}/data:/opt/data -v ${__dirname}/json:/opt/json shenukacj/cudl-xslt:0.0.5 ant -buildfile ./bin/build.xml "json"`
      const { stdout: antOutput } = await exec(command);
      console.log("Ant command executed:", antOutput.trim());

    } else {
      // else volume mount to the xslt directory as well
      const { stdout: antOutput } = await exec(
        `${sudoDockerString} run --rm -v ${__dirname}:/opt/data -v ${__dirname}/json:/opt/json -v ${xsltDirectory}:/opt/xslt shenukacj/cudl-xslt:0.0.5 ant -buildfile ./bin/build.xml "json"`
      );
      console.log("Ant command executed:", antOutput.trim());
    }

    await exec(`rm -r data`)

    // Read and parse JSON files
    const jsonDir = path.join(__dirname, "json");
    console.log("JSON directory:", jsonDir);
    const files = await fs.readdir(jsonDir);

    const jsonData = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(jsonDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          const dirFiles = await fs.readdir(filePath);
          if (dirFiles.some((dirFile) => dirFile.endsWith(".json"))) {
            return readJsonFiles(
              path.join(
                filePath,
                dirFiles.find((dirFile) => dirFile.endsWith(".json"))
              )
            );
          }
        } else if (file.endsWith(".json")) {
          return readJsonFiles(filePath);
        }
      })
    );

    // Filter out undefined values (directories without .json files)
    return jsonData.filter((data) => data);
  } catch (err) {
    console.error("Error:", err);
    return [];
  }
}

async function readJsonFiles(filePath) {
  try {
    const jsonData = await fs.readFile(filePath, "utf8");
    return JSON.parse(jsonData);
  } catch (err) {
    console.error("Error reading JSON file:", err);
    return null;
  }
}

// Example usage
const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<message>
    <TEI xmlns="http://www.tei-c.org/ns/1.0" xml:id="manuscript_1">
        <!-- TEI content goes here -->
    </TEI>
</message>`;

// processDataWithDocker(xmlData, true)
//   .then((jsonData) => {
//     console.log("JSON data:", jsonData);
//   })
//   .catch((err) => {
//     console.error("Error:", err);
//   });
