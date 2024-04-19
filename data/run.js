const k8s = require('@kubernetes/client-node');
const { exec } = require('child_process');

// Load kubeconfig
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

// Create Kubernetes API instance
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// Function to execute command in a pod
function executeCommandInPod(podName, containerName, command) {
    return new Promise((resolve, reject) => {
        const execCommand = `kubectl exec -it ${podName} ${containerName} -- ${command}`;
        exec(execCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command in pod ${podName}: ${stderr}`);
                reject(error);
            } else {
                console.log(stdout);
                resolve();
            }
        });
    });
}

async function executeKafkaCommands(pods) {
    const kafkaCommands = [];

    // Execute Kafka-related commands in the pods
    for (const pod of pods) {
        if (pod.metadata.name.includes('kafka')) {
            kafkaCommands.push(
                executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic tei-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'),
                executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic json-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'),
                executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic collections-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'),
                executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic tei-template-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'),
                executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic mapping-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'),
                executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic narratives-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1')
            );
        }
    }

    // Execute Kafka commands concurrently
    await Promise.all(kafkaCommands);
}

async function executeTei2jsonCommands(pods) {
    
    const tei2jsonCommands = [];

    // Execute tei2json-related commands in the pods
    for (const pod of pods) {
        if (pod.metadata.name.includes('tei2json-api')) {
            tei2jsonCommands.push(
                executeCommandInPod(pod.metadata.name, 'tei2json-api', 'docker run shenukacj/cudl-xslt:0.0.5'),
                executeCommandInPod(pod.metadata.name, 'tei2json-api', 'node app.js')
            );
        }
    }

    // Execute tei2json commands sequentially using async/await
    for (const command of tei2jsonCommands) {
        try {
            await command;
        } catch (error) {
            console.error('Error executing tei2json command:', error);
        }
    }
}

async function main() {
    try {
        // Find appropriate pods using labels or other criteria
        const pods = (await k8sApi.listNamespacedPod('default')).body.items;

        // Execute Kafka commands
        // await executeKafkaCommands(pods);

        // Execute ksqlDB commands
        const ksqlDbPod = pods.find(pod => pod.metadata.name.includes('ksqldb-cli'));
        if (ksqlDbPod) {
            await executeCommandInPod(ksqlDbPod.metadata.name, 'ksqldb-cli', `
                ksql http://ksqldb-server:8088 <<EOF
                CREATE STREAM collection_stream (
                    event VARCHAR,
                    title VARCHAR,
                    timestamp BIGINT,
                    json VARCHAR
                ) WITH (
                    KAFKA_TOPIC='collections-topic',
                    VALUE_FORMAT='JSON'
                );

                CREATE STREAM tei_stream (
                    event VARCHAR,
                    id VARCHAR,
                    timestamp BIGINT,
                    tei VARCHAR
                ) WITH (
                    KAFKA_TOPIC='tei-topic',
                    VALUE_FORMAT='JSON'
                );

                CREATE STREAM tei_template_stream (
                    event VARCHAR,
                    id VARCHAR,
                    timestamp BIGINT,
                    tei_template VARCHAR
                ) WITH (
                    KAFKA_TOPIC='tei-template-topic',
                    VALUE_FORMAT='JSON'
                );

                CREATE STREAM json_stream (
                    event VARCHAR,
                    id VARCHAR,
                    timestamp BIGINT,
                    json VARCHAR
                ) WITH (
                    KAFKA_TOPIC='json-topic',
                    VALUE_FORMAT='JSON'
                );

                CREATE STREAM mapping_stream (
                    event VARCHAR,
                    id VARCHAR,
                    timestamp BIGINT,
                    json VARCHAR
                ) WITH (
                    KAFKA_TOPIC='mapping-topic',
                    VALUE_FORMAT='JSON'
                );

                CREATE STREAM narratives_stream (
                    event VARCHAR,
                    id VARCHAR,
                    timestamp BIGINT,
                    json VARCHAR
                ) WITH (
                    KAFKA_TOPIC='narratives-topic',
                    VALUE_FORMAT='JSON'
                );
                EOF
            `);
        } else {
            console.error('ksqldb-cli pod not found.');
        }

        // Execute tei2json commands
        await executeTei2jsonCommands(pods);
    } catch (error) {
        console.error('Error:', error);
    }
}


// Run the main function
main();
