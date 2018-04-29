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

    $("#register").click(function(){
        let em = $("#email")[0].value;
        let un = $("#username")[0].value;
        let pw = $("#pass")[0].value;
        let pwc = $("#passconfirm")[0].value;
        if (pw!=pwc){
            alert("Passwords do not match.");
        }
        if (pw.length < 6){
            alert("Password must be at least 6 characters.");
        }
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
                let is = $(".i");
                let istring = "";
                for (let i = 0; i<is.length; i++){
                    istring += (is[i].classList.contains('active')|0).toString();
                }
                user.updateProfile({
                    displayName: un,
                    photoURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                }).then(function(){
                    var u = firebase.auth().currentUser;
                    $.post('/user_login',
                        {
                            "uid": u.uid,
                            "displayName": u.displayName,
                            "photoURL": u.photoURL,
                            "interests": istring
                        }
                    ).done(function (data) {
                        window.location = `/user/${u.uid}`;
                    }).fail(function(data){
                        //Something else
                    });
                });
            });
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
        });
    });
});
