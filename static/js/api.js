var api = (function(){
    var module = {};
    
    /*  ******* Data types *******
        image objects must have at least the following attributes:
            - (String) _id 
            - (String) title
            - (String) author
            - (Date) date
    
        comment objects must have the following attributes
            - (String) _id
            - (String) imageId
            - (String) author
            - (String) content
            - (Date) date
    
    ****************************** */ 

    function send(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }


    function sendFiles(method, url, data, callback){
        var formdata = new FormData();
        Object.keys(data).forEach(function(key){
            var value = data[key];
            formdata.append(key, value);
        });
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }

     module.getCurrentUser = function(){
        var l = document.cookie.split("username=");
        if (l.length > 1) return l[1];
        return null;
    };
    
    module.signup = function(username, password, callback){
        send("POST", "/signup/", {username: username, password: password}, callback);
    };
    
    module.signin = function(username, password, callback){
        send("POST", "/signin/", {username: username, password: password}, callback);
    };
    
    // get all usernames (no pagination)
    module.getUsernames = function(callback){
        send("GET", "/api/users/", null, callback);
    };
    
    // add an image to the gallery
    module.addImage = function(title, file, callback){
        sendFiles("POST", "/api/images/", {title:title, picture: file}, callback);
    };
    
    // delete an image from the gallery given its imageId
    module.deleteImage = function(imageId, callback){
        send("DELETE", "/api/images/" + imageId + "/", null, callback);
    };
    
    // get an image from the gallery given its imageId
    module.getImage = function(imageId, callback){
        send("GET", "/api/images/" + imageId + "/", null, callback);
    };
    
    // get all imageIds for a given username's gallery (no pagination)
    module.getAllImageIds = function(username, callback){
        send("GET", "/api/images/users/" + username + "/", null, callback);
    };
    
    // add a comment to an image
    module.addComment = function(imageId, content, callback){
        send("POST", "/api/comments/",{content: content, imageId: imageId}, callback);
    };
    
    // delete a comment to an image
    module.deleteComment = function(commentId, callback){
        send("DELETE", "/api/comments/" + commentId + "/", null, callback);
    };
    
    // get comments (with pagination)
    module.getComments = function(imageId, page, callback){
        send("GET", "/api/comments/" + imageId  + "/?offset=" + page, null, callback);
    };

    // delete all comments for a given image
    module.deleteImageComments = function(imageId, callback){
        send("DELETE", "/api/comments/image/" + imageId + "/", null, callback);
    }; 
/* 
     module.getCurrentUser = function(callback){
        send("GET", "/api/currentuser", null, callback);
    }  */
    
    return module;
})();