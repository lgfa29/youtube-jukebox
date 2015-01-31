var express    = require('express');
var bodyParser = require('body-parser')
var cfenv      = require("cfenv");
var request    = require("request");
var JukeBox    = require("./jukebox");

var CLIENT_ID     = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var REDIRECT_URL  = process.env.REDIRECT_URL;
var PLAYLIST_ID   = process.env.PLAYLIST_ID;

var app    = express();
var appEnv = cfenv.getAppEnv();

app.use(bodyParser.json());

app.get('/start', function(req, res) {
  res.redirect('https://accounts.google.com/o/oauth2/auth?client_id='+CLIENT_ID+'&redirect_uri='+REDIRECT_URL+'&response_type=code&scope=https://gdata.youtube.com&access_type=offline');
});

app.get('/oauth2callback', function(req, res) {
  var code = req.query.code;
  var oauthParams = {
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URL,
    grant_type: "authorization_code"
  }

  request.post(
    'https://accounts.google.com/o/oauth2/token',
    { form: oauthParams }, function(err, resp, body) {
      if (err) {
        console.log(err);
      }
      else {
        var body = JSON.parse(resp.body);

        var token = body.access_token;
        var refreshToken = body.refresh_token;

        JukeBox.start(token, refreshToken);
      }
    }
  );

  res.type('text/plain');
  res.send('Jukebox started :D');
});

app.post('/add', function(req, res) {
  console.log("Song requested: " + req.body.song);

  var video = JukeBox.add(req.body.song, PLAYLIST_ID, function(video) {
    if (video) {
      res.status(200).send(video.snippet.title);
    } else {
      res.status(404).send("Song not found :/");
    }
  });
});

app.listen(appEnv.port, function() {
  console.log("Connected to port " + appEnv.port);
});
