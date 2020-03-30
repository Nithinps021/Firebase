const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyCzwi86HWOiy_pr6gZCq_HG9bylp9NmUY0",
  authDomain: "fir-fbb84.firebaseapp.com",
  databaseURL: "https://fir-fbb84.firebaseio.com",
  projectId: "fir-fbb84",
  storageBucket: "fir-fbb84.appspot.com",
  messagingSenderId: "115174481107",
  appId: "1:115174481107:web:b4f84c9ff819a00efd0826",
  measurementId: "G-7MYHV9QCN7"
};
admin.initializeApp();
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();
const app = express();

app.get("/allbooks", (req, res) => {
  db.collection("books")
    .orderBy("date", "desc")
    .get()
    .then(snapshort => {
      var data = [];
      snapshort.forEach(snap => {
        data.push({
          username: snap.data().username,
          forsem: snap.data().forsem,
          bookname: snap.data().bookname,
          date: snap.data().date
        });
      });
      return res.send(data);
    })
    .catch(error => console.log(error));
});

const FBauth = (req,res,next) =>{
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
    idToken = req.headers.authorization.split('Bearer ')[1];
  }
  else{
    return res.json({error:"unauthorised access"})
  }
  admin.auth().verifyIdToken(idToken)
  .then(decodedToken=>{
    req.user=decodedToken;
    console.log(decodedToken);
    return db.collection('users')
    .where('userId','==',req.user.uid)
    .limit(1)
    .get();
  })
  .then(data =>{
    req.user.handle = data.docs[0].data().username;
    return next();
  })
  .catch(error=>{
    console.log(error);
    return res.json({error:error.code})
  })
}

app.post("/addbook",FBauth, (req, res) => {
  const newbook = {
    username: req.user.handle,
    forsem: req.body.whichsem,
    bookname:req.body.bookname,
    // date: admin.firestore.Timestamp.fromDate(new Date())
    date: new Date().toISOString()
  };
  db.collection("books")
    .add(newbook)
    .then(dat => {
      return res.json({ message: `documeny id ${dat.id} successful` });
    })
    .catch(error => {
      console.log(error);
      return res.status(500).json({ error: error.code });
      
    });
});

//sign up
const isEmail = email => {
  const regEx =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
    return regEx.test(String(email).toLowerCase());
};

const empty = string => {
  if (String(string).trim()==="") return true;
  else return false;
};

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    passwd: req.body.passwd,
    confPasswd: req.body.confPasswd,
    handle: req.body.handle
  };

  let error = {};

  if (empty(newUser.email)) error.email = "Must not be empty";
  else if (!isEmail(newUser.email)) error.email = "must be a valid email ";
  if (empty(newUser.passwd)) error.passwd = "Must not be empty";
  if (newUser.passwd !== newUser.confPasswd) error.confpasswd = "Passwd do not match";
  if (empty(newUser.handle)) error.handle = "Must not be empty";

  if (Object.keys(error).length > 0) return res.json(error);

  let userId; 
  let token;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "the username already exist" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.passwd);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idtoken => {
      token = idtoken;
      const userdetails = {
        username: newUser.handle,
        date: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${userdetails.username}`).set(userdetails);
    })
    .then(() => {
      return res.json({ note: `user registerd successfully ${token}` });
    })
    .catch(err => {
      console.log(err);
      return res.json({ error: err.code });
    });
});

//login

app.post('/login',(req,res)=>{

    const errors ={}
    const loginDetails ={
        username:req.body.Email,
        passwd:req.body.passwd,
    }
    if (empty(loginDetails.username)) error.email = "Must not be empty";
    else if (!isEmail(loginDetails.username)) error.email = "must be a valid email";
    if (empty(loginDetails.passwd)) error.passwd = "Must not be empty";

    if (Object.keys(errors).length>0) return res.json(errors);

    firebase.auth().signInWithEmailAndPassword(loginDetails.username,loginDetails.passwd)
    .then(data =>{
        return data.user.getIdToken();
    })
    .then(token=>{
        return res.json({status:`signed in sussfully ${token}` })
    })
    .catch(error =>{
        console.error(error);
        if(error.code === 'auth/user-not-found'){
          return res.json({Error: "Invalid user"})
        }
        else if(error.code === 'auth/wrong-password'){
          return res.json({Error:"Wrong password "})
        }
        else{
          return res.json({error:error.code})
        }
    })

})

exports.api = functions.https.onRequest(app);
