var Youtube = require("youtube-api");

var JukeBox = function() {
  this.token = "";
  this.refreshToken = "";
};

JukeBox.prototype.start = function(token, refreshToken) {
  this.token = token;
  this.refreshToken = refreshToken;

  Youtube.authenticate({
    type: "oauth",
    token: token,
    refresh_token: refreshToken
  });
};

JukeBox.prototype.add = function(query, playlistId, callback) {
  Youtube.search.list({
    part: "snippet",
    q: query,
    type: "video"
  }, function(err, data) {
    if (err) {
      console.log(err);
      return undefined;
    }

    if (data.items.length > 0) {
      var video = data.items[0];
      insertInPlaylist(video, playlistId, callback);
    }
  });
};

function insertInPlaylist(video, playlistId, callback) {
  Youtube.playlistItems.list({
    part: "snippet",
    playlistId: playlistId
  }, function(err, data) {
    if (data.items == 100) {
      Youtube.playlistItems.remove({
        id: data.items[0].id
      });
    }
  });

  Youtube.playlistItems.insert({
    part: "snippet",
    resource: {
      snippet: {
        playlistId: playlistId,
        resourceId: video.id
      }
    }
  }, function() {
    callback(video);
  });
}

module.exports = new JukeBox();
