var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/cool/', function(req, res, next) {
  res.send('You\'re cool');
});

router.get('/cool/but-note-dima/', function(req, res, next) {
  res.send('You\'re cool, but Dima isn\'t cool');
});

module.exports = router;
