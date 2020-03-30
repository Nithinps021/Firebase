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

app.get("/", (req, res) => {
  db.collection("students")
    .orderBy("name", "desc")
    .get()
    .then(snapshort => {
      var data = [];
      snapshort.forEach(snap => {
        data.push({
          id: snap.id,
          name: snap.data().name,
          branch: snap.data().branch,
          sem: snap.data().sem,
          date: snap.data().date
        });
      });
      return res.send(data);
    })
    .catch(error => console.log(error));
});

app.post("/students", (req, res) => {
  const newstudent = {
    name: req.body.name,
    branch: req.body.branch,
    sem: req.body.sem,
    date: admin.firestore.Timestamp.fromDate(new Date())
  };
  db.collection("students")
    .add(newstudent)
    .then(dat => {
      return res.json({ message: `documeny id ${dat.id} successful` });
    })
    .catch(error => {
      res.status(500).json({ error: "error" });
      console.log(error);
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
  else if (!(isEmail(newUser.email))) error.email = "must be a valid email ";
  if (empty(newUser.passwd)) error.passwd = "Must not be empty";
  if (newUser.passwd !== newUser.confPasswd) error.confpasswd = "Passwd do not match";
  if (empty(newUser.handle)) error.handle = "Must not be empty";

  if (Object.keys(error).length > 0) return res.json(error);

  let userid, token;
  db.doc(`/user/${newUser.handle}`)
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
      userid = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idtoken => {
      token = idtoken;
      const userdetails = {
        username: newUser.handle,
        date: new Date().toISOString(),
        userid
      };
      return db.doc(`/user/${userdetails.username}`).set(userdetails);
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
    else if (!isEmail(loginDetails.username)) error.email = "must be a valid email ";
    if (empty(loginDetails.passwd)) error.passwd = "Must not be empty";

    if (Object.keys(errors).length>0) return res.json(errors);

    firebase.auth().signInWithEmailAndPassword(loginDetails.username,loginDetails.passwd)
    .then(data =>{
        return data.user.getIdToken();
    })
    .then(token=>{
        return res.json({status:signed in sussfully })
    })
    .catch(error =>{
        console.error(error)
        return res.json({error:errors.code})
    })

})

exports.api = functions.https.onRequest(app);
