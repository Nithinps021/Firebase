const functions = require("firebase-functions");
const express = require("express");

const {getAllBooks,addBooks,addimg} = require('./handlers/books')
const {sortBook} = require('./handlers/selectbook')
const {signup,login} = require('./handlers/user')
const {FBauth} = require('./util/fbauth')

const app = express();

//books route
app.get("/allbooks",getAllBooks);
app.post("/addbook",FBauth,addBooks);
app.post("/addimg",addimg);
app.post('/sortbook',sortBook);

//user route
app.post("/signup",signup);
app.post('/login',login);

exports.api = functions.https.onRequest(app);
