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
            if (window.location.pathname.substring(6)==user.uid){
                $("#add").hide();
                $.post('/get_notifications',
                    {
                        "uid": user.uid
                    }
                ).done(function (data) {
                    $("#notifications").html(data);
                }).fail(function(data){
                });
            } else {
                $.post('/friend_status',
                    {
                        "uid1": user.uid,
                        "uid2": window.location.pathname.substring(6)
                    }
                ).done(function (data) {
                    if (data=='friend'){
                        $("#add").hide();
                    } else if (data=='nofriend'){
                        $("#uid1").val(user.uid);
                        $("#uid2").val(window.location.pathname.substring(6));
                    } else if (data=='pending'){
                        $("#add").prop('disabled', true);
                        $("#add").val("Pending");
                    }
                }).fail(function(data){
                    $("#add").hide();
                });
            }
        } else {
            console.log("No user is signed in.");
            window.location = "Login.html";
        }
    });

    $("#add").click(function(){

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
