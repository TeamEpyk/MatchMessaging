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
                let u1 = user.uid;
                let check = $("input[name='uid2']").val();
                setInterval(getMessages, 100);
                $.post('/get_online_friends',
                    {
                        "u1": u1
                    }
                ).done(function (data) {
                    $("#users").html(data);
                }).fail(function(data){
                    //Something else
                });
        } else {
            console.log("No user is signed in.");
            window.location = "Login.html";
        }
    });

    function getMessages(){
        let u1 = firebase.auth().currentUser.uid;
        let check = $("input[name='uid2']").val();
        $.post('/get_messages',
            {
                "u1": u1,
                "u2": check
            }
        ).done(function (data) {
            $("#messages").html(data);
            $('#messages').scrollTop($('#messages')[0].scrollHeight);
        }).fail(function(data){
            //Something else
        });
    }

    $("#send").click(function(){
        var message = $("#field-message").val();
        if (message.length>0 && message.length < 2000){
            let u1 = firebase.auth().currentUser.uid;
            let check = $("input[name='uid2']").val();
            if (u1==check){
                check = $("input[name='uid1']").val();
            }
            if (check.indexOf('_')>-1){
                window.location = "Index.html";
            }
            $.post('/send_message',
                {
                    "sender": u1,
                    "receiver": check,
                    "message": message
                }
            ).done(function (data) {
                console.log(data);
                if (data=='success'){
                    $.post('/get_messages',
                        {
                            "u1": u1,
                            "u2": check
                        }
                    ).done(function (data) {
                        $("#messages").html(data);
                    }).fail(function(data){
                        //Something else
                    });
                } else {
                    //BLEH
                }
            }).fail(function(data){
                //Something else
            });
        } else {
            alert('Message too long probably idk remind me to fix this later.');
        }
    });
});
