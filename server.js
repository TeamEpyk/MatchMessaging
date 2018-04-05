var http = require('http');
var fs = require('fs')
var qs = require('querystring');
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyBZm6-coQ4Mk1WnLUBSZcjf3OgB-8SJhVM"
};
firebase.initializeApp(config);

http.createServer(function (req, res) {
    var url = req.url.substring(1);
    if (url.includes('.css')){
        fs.readFile(url, function (err, data){
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.write(data);
            res.end();
        });
    } else {
        fs.readFile(url, function (err, data){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        });
    }
}).listen(8080);
