CONSUMER_KEY = "91733-d64b6fdc13bbfd1783d1a0ce";
REDIRECT = "http://localhost:8080/"
ACCESS_TOKEN="8d2ee43e-ba1a-a235-033c-47f55a"




const util = require('util');
const request = require('request');
const winston = require('./winston');







var makeRequest = function(type, url, callback, params) {
  //

  options = {
    url: url,
    method: type,
    headers: {
      'Content-Type': 'application/json; charset=UTF8',
      'X-Accept': 'application/json'
    },
    body: JSON.stringify(params)
  }

  request(options, function(err, response, body) {
//  logger.info("--> request. type : "+type+" url : "+url+" callback :"+callback.name+" params :"+JSON.stringify(params))
//  logger.info("body: ", body)


    if (err) {
      logger.info("headers : "+JSON.parse(headers))
    } else {
      callback(JSON.parse(body));
    }
  });
}


function countByTags(data,type,db)
{




  var tagsCount = []
  for (var k in  data.list) {
    var tags= ["|"]
if (data.list[k].tags) {tags=data.list[k].tags}
     var tgs="|";
      for (var t in tags )
      {
        if (tagsCount[t]) tagsCount[t]++;
        else tagsCount[t]=1

      }



    //  logger.info("title " + data.list[k].resolved_title + "tags " + tgs);
  }
  var nbItems=   Object.keys(data.list).length;

  logger.info(type);
var   pad="........................"
logger.info("Total : "+pad.substring(0,pad.length-8-nbItems.toString().length)+nbItems)

  for (tag in tagsCount) {
    logger.info(tag +pad.substring(0,pad.length-tag.length-tagsCount[tag].toString().length)+ tagsCount[tag]);
//  logger.info(pad.length+" "+tag.length+" "+tagsCount[tag].toString().length+" "+tagsCount[tag].toString())
   }
   const stats = {
     unreads: nbItems
   }
   var docRef = db.collection('stats').doc('pockets').set(stats).then(() =>
   logger.info('result  written to database'));


}


function step1() {
  logger.info('* Step 1:');
  makeRequest('POST', 'https://getpocket.com/v3/oauth/request', step2, {
    'consumer_key': CONSUMER_KEY,
    'redirect_uri': REDIRECT
  });
}

function step2(data) {
  var token = data.code;
  logger.info('Received code/token: ' + token);

  logger.info('* Step 2:');
  var url = util.format("https://getpocket.com/auth/authorize?request_token=\
%s&redirect_uri=%s",
    token, REDIRECT);
  logger.info('Go to this url in your browser:\n' + url);

  // SERVER PART listening for callback from pocket
  const http = require('http');
  const server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Go back to the app!');
    step3(token);
    server.close();
  });
  server.listen(8080);
}

function step3(token) {
  logger.info('* Step 3:');
  logger.info('Received callback from pocket - app is authorized.');
  makeRequest('POST', 'https://getpocket.com/v3/oauth/authorize', step4, {
    'consumer_key': CONSUMER_KEY,
    'code': token
  });
}

function step4(data) {
  logger.info('* Step 4:');
  var access_token = data.access_token;
  var username = data.username;
  logger.info('Retrieved access token for user ' + username +  'access token' +access_token);

  logger.info('Collecting statistics about your reading habits:\n\n');
  query(access_token);
}

function query(access_token, db) {
  makeRequest('GET', 'https://getpocket.com/v3/get', function(data) {
    var unreadItems = Object.keys(data.list).length;
    var wordCount = [].reduce.call(Object.values(data.list),
          function(acc, val) { return acc + Number(val.word_count || 0) }, 0);

          countByTags(data,'Unread Items',db)
logger.info(unreadItems)
          return unreadItems;

  }, {
    'consumer_key': CONSUMER_KEY,
    'access_token': access_token,
    'state' : 'unread',
'detailType':'complete'
  });
}

// entry point
//step1();


logger.info('START ---');


const admin = require('firebase-admin');
const serviceAccount = require('/home/laurent/dev/utils/firstfirestore-1c73de0aa77f.json');
//initialize admin SDK using serciceAcountKey
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
var result=query(ACCESS_TOKEN,db )
logger.info('unreads '+result);



const quoteData = {
  quote: "quote",
  author: 'author'
};
 db.collection('sampleData').doc('inspiration')
.set(quoteData).then(() =>
logger.info('quote written to database'));

logger.info("apres set")



db.collection('users').get()
.then((snapshot) => {
  logger.info("dans get")

  snapshot.forEach((doc) => {
    logger.info(doc.id, '=>', doc.data());
  });
})
.catch((err) => {
  logger.info('Error getting documents', err);
});

logger.info("apres get")


// TODO break this up into utils (makeRequest), auth part, and query part
