var express = require('express');
var router = express.Router();
var Model = require('../models/manager-model');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Welcome to API Login tutors for admin');
});

module.exports = router;
