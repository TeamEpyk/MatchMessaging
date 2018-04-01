var express = require('express');
var bodyParser = require('body-parser');
var myConnection = require('express-myconnection');
var expressValidator = require('express-validator')
var mysql = require('mysql');
var fs = require('fs');
var app = express();

var config = require('./config')
var dbOptions = {
 host: config.database.host,
 user: config.database.user,
 password: config.database.password,
 port: config.database.port,
 database: config.database.db
}

app.use(myConnection(mysql, dbOptions, 'pool'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(expressValidator())

app.get('/', function (req, res) {
    var url = "/Login.html";
    res.sendFile( __dirname + url);
})

app.post('/Chat.html', function(req, res){
    console.log(req.body);
    res.sendFile( __dirname + "/Chat.html");
});

app.post('/user_login', function(req, res){
    var user = {
        uid: req.sanitize('uid').escape().trim(),
        displayName: req.sanitize('displayName').escape().trim(),
        photoURL: req.sanitize('photoURL').escape().trim()
    };
    req.getConnection(function(error, conn) {
        if (error){
            console.log(error);
        }
        var insert = `INSERT INTO users SET ?`;
        conn.query(insert, user, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Successfully added ${user.uid} (${user.displayName}) to database.`);
            }
        });
        conn.query(`UPDATE users SET online=NOW() WHERE uid='${user.uid}'`, function(err, rows, fields){
            console.log(`User ${user.uid} now online.`);
        });
        res.send(`/user/${user.uid}`);
    })
});

app.post('/user_logout', function(req, res){
    var user = {
        uid: req.sanitize('uid').escape().trim()
    };
    req.getConnection(function(error, conn) {
        if (error){
            console.log(error);
        }
        conn.query(`UPDATE users SET online=NOW() WHERE uid='${user.uid}'`, function(err, rows, fields){
            console.log(`User ${user.uid} now offline.`);
        });
        res.sendFile( __dirname + "/Login.html");
    })
});

app.post('/Search.html', function(req, res){
    let q = req.sanitize('query').escape().trim();
    let uid = req.sanitize('uid').escape().trim();
    req.getConnection(function(error, conn) {
        if (error){
            console.log(error);
            res.sendFile( __dirname + "/Search.html");
        } else {
            conn.query(`SELECT * FROM users WHERE uid!="${uid}" AND displayName LIKE "%${q}%"`, function(err, rows, fields){
                if (err){
                    console.log(err);
                    res.sendFile( __dirname + "/Search.html");
                } else {
                    let searchPage = "";
                    fs.readFile("Search.html", "utf8", function (err, data){
                        if (err){
                            console.log("Wtf?");
                            res.sendFile( __dirname + "/Search.html")
                        } else {
                            searchPage = data;
                            let results = "";
                            for (let i = 0; i<rows.length; i++){
                                let r = rows[i];
                                results += `<tr><td><a href="/user/${r.uid}"><img width="168" height="168" src=${r.photoURL} alt="Profile Picture"/></a></td><td><a href="/user/${r.uid}">${r.displayName}</a></td></tr>`;
                            }
                            let find = '<table id="results">';
                            let index = searchPage.indexOf(find);
                            if (index < 0){
                                res.sendFile( __dirname + "/Search.html")
                            } else {
                                index += find.length;
                                searchPage = searchPage.substring(0, index) + results + searchPage.substring(index, searchPage.length);
                                res.set('Content-Type', 'text/html');
                                res.send(searchPage);
                            }
                        }
                    });
                }
            });
        }
    });
});

app.get(/^\/user(.+)$/, function(req, res){
    let url = req.params[0];
    if (url.split('.').length==1){
        let uid = url.substring(1);
        req.getConnection(function(error, conn) {
            if (error){
                console.log(error);
                res.redirect("*");
            } else {
                conn.query(`SELECT * FROM users WHERE uid="${uid}"`, function(err, rows, fields){
                    if (err){
                        console.log(err);
                        res.redirect("*");
                    } else {
                        let profilePage = "";
                        fs.readFile("Profile.html", "utf8", function (err, data){
                            if (err){
                                console.log("Wtf?");
                                res.redirect("*");
                            } else {
                                profilePage = data;
                                let find1 = '<image id="profilepic"';
                                let index1 = profilePage.indexOf(find1);
                                if (index1 < 0){
                                    //Handle Error
                                } else {
                                    index1 += find1.length;
                                    profilePage = profilePage.substring(0, index1) + `src="${rows[0].photoURL}"` + profilePage.substring(index1);
                                }
                                let find2 = '<h2 id="displayname">';
                                let index2 = profilePage.indexOf(find2);
                                if (index2<0){
                                    //Handle Error
                                } else {
                                    index2 += find2.length;
                                    profilePage = profilePage.substring(0, index2) + `${rows[0].displayName}` + profilePage.substring(index2);
                                }
                                res.set('Content-Type', 'text/html');
                                res.send(profilePage);
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.sendFile( __dirname + url);
    }
});

app.get(/^(.+)$/, function(req, res){
    let url = req.params[0];
    if (url.split('.').length==1){
        url+=".html";
    }
    console.log('static file request : ' + url);
    res.sendFile( __dirname + url);
 });

 //The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.send('what???', 404);
});

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Listening at http://%s:%s", host, port)
})
