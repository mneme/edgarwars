const AWS = require("aws-sdk");

AWS.config.update({
    //endpoint: 'http://localhost:8000',
    region: "eu-north-1",
  });;

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

const table = "EdgarWars";

const params = {
    TableName : table,
    KeySchema: [       
        { AttributeName: "name", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [       
        { AttributeName: "name", AttributeType: "S" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

const names = ["johan", "gill", "anders", "peter"]

names.forEach(name => {
    const params = {
        TableName:table,
        Item:{
          name,
          votes: 0
        },
    };
    
    console.log("Updating the item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    }); 
})

