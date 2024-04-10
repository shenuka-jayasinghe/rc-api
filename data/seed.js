const { timeLog } = require("console");
const { collections } = require("./collections");
const axios = require("axios");
let itemJsonArray = [];

// Define a function to handle sequential processing of items
async function processItems(items) {
    for (const item of items) {
        console.log("item ==>", item);
        try {
            const response = await axios.get(`https://services.digitalcollections.manchester.ac.uk/v1/metadata/tei/${item}`);
            const options = {
                method: "post",
                url: `http://localhost:3001/api/v1/tei2json/cudl-xslt/${item}`,
                data: response.data,
            };
            const postResponse = await axios(options);
            const itemTitle = postResponse.data.find((element, index) => element === 'title');
            console.log(postResponse.data);
            console.log(`post item ==> ${item}`);
            const itemCollectionData = {
                id : item,
                title: postResponse.data[0].descriptiveMetadata[0].title.displayForm,
                thumbnailUrl : postResponse.data[0].descriptiveMetadata[0].thumbnailUrl,
                abstract: postResponse.data[0].descriptiveMetadata[0].abstract.displayForm
            }
            console.log(" itemCollectionData ==> ", itemCollectionData )
            itemJsonArray.push(itemCollectionData)
        } catch (error) {
            console.error(`Error processing item ${item}:`, error);
        }
    }
}

// Define a function to seed collections
async function seed(collections) {
    for (const collection of collections) {
        try {
            await processItems(collection.items);
            console.log("All items processed for collection:", collection.title);
            const payLoad = {
                title: collection.title,
                thumbnailUrl: collection.thumbnailUrl,
                description: collection.description,
                items: itemJsonArray
            }
            
            const options = {
                method: 'put',
                url: `http://localhost:3003/api/v1/collections/${collection.title}`,
                data: payLoad
            };
            await axios(options);
            console.log("payLoad ===>", payLoad)
            console.log("Collection seeded:", collection.title);
            itemJsonArray = [];

        } catch (error) {
            console.error("Error seeding collection:", collection.title, error);
        }
    }
}

// Call the seed function with your collections
seed(collections)
    .then(() => console.log("All collections seeded successfully"))
    .catch(error => console.error("Error seeding collections:", error));

