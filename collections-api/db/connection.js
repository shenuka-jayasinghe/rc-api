const KsqldbClient = require("ksqldb-client");
const ENV = process.env.NODE_ENV || "local"
//Make sure to set NODE_ENV to "prod" in Dockerfile
const pathToEnvFile = `${__dirname}/../.env.${ENV}`
require("dotenv").config({ path: pathToEnvFile })

const KSQL_CLIENT = process.env.KSQL_CLIENT;

const options = {
    host: KSQL_CLIENT,
    port: 8088,
};

const client = new KsqldbClient(options);

// Check connection status
client.connect()
    .then(() => {
        console.log("Connected to ksqlDB server successfully!");
    })
    .catch((error) => {
        console.error("Error connecting to ksqlDB server:", error);
    });

module.exports = client;
