const { db,admin } = require("../util/admin");

exports.sortBook =(req,res) =>{
    db.collection('books').where("forsem",'==',req.body.sem).orderBy('name').get()
    .then(snapshort =>{
        var data =[];
        snapshort.forEach(doc =>{
            data.push(doc.data())
        })
        return res.json(data);
    })
    .catch(error =>{
        console.log(error);
        return res.status(200).json(error)
    })
}