CONSUMER_KEY = "91733-d64b6fdc13bbfd1783d1a0ce";
REDIRECT = "http://localhost:8080/"
ACCESS_TOKEN="8d2ee43e-ba1a-a235-033c-47f55a"

const util = require('util');
const request = require('request');

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
//  console.log("--> request. type : "+type+" url : "+url+" callback :"+callback.name+" params :"+JSON.stringify(params))
//  console.log("body: ", body)


    if (err) {
      console.log("headers : "+JSON.parse(headers))
    } else {
      callback(JSON.parse(body));
    }
  });
}


function countByTags(data,type)
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



    //  console.log("title " + data.list[k].resolved_title + "tags " + tgs);
  }
  var nbItems=   Object.keys(data.list).length;

  console.log(type);
var   pad="........................"
console.log("Total : "+pad.substring(0,pad.length-8-nbItems.toString().length)+nbItems)

  for (tag in tagsCount) {
    console.log(tag +pad.substring(0,pad.length-tag.length-tagsCount[tag].toString().length)+ tagsCount[tag]);
//  console.log(pad.length+" "+tag.length+" "+tagsCount[tag].toString().length+" "+tagsCount[tag].toString())
   }
}


function step1() {
  console.log('* Step 1:');
  makeRequest('POST', 'https://getpocket.com/v3/oauth/request', step2, {
    'consumer_key': CONSUMER_KEY,
    'redirect_uri': REDIRECT
  });
}

function step2(data) {
  var token = data.code;
  console.log('Received code/token: ' + token);

  console.log('* Step 2:');
  var url = util.format("https://getpocket.com/auth/authorize?request_token=\
%s&redirect_uri=%s",
    token, REDIRECT);
  console.log('Go to this url in your browser:\n' + url);

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
  console.log('* Step 3:');
  console.log('Received callback from pocket - app is authorized.');
  makeRequest('POST', 'https://getpocket.com/v3/oauth/authorize', step4, {
    'consumer_key': CONSUMER_KEY,
    'code': token
  });
}

function step4(data) {
  console.log('* Step 4:');
  var access_token = data.access_token;
  var username = data.username;
  console.log('Retrieved access token for user ' + username +  'access token' +access_token);

  console.log('Collecting statistics about your reading habits:\n\n');
  query(access_token);
}

function query(access_token) {
  makeRequest('GET', 'https://getpocket.com/v3/get', function(data) {
    var unreadItems = Object.keys(data.list).length;
    var wordCount = [].reduce.call(Object.values(data.list),
          function(acc, val) { return acc + Number(val.word_count || 0) }, 0);
          countByTags(data,'Unread Items')

  //  console.log('Total word count of unread items: ' + wordCount); // TODO calc reading time based on wpm
  //  process.exit(0);
  }, {
    'consumer_key': CONSUMER_KEY,
    'access_token': access_token,
    'state' : 'unread',
'detailType':'complete'
  });

}

// entry point
//step1();
query(ACCESS_TOKEN)

// TODO break this up into utils (makeRequest), auth part, and query part
