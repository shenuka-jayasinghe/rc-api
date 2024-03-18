exports.testPost = (testData) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Data saved:', testData);
            resolve();
        }, 1000); // Simulating 1 second delay
    });
}
  