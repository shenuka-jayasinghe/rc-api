const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs/promises");
const path = require("path");
const pathToEnvFile = `${__dirname}/.env.local`
require("dotenv").config({ path: pathToEnvFile })

const SUDO_PASSWORD = process.env.SUDO_PASSWORD;

exports.processDataWithDocker = async (
  xmlData,
  isSudoDocker,
  xsltDirectory = ""
) => {
  const sudoDockerString = isSudoDocker ? "echo $SUDO_PASSWORD | sudo -S docker" : "docker";

  try {
    // Check if the /data directory exists
    const dataDirExists = await directoryExists(path.join(__dirname, "data"));
    if (!dataDirExists) {
      // If the /data directory doesn't exist, create it
      await fs.mkdir(path.join(__dirname, "data"));
    }

    // Write the XML data to a temporary file
    const xmlFilePath = path.join(__dirname, "data", "data.xml");
    await fs.writeFile(xmlFilePath, xmlData, "utf8");
    console.log("XML data written to:", xmlFilePath);
    await exec(`export SUDO_PASSWORD=${SUDO_PASSWORD}`);

    if (xsltDirectory === "") {
      // No XSLT directory specified
      // Run the ant build command inside the Docker container with local volume mount
      const command = `${sudoDockerString} run --rm -v ${__dirname}/data:/opt/data -v ${__dirname}/json:/opt/json shenukacj/cudl-xslt:0.0.5 ant -buildfile ./bin/build.xml "json"`
      const { stdout: antOutput } = await exec(command);
      console.log("Ant command executed:", antOutput.trim());

    } else {
      // else volume mount to the xslt directory as well
      const command = `${sudoDockerString} run --rm -v ${__dirname}:/opt/data -v ${__dirname}/json:/opt/json -v ${xsltDirectory}:/opt/xslt shenukacj/cudl-xslt:0.0.5 ant -buildfile ./bin/build.xml "json"`
      const { stdout: antOutput } = await exec(command);
      console.log("Ant command executed:", antOutput.trim());
    }

    // Delete the /data directory and its contents
    await fs.rm(path.join(__dirname, "data"), { recursive: true });

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
    await fs.rm(path.join(__dirname, "data"), { recursive: true });
    return ['XSLT transformation failed'];
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

async function directoryExists(dirPath) {
  try {
    await fs.access(dirPath);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    } else {
      throw err;
    }
  }
}