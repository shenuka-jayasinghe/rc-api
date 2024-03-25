const KsqldbClient = require("ksqldb-client");

const options = {
    host: "http://ksqldb-server",
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
