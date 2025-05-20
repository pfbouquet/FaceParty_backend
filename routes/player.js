var express = require('express');
var router = express.Router();

/* GET player listing. */
router.get('/', function(req, res, next) {
  res.send('list des players');
});

/* Update player name */

router.update('/', function(req, res, next) {

});

module.exports = router;