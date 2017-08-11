// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var validUrl = require('valid-url')

var mongo = require('mongodb').MongoClient

var shortid = require('shortid')

var url = 'mongodb://localhost:27017/fccshorturl'
var localUrl = 'http://localhost:3939'

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get('/:urlId', function(req, res) {
  
  var findShortUrl = localUrl + "/" + req.params.urlId
  mongo.connect(url, function(err, db) {
    if (err) res.sendStatus(500).send('An error happened while connecting to database')
    db.collection('urls')
      .find({
        shortUrl: findShortUrl
      }, {
        origUrl: 1
        , shortUrl: 1
        , _id: 0
      }).toArray(function(err, docs) {
        if (err) res.sendStatus(500).send('An error happened while gathering data')
        res.redirect(docs[0].origUrl)
        db.close()
      })
  })
})

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/short/*", function (req, res) {
  var origUrl = req.params[0]
  var results = {}
  var shortUrl

  if (validUrl.isUri(origUrl)) {
    var newShortUrl = localUrl + "/" + shortid.generate()
    var newUrlSetup = {
      origUrl: origUrl,
      shortUrl: newShortUrl
    }
    mongo.connect(url, function(err, db) {
      if (err) res.sendStatus(500).send('An error happened while connecting to database')
      db.collection('urls')
        .insert(newUrlSetup, function(err, data) {
          if (err) res.sendStatus(500).send('An error happened while saving data')
          res.json(newUrlSetup)
          db.close()
        })
    })
    
  } else {
    shortUrl = 'Not a valid web Url'
    results['origUrl'] = origUrl
    results['shortUrl'] = shortUrl
    res.json(results)
  }
})

// listen for requests :)
var listener = app.listen(process.env.PORT || '3939', function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
