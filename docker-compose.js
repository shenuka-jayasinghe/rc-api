const { exec } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local file
const pathToEnvFile = path.resolve(__dirname, '.env.local');
dotenv.config({ path: pathToEnvFile });

// Retrieve SUDO_PASSWORD from environment variables
const SUDO_PASSWORD = process.env.SUDO_PASSWORD;

// Function to execute a shell command with sudo
const executeWithSudo = (command) => {
    return new Promise((resolve, reject) => {
        const sudoCommand = `echo ${SUDO_PASSWORD} | sudo -S ${command}`;
        console.log('Executing command:', sudoCommand);
        exec(sudoCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', stderr);
                reject(stderr);
            } else {
                console.log('Output:', stdout);
                resolve(stdout);
            }
        });
    });
};

// Main function
const main = async () => {
    try {
        console.log('Starting Docker compose up...');
        // Step 1: Run docker compose up in detached mode
        await executeWithSudo('docker compose up -d');

        console.log('Shelling into the docker container...');
        // Step 2: Shell into the docker container
        await executeWithSudo('docker exec -it tei2json-api sh -c "docker run shenukacj/cudl-xslt:0.0.5"');

        console.log('Running node app.js inside the docker container...');
        // Step 3: Run 'node app.js' inside the docker container
        await executeWithSudo('docker exec -it tei2json-api sh -c "npm install && node app.js"');

        console.log('Commands executed successfully inside the docker container.');
    } catch (error) {
        console.error('Error executing commands:', error);
    }
};

// Execute main function
main();
