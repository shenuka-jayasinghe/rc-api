const { testPost } = require("../tei-model/producer");

exports.healthCheck = (req,res) => {
    res.status(200).send('Hello World!')
}

exports.postTest = (req,res) => {
    const testData = req.body;
    testPost(testData).then(() => {
        res.status(200).send('post working')
    })
}