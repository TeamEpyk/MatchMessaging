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
            $("#profile a").prop('href', '/user/'+firebase.auth().currentUser.uid);
            $("#puid1").val(firebase.auth().currentUser.uid);
            $("#puid2").val(firebase.auth().currentUser.uid);
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

    $("#logout").click(function(){
        logout();
    });

    $("#message").click(function(){
        $("#chat").submit();
    });

    function logout(){
        var u = firebase.auth().currentUser;
        $.post('/user_logout',
            {
                "uid": u.uid
            }
        ).done(function (data) {
            window.location = data;
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
