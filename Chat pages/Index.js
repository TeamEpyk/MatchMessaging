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

    $("#find").click(function(){
        $.post('/get_match',
            {
                "uid": firebase.auth().currentUser.uid
            }
        ).done(function (data) {
            $("#results").html(data);
        }).fail(function(data){
        });
    });
});
