var express = require('express');
var bodyParser = require('body-parser');
var myConnection = require('express-myconnection');
var expressValidator = require('express-validator')
var mysql = require('mysql');
const { Client } = require('pg');
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

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://jsvuwgkfjlvylg:3c5991a3ae8b2f095299639d4ec4e8d122416b75b45d75658280598f817de64e@ec2-54-221-192-231.compute-1.amazonaws.com:5432/d4tvln1s67tiqh',
  ssl: true,
});

client.connect();

app.use(myConnection(mysql, dbOptions, 'pool'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(expressValidator())

app.get('/', function (req, res) {
    var url = "/Index.html";
    res.sendFile( __dirname + url);
})

app.post('/Chat.html', function(req, res){
    let u1 = req.sanitize('uid1').escape().trim();
    let u2 = req.sanitize('uid2').escape().trim();
    client.query(`SELECT * FROM users WHERE uid='${u2}';`, (err, rows) => {
        rows = rows.rows;
        if (rows.length==0){
            res.send("Something went wrong...");
        } else {
            fs.readFile("Chat.html", "utf8", function (err, data){
                let replace = data.replace('REPLACE_UID_ME', u1)
                    .replace('REPLACE_UID_FR', u2)
                    .replace('REPLACE_FR', `<a href="/users/${rows[0].uid}">${rows[0].displayname}</a>`);
                res.send(replace);
            });
        }
    });
});

app.post('/send_message', function(req, res){
    let s = req.sanitize('sender').escape().trim();
    let r = req.sanitize('receiver').escape().trim();
    let m = req.sanitize('message').escape().trim();
    let info = {
        senderid: s,
        receiverid: r,
        message: m
    }
    let insert = `INSERT INTO messages (senderid, receiverid, message, time) VALUES('${info.senderid}', '${info.receiverid}', '${info.message}', now());`;
    client.query(insert, (err, rows) => {
        if (err) {
            console.log(err);
            res.send('failure');
        } else {
            res.send('success');
        }
    });
});

app.post('/get_messages', function(req, res){
    let u1 = req.sanitize('u1').escape().trim();
    let u2 = req.sanitize('u2').escape().trim();
    client.query(`SELECT * FROM messages WHERE (senderid='${u1}' AND receiverid='${u2}') OR (senderid='${u2}' AND receiverid='${u1}') ORDER BY time LIMIT 100;`, (err, rows) => {
        rows = rows.rows;
        let results = '';
        for (let i = 0; i<rows.length; i++){
            let cl = 'ms sentme';
            if (rows[i].senderid==u2) cl='ms sentfr';
            results += `<span class="${cl}">${rows[i].message}</span><br/>`
        }
        if (results=='') results = 'Nothing here yet!';
        res.send(results);
    });
});

app.post('/get_online_friends', function(req, res){
    let uid = req.sanitize('u1').escape().trim();
    client.query(`SELECT DISTINCT * FROM users WHERE uid IN (SELECT uid2 FROM friends WHERE uid1='${uid}' and pending!=2 UNION SELECT uid1 FROM friends WHERE uid2='${uid}' and pending!=2) and uid!='${uid}';`, (err, rows) => {
        rows = rows.rows;
        let results = '';
        for (let i = 0; i<rows.length; i++){
            let cl = 'us sentfr';
            results += `<span class="${cl}">
                            <form action="/Chat.html" method="post">
                                <input type="hidden" value="${uid}" name="uid1" id="uid1"/>
                                <input type="hidden" value="${rows[i].uid}" name="uid2" id="uid2"/>
                                <input type="submit" value="${rows[i].displayname}"/>
                            </form>
                        </span><br/>`;
        }
        res.send(results);
    });
});

app.post('/user_login', function(req, res){
    var user = {
        uid: req.sanitize('uid').escape().trim(),
        displayName: req.sanitize('displayName').escape().trim(),
        photoURL: req.sanitize('photoURL').escape().trim()
    };
    client.query(`INSERT INTO users (uid, displayname, photourl, online) VALUES('${user.uid}', '${user.displayName}', '${user.photoURL}', now());`, (err, res1) => {
        if (err){
            if (err.detail.indexOf('already exists')!=-1){
                console.log(`User ${user.uid} returning.`);
                res.send("/Index.html");
            } else {
                console.log(err);
                res.send('what???', 404);
            }
        } else {
            console.log('Success!');
            res.send("/Index.html");
        }
    });
    client.query(`UPDATE users SET online=now() WHERE uid='${user.uid}';`, (err, res1) => {
        if (err){
            console.log(err);
        } else {
            console.log(`User ${user.uid} now online.`);
        }
    });
});

app.post('/user_logout', function(req, res){
    var user = {
        uid: req.sanitize('uid').escape().trim()
    };
    client.query(`UPDATE users SET online=now() WHERE uid='${user.uid}';`, (err, res1) => {
        if (err){
            console.log(err);
        } else {
            console.log(`User ${user.uid} now online.`);
        }
        res.send('/Index.html');
    });
});

app.post('/Search.html', function(req, res){
    let q = req.sanitize('query').escape().trim();
    let uid = req.sanitize('uid').escape().trim();
    client.query(`SELECT * FROM users WHERE uid!='${uid}' AND displayName LIKE '%${q}%';`, (err, rows) => {
        rows = rows.rows;
        if (err){
            console.log("Here");
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
});

app.post('/add_friend', function(req, res){
    let u1 = req.sanitize('uid1').escape().trim();
    let u2 = req.sanitize('uid2').escape().trim();
    client.query(`UPDATE users SET online=NOW() WHERE uid='${u1}';`, (err, rows) => {
        if (err){
            console.log(err);
        } else {
            console.log(`User ${u1} active.`);
        }
    });
    client.query(`SELECT * FROM friends WHERE (uid1='${u1}' or uid2='${u1}') and (uid1='${u2}' or uid2='${u2}');`, (err4, rows4) => {
        rows4 = rows4.rows;
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
                client.query(`INSERT INTO friends (uid1, uid2, pending) VALUES('${u1}', '${u2}', 1) RETURNING id;`, (err, rows) => {
                    rows = rows.rows;
                    if (err){
                        console.log(err);
                        res.send("Something1 went wrong...");
                    } else {
                        client.query(`SELECT * FROM users WHERE uid='${u1}';`, (err1, rows1) => {
                            rows1 = rows1.rows;
                            if (err1){
                                console.log(err1);
                                res.send("Something2 went wrong...");
                            } else {
                                let name = rows1[0].displayname;
                                //type 1 for friend request
                                items = {
                                    otherId: rows[0].id,
                                    uid: u2,
                                    message: `${name} has requested to be your friend!`,
                                    type: 1
                                }
                                let q = `INSERT INTO notifications (otherid, uid, message, type) VALUES(${items.otherId}, '${u2}', '${items.message}', ${items.type});`;
                                client.query(q, (err2, rows2) => {
                                    if (err2){
                                        console.log(err2);
                                        res.send("Something3 went wrong...");
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
});

app.post('/confirm_friend', function(req, res){
    let fid = req.sanitize('secret1').escape().trim();
    console.log(fid);
    client.query(`UPDATE friends SET pending=0 WHERE id=${fid};`, (err, rows) => {
        client.query(`SELECT * FROM friends WHERE id=${fid};`, (err1, rows1) => {
            rows1 = rows1.rows;
            client.query(`DELETE FROM notifications WHERE type=1 and otherId=${fid};`, (err2, rows2) => {
                client.query(`SELECT * FROM users WHERE uid='${rows1[0].uid1}';`, (err4, rows4) => {
                    rows4 = rows4.rows;
                    //type 2 for accepted friend request
                    items = {
                        uid: rows4[0].uid,
                        message: `${rows4[0].displayName} has accepted your friend request!`,
                        type:2
                    }
                    client.query(`INSERT INTO notifications (uid, message, type) VALUES(${items.uid}', '${items.message}', '${items.type}');`, items, (err3, rows3) => {
                        fs.readFile("Redirect.html", "utf8", function (err5, data){
                            res.send(data.replace("REPLACE_ME", `/user/${items.uid}`));
                        });
                    });
                });
            });
        });
    });
});

app.post('/decline_friend', function(req, res){
    let fid = req.sanitize('secret1').escape().trim();
    client.query(`UPDATE friends SET pending=2 WHERE id='${fid}';`, (err, rows) => {
        client.query(`SELECT * FROM friends WHERE id=${fid};`, (err1, rows1) => {
            client.query(`DELETE FROM notifications WHERE type=1 and otherId=${fid};`, (err2, rows2) => {
                client.query(`SELECT * FROM users WHERE uid='${rows1[0].uid1}';`, (err4, rows4) => {
                    rows4 = rows4.rows;
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
});

app.post('/get_notifications', function(req, res){
    let uid = req.sanitize('uid').escape().trim();
    let result = {
        friends: [],
        messages: []
    };
    client.query(`SELECT DISTINCT * FROM friends RIGHT JOIN (SELECT * from notifications WHERE type=1 and notifications.uid='${uid}') as n ON friends.id=n.otherId;`, (err, rows) => {
        rows = rows.rows;
        result.friends.push(rows);
        let html = "";
        let template = "";
        fs.readFile("FriendAction.html", "utf8", function (err, data){
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
                        .replace('ID_REPLACE', result.friends[0][i].otherid)
                        .replace('ID_REPLACE', result.friends[0][i].otherid)
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
});

app.post('/friend_status', function(req, res){
    let u1 = req.sanitize('uid1').escape().trim();
    let u2 = req.sanitize('uid2').escape().trim();
    if (u1==u2){
        res.send('friend');
    } else {
        client.query(`SELECT * FROM friends WHERE (uid1='${u1}' or uid2='${u1}') and (uid1='${u2}' or uid2='${u2}');`, (err, rows) => {
            rows = rows.rows;
            if (err){
                console.log(err);
                res.send('error');
            } else {
                if (rows.length==0){
                    res.send('nofriend');
                } else {
                    /*
                    1 means friend request send and pending
                    2 means friend request declined
                    3 means matched but not friends
                    0 means friends
                    */
                    if (rows[0].pending==3){
                        res.send('nofriend');
                    } else if (rows[0].pending==1||rows[0].pending==2){
                        res.send('pending');
                    } else if (rows[0].pending==0) {
                        res.send('friend');
                    }
                }
            }
        });
    }
});

app.post('/get_match', function(req, res){
    let uid = req.sanitize('uid').escape().trim();
    client.query(`UPDATE users SET online=NOW() WHERE uid='${uid}';`, (err, rows) => {
        //Update last active
    });
    client.query(`SELECT DISTINCT * FROM users WHERE uid NOT IN (SELECT uid2 FROM friends WHERE uid1='${uid}' UNION SELECT uid1 FROM friends WHERE uid2='${uid}') and uid!='${uid}';`, (err, rows) => {
        rows = rows.rows;
        if (rows.length==0){
            client.query(`SELECT * FROM friends WHERE uid1='${uid}' OR uid2='${uid}' LIMIT 1;`, (err, rows2) => {
                rows2 = rows2.rows;
                u = rows2[0].uid1;
                if (rows2[0].uid1==uid) u = rows2[0].uid2;
                res.send(`<span><form id="fuck" action="/Chat.html" method="post">
                                <input type="hidden" value="${uid}" name="uid1" id="uid1" form="fuck"/>
                                <input type="hidden" value="${u}" name="uid2" id="uid2" form="fuck"/>
                                You have been matched with every other user!<br/>
                                <input type="submit" value="Try sending one a message!" form="fuck"/>
                            </form></span>`);
            });
        } else {
            let index = Math.floor(Math.random() * rows.length); //Temporary matching
            let friend = rows[index];
            let results  = "";
            fs.readFile("Match.html", "utf8", function (err, data){
                results = data.replace('REPLACE_UID', friend.uid)
                    .replace('REPLACE_PIC', friend.photourl)
                    .replace('REPLACE_UID2', friend.uid)
                    .replace('REPLACE_NAME', friend.displayname);
                results = results.replace('REPLACE_UID3', friend.uid)
                    .replace('REPLACE_UID_ME', uid)
                    .replace('REPLACE_UID_FR', friend.uid);
                res.send(results);
                client.query(`INSERT INTO friends (uid1, uid2, pending) VALUES('${uid}', '${friend.uid}', ${3});`, function(err, rows){
                    if (err){
                        //error
                    } else {
                        //Everything is fine
                    }
                });
            });
        }
    });
});

app.get(/^\/user(.+)$/, function(req, res){
    let url = req.params[0];
    if (url.split('.').length==1){
        let uid = url.substring(2);
        client.query(`SELECT * FROM users WHERE uid='${uid}';`, (err, rows) => {
            rows = rows.rows;
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
                                profilePage = profilePage.substring(0, index1) + `src="${rows[0].photourl}"` + profilePage.substring(index1);
                            }
                            let find2 = '<h2 id="displayname">';
                            let index2 = profilePage.indexOf(find2);
                            if (index2<0){
                                //Handle Error
                            } else {
                                index2 += find2.length;
                                profilePage = profilePage.substring(0, index2) + `${rows[0].displayname}` + profilePage.substring(index2);
                            }
                            res.set('Content-Type', 'text/html');
                            res.send(profilePage);
                        }
                    });
                }
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

app.get('*', function(req, res){
  res.send('what???', 404);
});

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Listening at http://%s:%s", host, port)
});
