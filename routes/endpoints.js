
/* GET home page. */
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'toor',
  database: 'gdelt'
});

var fs = require('fs');
var file = __dirname + '/../public/iso.txt';
 
fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
    
    var isos = data.split('\n');
    console.dir(isos);
});

connection.connect();

exports.click = function(req, res) {
  var year = req.query.year;
  var source = req.query.source;
  var target = req.query.target;
  var range_begin = year + "-01-01";
  var range_end = year + "-12-12";
  var hist = {};
  connection.query("SELECT goldstein FROM gdelt WHERE conflict_date >= '" +range_begin+"' AND conflict_date <= '"+range_end+"' AND source_country='"+source+"' AND target_country='"+target+"' LIMIT 1000", function(err, rows, fields) {
      if (err) console.dir(err);
      for (var i=0; i<rows.length; i++) {
        var val = parseInt(rows[i].goldstein);
        if (hist[val]) {
            hist[val]+=1;
        }
        else {
            hist[val]=1;
        }
      }
      console.dir(hist);
      res.send(hist);
  });
  

};


exports.mouseover = function(req, res) {
  result = {};
  if (!res.query.country_one) {
      res.json({});
  }

  res.json(result);
};
