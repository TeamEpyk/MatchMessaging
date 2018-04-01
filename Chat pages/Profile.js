document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");

    var config = {
        apiKey: "AIzaSyBZm6-coQ4Mk1WnLUBSZcjf3OgB-8SJhVM",
        authDomain: "matchmessaging-dfa7e.firebaseapp.com"
    };
    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("User is signed in.");
        } else {
            console.log("No user is signed in.");
            window.location = "Login.html";
        }
    });

    $("#logout").click(function(){
        logout();
    });

    function logout(){
        var u = firebase.auth().currentUser;
        $.post('/user_logout',
            {
                "uid": u.uid
            }
        ).done(function (data) {
            //window.location = "Login.html";
        }).fail(function(data){
            //Something else
        });
        firebase.auth().signOut()
        .then(function() {
        // Sign-out successful.
        })
        .catch(function(error) {
        // An error happened
        });
    }
});
