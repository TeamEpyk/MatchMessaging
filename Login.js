document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");

    var config = {
        apiKey: "AIzaSyBZm6-coQ4Mk1WnLUBSZcjf3OgB-8SJhVM",
        authDomain: "matchmessaging-dfa7e.firebaseapp.com"
    };
    firebase.initializeApp(config);

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("User is signed in.");
            var u = firebase.auth().currentUser;
            $.post('/user_login',
                {
                    "uid": u.uid,
                    "displayName": u.displayName,
                    "photoURL": u.photoURL
                }
            ).done(function (data) {
                console.log(data);
                window.location = data;
            }).fail(function(data){
                console.log(data);
                //Something else
            });
        } else {
            console.log("No user is signed in.");
        }
    });

    $("#emailpass").click(function(){
        var em = $("#email").val();
        let pw = $("#pass").val();
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
            return firebase.auth().signInWithEmailAndPassword(em, pw).then(function(){
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
            });
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
        });
    })

    $("#google").click(function(){
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
            let provider = new firebase.auth.GoogleAuthProvider();
            return firebase.auth().signInWithPopup(provider).then(function(){
            });
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
        });
    });

    $("#github").click(function(){
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
            var provider = new firebase.auth.GithubAuthProvider();
            return firebase.auth().signInWithPopup(provider).then(function(){
            });
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
        });
    });
 });
