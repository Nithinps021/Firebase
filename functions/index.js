const functions = require("firebase-functions");
const express = require("express");

const {getAllBooks,addBooks,addimg,deleteBook,updateBook} = require('./handlers/books')
const {sortBook,usersBook} = require('./handlers/selectbook')
const {signup,login,updateInfo,userInfo} = require('./handlers/user')
const {FBauth} = require('./util/fbauth')

const app = express();

//books route
app.get("/allbooks",getAllBooks);
app.post("/addimg",addimg);
app.post('/sortbook',sortBook);

//user route
app.post("/signup",signup);
app.post('/login',login);
app.post('/updateinfo',FBauth,updateInfo);
app.get('/userinfo',FBauth,userInfo);

// user and book
app.get('/usersbooks',FBauth,usersBook);
app.post('/deletebook',FBauth,deleteBook);
app.post("/addbook",FBauth,addBooks);
app.post('/updatebook',FBauth,updateBook);


exports.api = functions.https.onRequest(app);
