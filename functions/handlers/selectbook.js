const { db,admin } = require("../util/admin");

exports.sortBook =(req,res) =>{
    db.collection('books').where("forsem",'==',req.body.sem).orderBy('price').get()
    .then(snapshort =>{
        var data =[];
        snapshort.forEach(snap =>{
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
            })
        })
        return res.json(data);
    })
    .catch(error =>{
        console.log(error);
        return res.status(200).json(error)
    })
}

exports.usersBook =(req,res) =>{
    db.collection('/books').where('username' ,'==', req.user.handle).get()
    .then(snapshort =>{
        if (snapshort.empty)
        return res.status(400).json({noBook:'No books added'});
        let userBook=[]
        snapshort.forEach(ele =>{
            userBook.push({
                forsem: ele.data().forsem,
                bookname: ele.data().bookname,
                date: ele.data().date,
                imgURL:ele.data().imgURL,
                status:ele.data().status,
                price:ele.data().price,
                bookId:ele.data().bookId,
                branch:ele.data().branch
            })
        })
        return res.json(userBook);
    })
    .catch(error =>{
        console.error(error);
        return res.status(400).json({error:error.code})
    })
}
