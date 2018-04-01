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
        } else {
            console.log("No user is signed in.");
            window.location = "Login.html";
        }
    });

    $("#send").click(function(){
        var message = $("#field-message").val();
        if (message.length>0){
            $.ajax
            ({
                type: "POST",
                //the url where you want to sent the userName and password to
                url: '/Chat.html',
                dataType: 'json',
                async: true,
                //json object to sent to the authentication url
                data: {
                    "uid": firebase.auth().currentUser.uid,
                    "type": "send",
                    "message": message
                },
                success: function () {

                    alert("Thanks!");
                }
            })
        }
    });
});
