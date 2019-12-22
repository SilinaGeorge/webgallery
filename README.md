---
A Simple Web Gallery Application
- make a web gallery (login/signup) and upload images
- comment on other people images and like/dislike them
---

# The Web Gallery REST API Documentation

## How to Run
-open command line window, navigate to /webgallery run nodmeon app.js to run server on port 3000
- open another command line window, navigate to /webgallery/static run browser-sync start --server --files="**/*"
- browser window will open, make sure port is on 3000


## Signup/in/out API

### Signup
- description: create new user
- request: `POST /signup/`
    - content-type: `application/json`
    - username: (string) username for new user
    - password: (string) password for new user
- resonse: 200
    - body: user __________ signed up
- response: 409
    - body: username ________ already exists

```
curl -H "Content-Type: application/json" 
    -X POST -d '{"username":"alice","password":"alice"}' 
    localhost:3000/signup/
```

### Signin
- description: sign in into application
- request: `POST /signin/`
    - content-type: `application/json`
    - username: (string) username for singing in
    - password: (string) password for singing in
- resonse: 200
    - body: user __________ signed in
- response: 401
    - body: access denied

```
curl -H "Content-Type: application/json" 
    -X POST -d '{"username":"alice","password":"alice"}' 
    localhost:3000/signin/
```

### Signout
- description: sign out of  application
- response: 200
    - redirect to home
- response: 401
    - body: access denied

```
curl  localhost:3000/signout/
```

## Users API

### Read

- description: retrieve all users
- request: `GET /api/users/`   
- response: 200
    - content-type: `application/json`
    - body: list of strings - usernames
- response: 401
    - body: access denied
 
``` 
$ curl http://localhost:3000/api/users
``` 

## Images API

### Create

- description: create a new image
- request: `POST /api/images/`
    - content-type: `multipart/form-data`
    - picture: (path) image file path
    - title: (string) the title of the image
    - author: (string) the authors name of the image
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - title: (string) the title of the image
      - author: (string) the authors name of the image
      - picture: (object) the image file information
      - createdAt: (string) date of creation
      - updatedAt: (string) date of last edit

```
curl -X POST 
    
    -H "Content-Type: multipart/form-data"
    -F "picture=@C:\Users\Silina\Desktop\download.jpg"
    -F "title=This is the title"
    -F "author=I am the author"
    http://localhost:3000/api/images 
```

### Delete
  
- description: delete the image id
- request: `DELETE /api/images/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - title: (string) the title of the image
      - author: (string) the authors name of the image
      - picture: (object) the image file information
      - createdAt: (string) date of creation
      - updatedAt: (string) date of last edit
- response: 404
    - body: Image id:______ does not exists
- response: 401
    - body: access denied
- response: 403
    - body: forbidden
``` 
$ curl -X DELETE
       http://localhost:3000/api/images/qPm3Vk9eG36T18EU

``` 

### Read

- description: retrieve the image given its ID
- request: `GET /api/images/:id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - title: (string) the title of the image
      - author: (string) the authors name of the image
      - picture: (object) the image file information
      - createdAt: (string) date of creation
      - updatedAt: (string) date of last edit
- response: 404
    - body: Image id:______ does not exists
- response: 401
    - body: access denied
 
``` 
$ curl http://localhost:3000/api/images/stGOHzhb05oqExK8
``` 

### Read

- description: retrieve all image IDs for a specific user
- request: `GET /api/images/users/:username/`   
- response: 200
    - content-type: `application/json`
    - body: list of strings - image IDs
- response: 401
    - body: access denied
 
``` 
$ curl http://localhost:3000/api/images
``` 

### Read

- description: retrieve image file of image
- request: `GET /api/images/:id/picture/`   
- response: 200
    - content-type: `image/***` image mimetype 
    - body: image file
- response: 404
    - body: Image id:______ does not exists
- response: 401
    - body: access denied
 
``` 
$ curl http://localhost:3000/api/images/1Xgaq0RM9MU9mJJy/picture/
``` 

## Comments API


### Create

- description: create a new comment
- request: `POST /api/comments`
    - content-type: `application/json`
    - content: (string) content of the comment
    - imageId: (string) the id of the image that the comment belongs to
    - author: (string) the authors name of the comment
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the comment id
      - content: (string) the content of the comment
      - author: (string) the authors name of the comment
      - imageId: (string) the id of the image that the comment belongs to
      - createdAt: (string) date of creation
      - updatedAt: (string) date of last edit
- response: 401
    - body: access denied

``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"author": "me", "content": "hello world!", "imageId": "irMSDdwy67nGTP8D"}' 
       http://localhost:3000/api/comments
```

### Delete

- description: delete a comment 
- request: `DELETE /api/comments/:id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the comment id
      - content: (string) the content of the comment
      - author: (string) the authors name of the comment
      - imageId: (string) the id of the image that the comment belongs to
      - createdAt: (string) date of creation
      - updatedAt: (string) date of last edit
- response: 404
    - body: Comment id:______ does not exists
- response: 401
    - body: access denied
- response: 403
    - body: forbidden

 
``` 
$ curl  -X DELETE
        http://localhost:3000/api/comments/KM4EtyA1vgRB8lU9
``` 

### Delete

- description: delete all comments belonging to a specified image id
- request: `DELETE /api/comments/image/:id`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the comment id
      - content: (string) the content of the comment
      - author: (string) the authors name of the comment
      - imageId: (string) the id of the image that the comment belongs to
      - createdAt: (string) date of creation
      - updatedAt: (string) date of last edit
- response: 401
    - body: access denied
- response: 403
    - body: forbidden
 
``` 
$ curl  -X DELETE
        http://localhost:3000/api/comments/image/PK27cbv0pqR275FN
``` 

### Read

- description: retrieve the last 10 comments for an image ID 
- request: `GET /api/comments/:id/[?offset=10]`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the comment id
      - content: (string) the content of the comment
      - author: (string) the authors name of the comment
      - imageId: (string) the id of the image that the comment belongs to
      - createdAt: (string) date of creation
      - updatedAt: (string) date of last edit
- response: 401
    - body: access denied
 
``` 
$ curl http://localhost:3000/api/comments/486a6ekRaFrg0luz/
``` 