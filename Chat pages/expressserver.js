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
                //console.log(err);
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
                            if (rows.length == 0){
                                results = "No results";
                            } else {
                                for (let i = 0; i<rows.length; i++){
                                    let r = rows[i];
                                    results += `<tr><td><a href="/user/${r.uid}"><img width="168" height="168" src=${r.photoURL} alt="Profile Picture"/></a></td><td><a href="/user/${r.uid}">${r.displayName}</a></td></tr>`;
                                }
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

app.post('/add_friend', function(req, res){
    let u1 = req.sanitize('uid1').escape().trim();
    let u2 = req.sanitize('uid2').escape().trim();
    req.getConnection(function(error, conn) {
        if (error){
            console.log(error);
        } else {
            conn.query(`SELECT * FROM friends WHERE (uid1="${u1}" or uid2="${u1}") and (uid1="${u2}" or uid2="${u2}")`, function(err4, rows4, fields4){
                if (err4){
                    console.log(err4);
                } else {
                    if (rows4.length>0){ //This should never happen
                        if (rows4[0].pending==1 || rows4[0].pending==2){
                            res.send("Friend request pending.");
                        } else {
                            res.send("You are already friends with this user.")
                        }
                    } else {
                        items = {
                            uid1: u1,
                            uid2: u2
                        }
                        conn.query(`INSERT INTO friends SET ?`, items, function(err, rows, fields){
                            if (err){
                                console.log(err);
                                res.send("Something went wrong...");
                            } else {
                                conn.query(`SELECT * FROM users WHERE uid="${u1}"`, function(err1, rows1, fields1){
                                    if (err1){
                                        console.log(err1);
                                        res.send("Something went wrong...");
                                    } else {
                                        let name = rows1[0].displayName;
                                        items = {
                                            otherId: rows.insertId,
                                            uid: u2,
                                            message: `${name} has requested to be your friend!`
                                        }
                                        conn.query(`INSERT INTO notifications SET ?`, items, function(err2, rows2, fields2){
                                            if (err2){
                                                console.log(err2);
                                                res.send("Something went wrong...");
                                            } else {
                                                fs.readFile("Redirect.html", "utf8", function (err3, data){
                                                    res.send(data.replace("REPLACE_ME", `/user/${u2}`));
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
});

app.post('/confirm_friend', function(req, res){
    let fid = req.sanitize('secret1').escape().trim();
    req.getConnection(function(error, conn) {
        if (error){
            console.log(error);
        } else {
            let result = {
                friends: [],
                messages: []
            };
            conn.query(`UPDATE friends SET pending=0 WHERE id="${fid}"`, function(err, rows, fields){
                conn.query(`SELECT * FROM friends WHERE id=${fid}`, function(err1, rows1, fields1){
                    conn.query(`DELETE FROM notifications WHERE otherId=${fid}`, function(err2, rows2, fields2){
                        conn.query(`SELECT * FROM users WHERE uid="${rows1[0].uid1}"`, function(err4, rows4, fields4){
                            items = {
                                uid: rows4[0].uid,
                                message: `${rows4[0].displayName} has accepted your friend request!`
                            }
                            conn.query(`INSERT INTO notifications SET ?`, items, function(err3, rows3, fields3){
                                fs.readFile("Redirect.html", "utf8", function (err3, data){
                                    res.send(data.replace("REPLACE_ME", `/user/${items.uid}`));
                                });
                            });
                        });
                    });
                });
            });
        }
    });
});

app.post('/decline_friend', function(req, res){
    let fid = req.sanitize('secret1').escape().trim();
    req.getConnection(function(error, conn) {
        if (error){
            console.log(error);
        } else {
            let result = {
                friends: [],
                messages: []
            };
            conn.query(`UPDATE friends SET pending=2 WHERE id="${fid}"`, function(err, rows, fields){
                conn.query(`SELECT * FROM friends WHERE id=${fid}`, function(err1, rows1, fields1){
                    conn.query(`DELETE FROM notifications WHERE otherId=${fid}`, function(err2, rows2, fields2){
                        conn.query(`SELECT * FROM users WHERE uid="${rows1[0].uid1}"`, function(err4, rows4, fields4){
                            items = {
                                uid: rows4[0].uid
                            }
                            fs.readFile("Redirect.html", "utf8", function (err3, data){
                                res.send(data.replace("REPLACE_ME", `/user/${items.uid}`));
                            });
                        });
                    });
                });
            });
        }
    });
});

app.post('/get_notifications', function(req, res){
    let uid = req.sanitize('uid').escape().trim();
    req.getConnection(function(error, conn) {
        if (error){
            console.log(error);
        } else {
            let result = {
                friends: [],
                messages: []
            };
            conn.query(`SELECT DISTINCT * FROM friends RIGHT JOIN (SELECT * from notifications WHERE notifications.uid="${uid}") as n ON friends.id=n.otherId`, function(err, rows, fields){
                result.friends.push(rows);
                let html = "";
                let template = "";
                fs.readFile("TableRow.html", "utf8", function (err, data){
                    template = data;
                    //Friends
                    html += `<tr><th>Friend Requests</th></tr>`;
                    if (result.friends[0].length==0){
                        html += `<tr><td>Nothing to see here :(</td></tr>`;
                    } else {
                        for (let i = 0; i<result.friends[0].length; i++){
                            html += template.replace('MESSAGE_REPLACE', result.friends[0][i].message)
                                .replace('ACTION_REPLACE', 'confirm_friend')
                                .replace('ACTION_REPLACE2', 'decline_friend')
                                .replace('ID_REPLACE', result.friends[0][i].otherId)
                                .replace('ID_REPLACE', result.friends[0][i].otherId)
                                .replace('USER_REPLACE', `/user/${result.friends[0][i].uid1}`);
                        }
                    }
                    res.send(html);
                });
            });
            /*This one might be more complicated bleh
            conn.query(`SELECT * FROM notifications,messages WHERE notifications.uid="${uid}" AND friends.id=notifications.otherId`, function(err, rows, fields){
                result.friends.push(rows);
            });
            */

        }
    });
});

app.post('/friend_status', function(req, res){
    let u1 = req.sanitize('uid1').escape().trim();
    let u2 = req.sanitize('uid2').escape().trim();
    req.getConnection(function(error, conn) {
        if (error){
            console.log(error);
            res.send('error');
        } else {
            conn.query(`SELECT * FROM friends WHERE (uid1="${u1}" or uid2="${u1}") and (uid1="${u2}" or uid2="${u2}")`, function(err, rows, fields){
                if (err){
                    console.log(err);
                    res.send('error');
                } else {
                    if (rows.length==0){
                        res.send('nofriend');
                    } else {
                        if (rows[0].pending==1||rows[0].pending=2){
                            res.send('pending');
                        } else {
                            res.send('friend');
                        }
                    }
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
                        if (rows.length==0){
                            res.send("User not found");
                        } else {
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
