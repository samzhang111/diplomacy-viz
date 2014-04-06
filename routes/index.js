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


exports.index = function(req, res){
  res.render('index', { title: 'Express',
          scripts:['javascripts/d3.js',
                  'javascripts/jquery-1.9.1.min.js',
                  'javascripts/jquery-ui.js',
                  'javascripts/colorbrewer.v1.min.js',
                  'javascripts/topojson.js',
                  'javascripts/map.js']});
};

