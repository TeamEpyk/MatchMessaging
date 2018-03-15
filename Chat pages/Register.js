document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");

    var config = {
        apiKey: "AIzaSyBZm6-coQ4Mk1WnLUBSZcjf3OgB-8SJhVM",
        authDomain: "matchmessaging-dfa7e.firebaseapp.com"
    };
    firebase.initializeApp(config);

    $("#register").click(function(){
        let em = $("#email")[0].value;
        let un = $("#username")[0].value;
        let pw = $("#pass")[0].value;
        let pwc = $("#passconfirm")[0].value;
        if (pw==pwc){
            firebase.auth().createUserWithEmailAndPassword(em, pw).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
                console.log(errorMessage);
            }).then(function(){
                window.location = "success.html";
            });
        } else {
            alert("Passwords do not match.");
        }
    });
});
