
/* GET home page. */
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'toor'
});

var fs = require('fs');
var file = __dirname + '/public/iso.txt';
 
fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
    
    var isos = data.split('\n');
    console.dir(isos);
});

connection.connect();

exports.mouseover = function(req, res) {
  var year = req.query.year;
  var source = req.query.source;

  var range_begin = year + "-01-01";
  var range_end = year + "-12-12";
  var hist = {};
  connection.query("SELECT goldstein FROM gdelt WHERE conflict_date >= '" +range_begin+"' AND conflict_date <= '"+range_end+"' AND source_country='"+source+"' LIMIT 1000", function(err, rows, fields) {
      res.json({});
  });
  
  res.render('error');

};


exports.click = function(req, res) {
  result = {};
  if (!res.query.country_one) {
      res.json({});
  }

  res.json(result);
};
