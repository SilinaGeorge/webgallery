const express = require('express');
const app = express();

var Datastore = require('nedb'), 
    users = new Datastore({ filename: 'db/users.db', autoload: true }),
    comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData : true}),
    images = new Datastore({ filename: 'db/images.db', autoload: true , timestampData : true});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('static'));

const path = require('path');
var multer  = require('multer');
var upload = multer({ dest: path.join(__dirname, 'uploads')});

const crypto = require('crypto');

const session = require('express-session');
app.use(session({
    secret: 'please change this secret',
    resave: false,
    saveUninitialized: true,
}));

function generateSalt (){
    return crypto.randomBytes(16).toString('base64');
}

function generateHash (password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');
}

const cookie = require('cookie');

app.use(function (req, res, next){
    req.user = ('user' in req.session)? req.session.user : null;
    var username = (req.user)? req.user._id : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    next();
});

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

var isAuthenticated = function(req, res, next) {
    if (!req.user) return res.status(401).end("access denied");
    next();
};

 var Comment = (function(){
    return function item(comment){
        this.content = comment.content;
        this.author = '';
        this.imageId = comment.imageId;
    };
}());

var Image = (function(){
    return function item(image){
        this.title = image.title;
        this.author = '';
        this.picture = '';
    };
}()); 


// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
app.post('/signup/', function (req, res, next) {
     var username = req.body.username;
    var password = req.body.password;
      users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("username " + username + " already exists");
         // generate a new salt and hash
        var salt = generateSalt();
        var hash = generateHash(password, salt);

         users.update({_id: username},{_id: username, hash: hash, salt: salt}, {upsert: true}, function(err){
            if (err) return res.status(500).end(err);
            // initialize cookie
             res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                  path : '/', 
                  maxAge: 60 * 60 * 24 * 7
            })); 
            return res.json("user " + username + " signed up");
        });  
    });   
    
});

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
app.post('/signin/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    // retrieve user from the database
    users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("access denied");
        if (user.hash !== generateHash(password, user.salt)) return res.status(401).end("access denied"); // invalid password
         // start a session
         req.session.user = user;

        // initialize cookie
        res.setHeader('Set-Cookie', cookie.serialize('username', username, {
              path : '/', 
              maxAge: 60 * 60 * 24 * 7
        }));
       
        return res.json("user " + username + " signed in");
    });
});

// curl -b cookie.txt -c cookie.txt localhost:3000/signout/
app.get('/signout/', isAuthenticated, function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    res.redirect('/');
});

 
app.post('/api/images/', upload.single('picture'), isAuthenticated, function (req, res, next) {
    var image = new Image(req.body);
    image.author = req.user._id;
    image.picture = req.file;
    images.insert(image, function (err, image) {
        if (err) return res.status(500).end(err);
        res.contentType = "application/json";
        return res.json(image);
    });  
});

app.get('/api/users/', isAuthenticated, function (req, res, next) {
    users.find({}).sort({createdAt:1}).exec( function (err, docs) {
        var ids = docs.map(function (el) { return el._id; });
        return res.json(ids);
    });
  
});


app.get('/api/images/:id/', isAuthenticated, function (req, res, next) {
    images.findOne({_id: req.params.id}, function(err, image){
       if (err) return res.status(500).end(err);
       if (!image) return res.status(404).end("Image id:" + req.params.id + " does not exists");
       res.contentType = "application/json";
       return res.json(image);
           
   }); 

});

app.delete('/api/images/:id/', isAuthenticated, function (req, res, next) {
         images.findOne({_id: req.params.id}, function(err, image){
            if (err) return res.status(500).end(err);
            if (image.author !== req.user._id) return res.status(403).end("forbidden");
            if (!image) return res.status(404).end("Image id:" + req.params.id + " does not exists");
            images.remove({ _id: image._id }, { multi: false }, function(err, num) {  
                res.contentType = "application/json";
                return res.json(image);
             });
        });    
         
    });

    app.get('/api/images/users/:username/',isAuthenticated, function (req, res, next) {
          images.find({author: req.params.username}).sort({createdAt:1}).exec( function (err, docs) {
             if (err) return res.status(500).end(err);
            var ids = [];
            ids = docs.map(function (el) { return el._id; });
            return res.json(ids);
        });     
    });


app.post('/api/comments/', isAuthenticated, function (req, res, next) {
    var comment = new Comment(req.body);
    comment.author = req.user._id;
    comments.insert(comment, function (err, comment) {
        if (err) return res.status(500).end(err);
        res.contentType = "application/json";
        return res.json(comment);
    });  
});

app.delete('/api/comments/:id/', isAuthenticated, function (req, res, next) {
     comments.findOne({_id: req.params.id}, function(err, comment){
        if (err) return res.status(500).end(err);

         var author = images.findOne({_id: comment.imageId}, function(err, image){
            if (!image) return res.status(404).end("Image id:" + comment.imageId + " does not exists");   

            if (comment.author !== req.user._id && image.author != req.user._id)
                return res.status(403).end("forbidden");
            if (!comment) return res.status(404).end("Comment id:" + req.params.id + " does not exists");
            comments.remove({ _id: comment._id }, { multi: false }, function(err, num) {
                    res.contentType = "application/json";  
                    return res.json(comment);
                }); 
        });


        

    });   
     
});

app.delete('/api/comments/image/:id/', isAuthenticated, function (req, res, next) {

    comments.find({imageId: req.params.id}, function(err, image_comments){
       if (err) return res.status(500).end(err);

       // remove image comments
       image_comments.forEach(element =>  {
            if (element.author !== req.user._id) return res.status(403).end("forbidden");
            comments.remove({ _id: element._id }, { multi: false }, function(err, num) {
                res.contentType = "application/json";  
                
            });
       });
       return res.json(image_comments);
       
   });   
    
});

app.get('/api/comments/:id', isAuthenticated, function (req, res, next) {
    
     comments.find({imageId: req.params.id}).sort({createdAt:-1}).skip(parseInt(req.query.offset)).limit(10).exec(function(err, data) { 
        return res.json(data.reverse());
        
    }); 
});

app.get('/api/images/:id/picture/', isAuthenticated, function (req, res, next) {
        images.findOne({_id: req.params.id }, function(err, image){
        if (err) return res.status(500).end(err);
        if (!image) return res.status(404).end("Image id:" + req.params.id  + " does not exists");
        
        var picture_content = image.picture;
        
        res.setHeader('Content-Type', picture_content.mimetype);
        return res.sendFile(picture_content.path);
    }); 

});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});