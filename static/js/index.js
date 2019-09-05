(function(){
    "use strict";

    var id;
    var comment_offet = 0;
    var user;
    var view_user;

    function DeleteEvent() {

        // delete current image
        document.getElementById('delete_button').addEventListener('click', function(e){
            api.getAllImageIds(user, function(err, imageIds){
                if (err) console.log(err);
                if (imageIds){
                    var index = imageIds.indexOf(id);

                    api.deleteImage(id, function(err){
                        if (err) console.log(err);
                    });
                    api.deleteImageComments(id, function(err){
                        if (err) console.log(err);
                    });
                    showUser();

                }
                
            });

        });
    }

    function showImageDetails (image){
        
        id = image._id;
        comment_offet = 0;

        document.getElementById("display_image").src = `/api/images/${image._id}/picture/`;
        document.getElementById('image_info').innerHTML = `<div class="image_title">Title: ${image.title} </div>
        <div class="image_author">Author: ${image.author}</div>`;

        showLayout();

        document.getElementById("comments").innerHTML = "";

    }


    function CommentForm(){
        // read form elements
        var content = document.getElementById("comment_content").value;

        // clean form
        document.getElementById("create_comment_form").reset();

        // add new comment to db
        //var comment = api.addComment(current_image.imageId, username, content);

        api.addComment(id, content ,function(err){
            if (err) console.log(err);
        });

        document.getElementById("comments").innerHTML = "";

        // add comments to html
        api.getComments(id, 0, function(err, comments){
            if (err) console.log(err);
            if (comments.length > 0)
                comments.forEach(insertComment);
        });

    }

    function insertUser(vuser){
        var div_element = document.createElement('div');
        //div_element.className = "comment";
        div_element.innerHTML=`
        <div class='username'>${vuser}</div>`;

        div_element.querySelector(".username").addEventListener('click', function(){
            view_user = vuser;
            document.getElementById("userlist").style.display = "none";
            showUser();
            showLayout();

            if (view_user != user)
                document.getElementById('delete_button').style.display = "none";
            else
                document.getElementById('delete_button').style.display = "grid";
        });

        document.getElementById("userlist").append(div_element);

    }

    function insertComment(comment){
        
        // create a new message element
        var div_element = document.createElement('div');
        div_element.className = "comment";

        var nowDate = new Date(comment.createdAt);
        var date_formatted = (nowDate.getMonth()+1) +'/'+ nowDate.getDate() + "/" + nowDate.getFullYear() + "   " + nowDate.getHours() + ":" + nowDate.getMinutes(); 

        div_element.innerHTML=`
            <div class="comment_username">${comment.author}</div>
            <div class="comment_content">${comment.content}</div>
            <div class="comment_date">${date_formatted}</div>
            <div class="comment_delete_button"></div>
        `;
        
        if (comment.author != user && view_user != user)
            div_element.querySelector(".comment_delete_button").style.display = 'none';


        div_element.querySelector(".comment_delete_button").addEventListener('click', function(){

            
            div_element.parentNode.removeChild(div_element);
            
            //api.deleteComment(comment.commentId); 
            api.deleteComment(comment._id, function(err){
                if (err) console.log(err);
            });

        
        });  

        // add this element to the document
        document.getElementById("comments").prepend(div_element);
    }

    function hideLayout()
    {
        document.getElementById("layout").style.display = "none";
            
        //document.getElementById('home_button').style.display = "none";

    }

    function showLayout()
    {
        document.getElementById("layout").style.display = "grid";
        document.getElementById('home_button').style.display = "grid";
    }

    function showUser(){
                   // view next image
                   document.getElementById('next').addEventListener('click', function(e){
                    api.getAllImageIds(view_user, function(err, imageIds){
                        if (err) console.log(err);
                        if (imageIds){
                            var index = imageIds.indexOf(id);
                            if (index + 1 < imageIds.length){
                                api.getImage(imageIds[index + 1] ,function(err, next_image){
                                    if (err) console.log(err);
                                    showImageDetails (next_image);
    
                                    api.getComments(next_image._id, 0, function(err, comments){
                                        if (err) console.log(err);
                                        if (comments.length > 0)
                                        comments.forEach(insertComment);
                                    });
                                });
                            }
    
                        }
                        
                    });
                });
                    
                // view prev image
                document.getElementById('prev').addEventListener('click', function(e){
                    api.getAllImageIds(view_user, function(err, imageIds){
                        if (err) console.log(err);
                        
                        if (imageIds){
                            var index = imageIds.indexOf(id);
                            if (index - 1 >= 0){
                                api.getImage(imageIds[index - 1] ,function(err, prev_image){
                                    if (err) console.log(err);
                                    showImageDetails (prev_image);
    
                                    api.getComments(prev_image._id, 0, function(err, comments){
                                        if (err) console.log(err);
                                        if (comments.length > 0)
                                        comments.forEach(insertComment);
                                    });
                                });
                            } 
    
                        }
                                    
                    });
                }); 
    
            
                // show first image if there is one
                api.getAllImageIds(view_user, function(err, ids){
                    if (err) return console.log(err);
                    var imagesIds = ids;
    
                    // hide layout if there are no images to be displayed
                    if (imagesIds.length > 0)
                    {
                        api.getImage(imagesIds[0], function(err, next_image){
                            if (err) console.log(err);
                            showImageDetails (next_image);
    
                            api.getComments(next_image._id, 0, function(err, comments){
                                if (err) console.log(err);
                                if (comments.length > 0)
                                comments.forEach(insertComment);
                            });
                        });
                    }
                    else
                    {
                        hideLayout();
                    }
                });
    }

     window.addEventListener('load', function(){

        user = api.getCurrentUser();

        if (!user){
            document.querySelector('#signin_button').classList.remove('hidden');
            hideLayout();
            document.getElementById('home_button').style.display = "none";
        }
        else 
        {

            document.querySelector('#signout_button').classList.remove('hidden');
            DeleteEvent();

            document.getElementById('home_button').addEventListener('click', function(e){
                document.getElementById("userlist").innerHTML = `<h2>User Galleries</h2>`;
                hideLayout();
                document.getElementById("userlist").style.display = "grid";
                api.getUsernames(function(err, users){
                    if (err) console.log(err);
                    if (users.length > 0)
                    users.forEach(insertUser);
                });
            });
            
            document.getElementById('home_button').click();


            // post a comment
            document.getElementById('create_comment_form').addEventListener('submit', function(e){

                // prevent from refreshing the page on submit
                e.preventDefault();
                CommentForm();
                
            });

            // add image to gallery button submit click
            document.getElementById('image_form').addEventListener('submit', function(e){
                view_user = user;
                // prevent from refreshing the page on submit
                e.preventDefault();

                var title = document.getElementById("post_title").value;
                var url = document.getElementById("image_url").files[0];

                // clear add image form
                document.getElementById("image_form").reset();

                // close popup
                var popup = document.getElementById("image_form");
                popup.classList.toggle("show");

                // add to db
                api.addImage(title, url, function(err, image){
                    if (err) console.log(err);
                    document.getElementById("userlist").style.display = 'none';
                    showImageDetails (image);

            
                });

            });

            // add new image click,toggle add image form
            document.getElementById('add_button').addEventListener('click', function(e){
                // show add image form
                var popup = document.getElementById("image_form");
                popup.classList.toggle("show");
            });

            // cancel button click in add image form, ottgle add image form off
            document.getElementById('add_image_cancel_button').addEventListener('click', function(e){
                // hide add image form
                var popup = document.getElementById("image_form");
                popup.classList.toggle("show");
            });



            // next comment page
            document.getElementById('next_comment_button').addEventListener('click', function(e){

                comment_offet += 10;


                api.getComments(id, comment_offet, function(err, comments){
                    if (err) console.log(err);
                    if (comments.length > 0)
                    {
                        document.getElementById("comments").innerHTML = "";
                        comments.forEach(insertComment);
                    }
                    else
                        comment_offet -= 10;
                });


            });

            // previous comment page
            document.getElementById('prev_comment_button').addEventListener('click', function(e){
                comment_offet -= 10;

                api.getComments(id, comment_offet, function(err, comments){
                    if (err) console.log(err);
                    if (comments.length > 0)
                    {
                        document.getElementById("comments").innerHTML = "";
                        comments.forEach(insertComment);
                    }
                    else
                        comment_offet += 10;
                });
            });


             api.getComments(id, comment_offet, function(err, comments){
                if (err) console.log(err);
                document.getElementById("comments").innerHTML = ""; 
                if (comments.length > 0)
                comments.forEach(insertComment);
            }); 
    }      
}); 

}());
