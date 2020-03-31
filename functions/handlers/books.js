const { db } = require("../util/admin");

exports.getAllBooks = (req, res) => {
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
};

exports.addBooks = (req, res) => {
  const newbook = {
    username: req.user.handle,
    forsem: req.body.whichsem,
    bookname: req.body.bookname,
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
};
