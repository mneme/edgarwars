const WebSocket = require('ws');
const handler = require('serve-handler');
const http = require('http');
 
const AWS = require("aws-sdk");
const table = "EdgarWars";
AWS.config.update({
    //endpoint: 'http://localhost:8000',
    region: "eu-north-1",
  });

const server = http.createServer((request, response) => {
  return handler(request, response, {public: './build'});
})

const wss = new WebSocket.Server({ server });
const docClient = new AWS.DynamoDB.DocumentClient();

let votes

const updateVotes = votes => {
  console.log(votes)
  const promises = Object.entries(votes).map(([name, val]) => {

    return new Promise((resolve, reject) => {
        var params = {
            TableName:table,
            Key:{
                name
            },
            UpdateExpression: "set votes = :val",
            ExpressionAttributeValues:{
                ":val": val
            },
            ReturnValues:"UPDATED_NEW"
        };
        
        docClient.update(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(err)
            }
        });
    })
  })
  return Promise.all(promises)
}

const getVotes = () => {
    var params = {
        TableName : table,
    };
    
    return new Promise((resolve, reject) => {
        docClient.scan(params, function(err, data) {
            if (err) {
               resolve(err) 
            } else {
                resolve(
                  data.Items.reduce((res, {name, votes}) => {
                    res[name] = votes
                    return res
                  }, {})
                )
            }
        });  
    })
}

const broadcast = data => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', async ws => {
  try{
    ws.send(JSON.stringify(votes))
  } catch(e){     
    console.log(e)
  }

  ws.on('message', async name => {
    try{
      votes[name] += 1 
      broadcast(JSON.stringify({[name]: 1}))
    } catch(e){
        console.log(e)
    }
  });
});


const run = async () => {

  votes = await getVotes()
  console.log(votes)
  let interval = setInterval(() => updateVotes(votes), 5000)

  server.listen(80, () => {
    console.log('Running at http://localhost:80');
  })
  
  process.on('exit', async() => {
    clearInterval(interval)
    await updateVotes(votes)
  });
}

run()