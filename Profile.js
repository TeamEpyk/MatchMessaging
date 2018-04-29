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
            let userid = window.location.pathname;
            userid = userid.substring(userid.lastIndexOf("/")+1);
            if (userid==user.uid){
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
                        "uid2": userid
                    }
                ).done(function (data) {
                    if (data=='friend'){
                        $("#add").hide();
                        $("#mess").hide();
                    } else if (data=='nofriend'){
                        $("#uid1").val(user.uid);
                        $("#uid2").val(userid);
                        $("#suid1").val(user.uid);
                        $("#suid2").val(userid);
                    } else if (data=='pending'){
                        $("#add").prop('disabled', true);
                        $("#add").val("Pending");
                        $("#suid1").val(user.uid);
                        $("#suid2").val(userid);
                    }
                }).fail(function(data){
                    $("#add").hide();
                    $("#mess").hide();
                });
            }
        } else {
            console.log("No user is signed in.");
            window.location = "Login.html";
        }
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
