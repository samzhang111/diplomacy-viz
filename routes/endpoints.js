
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

exports.pair = function(req, res) {
  var year = req.query.year
     ,source = req.query.source
     ,target = req.query.target;

  if (year && source && target) {
      var range_begin = year + "-01-01"
         ,range_end = year + "-12-12"
         ,hist = {};
      
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
    }
  else {
      res.send({});
  }

};

exports.single = function(req, res) {
  var year = req.query.year
     ,source = req.query.source
     ,summary = {source:source};
  if (!year || !source) {
      res.send(summary);
  }
  connection.query("SELECT target_country, average FROM averages WHERE year = '" +year+"'", function(err, rows, fields) {
      if (err) console.dir(err);
      for (var i=0; i<rows.length; i++) {
        summary[rows[i].target_country] = rows[i].average;
      }
      res.send(summary);
  });
};

