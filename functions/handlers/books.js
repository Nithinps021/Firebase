const { db,admin } = require("../util/admin");
const BusBoy = require("busboy");
const os = require("os");
const fs = require('fs');
const path = require("path");
const {config } = require('../util/config');

let imgurl='';

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
          date: snap.data().date,
          imgURL:snap.data().imgURL,
          phoneNo:snap.data().phoneNo,
          status:snap.data().status,
          price:snap.data().price,
          bookId:snap.data().bookId,
          branch:snap.data().branch

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
    imgURL:req.body.imgURL,
    date: new Date().toISOString(),
    price:req.body.price,
    branch:req.body.branch,
    status:req.body.status,
    phoneNo:req.body.phoneNo
  };
  imgurl='';
  db.collection("books")
    .add(newbook)
    .then(dat => {
      // return res.json({ message: `documeny id ${dat.id} successful` });
      return db.doc(`/books/${dat.id}`).update({bookId:dat.id})
    })
    .then(() =>{
      return res.json({status:'book added successfully'});
    })
    .catch(error => {
      console.log(error);
      return res.status(500).json({ error: error.code });
    });
};

exports.addimg = (req,res) =>{
  busboy = new BusBoy({headers : req.headers})
  let imgName;
  let imgTobeUploaded ={};

  busboy.on('file',(fieldname,file,filename,encoding,MimeType)=>{

    const imgExtension = filename.split('.')[filename.split('.').length -  1];
    imgName =`${Math.round(Math.random()*1000000000000)}.${imgExtension}`;
    const filepath = path.join(os.tmpdir(),imgName);
    imgTobeUploaded = { filepath , MimeType};
    file.pipe(fs.createWriteStream(filepath)); 
  });
  busboy.on('finish' ,()=>{
     admin.storage().bucket().upload(imgTobeUploaded.filepath,{
        resumable:false,
        metadata:{
          metadata:{
            contentType: imgTobeUploaded.MimeType,
          }
        }
      })
      .then(()=>{
        imgurl=`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imgName}?alt=media`;
        return res.json({status:`${imgurl}` })
      })
      .catch(error =>{
        console.log(error)
        return res.json({error:error});
      })
  })
  busboy.end(req.rawBody);
}

exports.deleteBook = (req,res) =>{
  db.doc(`/books/${req.body.bookId}`).delete()
  .then(() =>{
    return res.json({info:'The book has been successfully removed'})
  })
  .catch(error => {
    console.error(error)
    return res.status(400).json({error:error.code})
  })
}

exports.updateBook =(req,res) =>{

  const updatedDetails ={
    forsem:req.body.forsem,
    bookname:req.body.bookname,
    imgURL:req.body.imgURL,
    price:req.body.price,
    branch:req.body.branch,
  }
  db.doc(`/books/${req.body.bookId}`).update(updatedDetails)
  .then(()=>{
    return res.json({info:'Book updated successfully'})
  })
  .catch(error =>{
    console.error(error);
    return res.status(400).json({error:error.code})
  })
}