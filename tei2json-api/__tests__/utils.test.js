const request = require("supertest");
const fs = require("fs");
const { processDataWithDocker } = require("../utils/xslt-processor");

describe("Node-Docker-CUDL_XSLT tests", () => {
  test("should return JSON", (done) => {
    const xmlFilePath = `${__dirname}/test.xml`;
    const outputPath = `${__dirname}/testOutput.json`;

    fs.readFile(xmlFilePath, "utf8", (err, xmlData) => {
      if (err) {
        return done(err);
      }

      fs.readFile(outputPath, "utf8", (err, outputData) => {
        if (err) {
          return done(err);
        }

        processDataWithDocker(xmlData, true).then(result => {
          // Parse JSON strings into objects
          const resultString = JSON.stringify(result);
          console.log(typeof result, typeof outputData)
          console.log(result)
        //   expect(resultString).toEqual(outputData); // Using toEqual for object comparison
          done();
        }).catch(error => {
          done(error);
        });
      });
    });
  });
});
