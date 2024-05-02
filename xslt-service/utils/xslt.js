const fs = require('fs').promises;
const util = require('util');
const { exec } = require('child_process');
const path = require('path');

const execAsync = util.promisify(exec);

async function processTEI(teiXmlContent) {
    try {
        // Set environment variables
        const env = {
            CLASSPATH: `${__dirname}/apache-ant/lib/saxon9pe.jar`,
            ANT_HOME: `${__dirname}/apache-ant`,
            PATH: `${__dirname}/apache-ant/bin:${process.env.PATH}`
        };

        // Delete 'data' directory if it exists
        const dataDirPath = path.join(__dirname, 'data');
        try {
            await fs.rmdir(dataDirPath, { recursive: true });
        } catch (err) {
            // Ignore if directory doesn't exist
            if (err.code !== 'ENOENT') throw err;
        }

        // Create 'data' directory and write TEI XML content into it
        await fs.mkdir(dataDirPath);
        await fs.writeFile(path.join(dataDirPath, 'tei.xml'), teiXmlContent);

        // Run ant command with specified environment variables
        await execAsync(`CLASSPATH=${env.CLASSPATH} ANT_HOME=${env.ANT_HOME} PATH=${env.PATH} ant -buildfile ./bin/build.xml "json"`, { cwd: __dirname });

        // Read JSON output from 'json/tei.json' file
        const jsonFilePath = path.join(__dirname, 'json', 'tei.json');
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');

        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Example usage
// const teiXmlContent = `<TEI><!-- your TEI XML content here --></TEI>`;
// processTEI(teiXmlContent)
//     .then(jsonData => {
//         console.log(jsonData);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

module.exports = { processTEI }