var express = require('express');

var router = express.Router();

var database = require('../database');

router.get('/', function(req, res, next) {
    res.send('List all sample data');

});
router.get("/add", function(req, res, next) {
    res.send('Add sample data');
});
module.exports = router;