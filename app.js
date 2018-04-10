//CONSUMER_KEY = "64614-1a557559fbd5ba7f0c1f79e5";
CONSUMER_KEY = "75963-34c5b8ba7032ceb2e5843089";
// REDIRECT = "http://localhost:8080/"
REDIRECT = "http://vps357316.ovh.net:8080/"

//Added
TOKEN = "c67e2a41-adae-2818-2e0a-143ce1"

const util = require('util');
const request = require('request');

var makeRequest = function(type, url, callback, params) {
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
    if (err) {
      console.log("error: ", err)
    } else {
      callback(JSON.parse(body));
    }
  });
}

// init auth here -- see https://getpocket.com/developer/docs/authentication

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
  /*
  const http = require('http');
  const server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Go back to the app!');
    step3(token);
    server.close();
  });
  server.listen(8080);
  */
  step3(TOKEN)
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
  console.log('Retrieved access token for user ' + username);

  console.log('Collecting statistics about your reading habits:\n\n');
  query(access_token);
}

function query(access_token) {
  makeRequest('GET', 'https://getpocket.com/v3/get', function(data) {
    // global.resp = data; // for interactive debugging
    var unreadItems = Object.keys(data.list).length;
    var wordCount = [].reduce.call(Object.values(data.list),
          function(acc, val) { return acc + Number(val.word_count || 0) }, 0);
    console.log('Unread items: ' + unreadItems);
    console.log('Total word count of unread items: ' + wordCount); // TODO calc reading time based on wpm
    process.exit(0);
  }, {
    'consumer_key': CONSUMER_KEY,
    'access_token': access_token,
    'state': 'unread',
    'detailType': 'simple'
  });
}

// entry point
step1();

// TODO break this up into utils (makeRequest), auth part, and query part
