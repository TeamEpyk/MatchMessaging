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
            window.location = "Profile.html";
        } else {
            console.log("No user is signed in.");
        }
    });

    $("#google").click(function(){
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
            let provider = new firebase.auth.GoogleAuthProvider();
            return firebase.auth().signInWithPopup(provider).then(function(){
                    window.location = "Profile.html";
            });
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
        });
    });

    $("#facebook").click(function(){
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
            let provider = new firebase.auth.FacebookAuthProvider();
            return firebase.auth().signInWithPopup(provider).then(function(){
                    window.location = "Profile.html";
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
                    window.location = "Profile.html";
            });
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
        });
    });
 });
