const { db } = require("../util/admin");
const firebase = require('firebase');
const {config} = require('../util/config');
const {validateSignupData,validateLoginData} = require('../util/validators');

firebase.initializeApp(config);

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    passwd: req.body.passwd,
    confPasswd: req.body.confPasswd,
    handle: req.body.handle
  };
  const {errors,valid} = validateSignupData(newUser)
  if(!valid) return res.status(400).json(errors)

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
};

exports.login = (req, res) => {
  const loginDetails = {
    username: req.body.Email,
    passwd: req.body.passwd
  };

  const { errors,valid} = validateLoginData(loginDetails)

  if(!valid) return res.status(400).json(errors);
 
  firebase
    .auth()
    .signInWithEmailAndPassword(loginDetails.username, loginDetails.passwd)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token: `${token}` });
    })
    .catch(error => {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        return res.status(400).json({ Error: "Invalid user" });
      } else if (error.code === "auth/wrong-password") {
        return res.status(400).json({ Error: "Wrong password " });
      } else {
        return res.status(400).json({ error: error.code });
      }
    });
};
