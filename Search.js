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
            $("#uid").val(user.uid);
        } else {
            console.log("No user is signed in.");
            window.location = "Login.html";
        }
    });

});


function validateSearch(){
    let q = $("#search").val();
    if (q.length==0) return false;
}
