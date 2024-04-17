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
        const execCommand = `kubectl exec -it ${podName} -c ${containerName} -- ${command}`;
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

async function main() {
    try {
        // Find appropriate pods using labels or other criteria
        const pods = await k8sApi.listNamespacedPod('default');

        // Array to store promises for command execution
        const commandPromises = [];

        // Execute commands in the pods
        for (const pod of pods.body.items) {
            // Check if the pod is running Kafka or KSQL
            if (pod.metadata.name.includes('kafka')) {
                // Execute Kafka-related commands
                commandPromises.push(executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic tei-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'));
                commandPromises.push(executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic json-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'));
                commandPromises.push(executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic collections-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'));
                commandPromises.push(executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic tei-template-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'));
                commandPromises.push(executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic mapping-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'));
                commandPromises.push(executeCommandInPod(pod.metadata.name, 'kafka', 'kafka-topics.sh --create --topic narratives-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1'));
            } ;
            if (pod.metadata.name.includes('tei2json')){
                commandPromises.push(executeCommandInPod(pod.metadata.name, 'tei2json','docker run shenukacj/cudl-xslt:0.0.5 && node app.js'));
            }
        }

        // Execute all commands concurrently and handle errors
        await Promise.all(commandPromises.map(promise => promise.catch(error => {
            console.error('Error:', error);
        })));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the main function
main();


