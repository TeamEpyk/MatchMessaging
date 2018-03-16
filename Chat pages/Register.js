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

    $("#register").click(function(){
        let em = $("#email")[0].value;
        let un = $("#username")[0].value;
        let pw = $("#pass")[0].value;
        let pwc = $("#passconfirm")[0].value;
        if (pw==pwc){
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
                let provider = new firebase.auth.GoogleAuthProvider();
                return firebase.auth().createUserWithEmailAndPassword(em, pw).catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // ...
                    console.log(errorMessage);
                }).then(function(result){
                    let user = firebase.auth().currentUser;
                    user.updateProfile({
                        displayName: un
                    }).then(function(){
                    window.location = "Profile.html";
                    });
                });
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error);
            });
        } else {
            alert("Passwords do not match.");
        }
    });
});
