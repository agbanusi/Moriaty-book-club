const objectID = require('mongodb').ObjectID
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb');

function routes(app,dbe){
    db= dbe.collection('book-club')
    dbb = dbe.collection('book-club-admin')
    idd = process.env.id

    app.get('/',(req,res)=>{
        res.sendFile("index.html")
    })

    //catalog
    app.post('/catalog',(req,res)=>{
        let id = req.body.id
        if(!id){
            dbb.findOne({id: idd},(err,docs)=>{
                if(docs){
                    res.json({status:'success',data:docs.books,options:docs.options,auth:false})
                }else{
                    res.json({'status':'Failed'})
                }
            })
        }else{
            db.findOne({ _id: new ObjectID(req.body.id) },(err,doc)=>{
                if(doc){
                    dbb.findOne({id: idd},(err,docs)=>{
                        res.json({status:'success',data:docs.books,options:docs.options,img:doc.img,auth:true,guest:doc.fullName})
                    })
                }else{
                    dbb.findOne({id: idd},(err,docs)=>{
                        res.json({status:'success',data:docs.books,options:docs.options,auth:false})
                    })
                }
            })
        }
    })
    
    //user data
    app.post('/userData',(req,res)=>{
        let id = req.body.id
        if(!id){
            res.json({'status':'Failed'})
        }else{
            db.findOne({'_id':new ObjectID(id)}, (err,doc)=>{
                if(doc){
                    let docs={...doc}
                    delete docs.password
                    res.json({'status':'success',user:docs})
                }else{
                    res.json({'status':'Failed'})
                }
            })
        }
    })

    //update user books
    app.post('/updateBooks',(req,res)=>{
        let id = req.body.id
        let books=req.body.books
        if(!id){
            res.json({'status':'Failed'})
        }else{
            db.findOneAndUpdate({_id: new ObjectID(id)}, {$push: {books: {$each: {...books, purchase:true, lend:false} } } }, (err,doc)=>{ 
                if(doc){
                    dbb.findOneAndUpdate({id:idd}, {$push: {books: {$each: books } } })
                    let docs={...doc}
                    delete docs.password
                    res.json({user:docs})
                }else{
                    res.json({'status':'Failed'})
                }
            })
        }
    })
    //update user profile img
    app.post('/upload',(req,res)=>{
        let id= req.body.id
        let img = req.body.img
        if(!id){
            res.json({'status':'Failed'})
        }else{
            db.findOneAndUpdate({_id : new ObjectID(id)}, {$set: {profileImg: img} }, (err,doc)=>{
                if(doc){
                    res.json({'status':'success'})
                }else{
                    res.json({'status':'Failed'})
                }
            })
        }
    })

    //add podcast
    app.post('/addPodcast',(req,res)=>{
        let id=req.body.id
        let audio=req.body.audio
        let podId=req.body.podId
        if(!id){
            res.json({'status':'Failed'})
        }else{
            db.findOneAndUpdate({ _: new ObjectID(id)}, {$push: {podcasts: {id: podId, ...audio} }}, (err,doc)=>{
                dbb.findOneAndUpdate({id:idd},{$push: {podcasts: {id: podId,...audio,owner: {name:doc.fullName, avatar:doc.profileImg} } }})
                if(doc){
                    res.json({'status':'success'})
                }else{
                    res.json({'status':'Failed'})
                }
            })
        }
    })

    //add group
    app.post('/addGroup',(req,res)=>{
        let id = req.body.id
        let group = req.body.group
        let grpId= req.body.grpId
        db.findOneAndUpdate({ _id: new ObjectID(id)}, {$push: {groups: {id: grpId, ...group} }}, (err,doc)=>{
            dbb.findOneAndUpdate({id:idd},{$push: {groups: {id: grpId, ...group, chats:[], owner:{name:doc.fullName, avatar:doc.profileImg} } }})
                if(doc){
                    res.json({'status':'success'})
                }else{
                    res.json({'status':'Failed'})
                }
        })
    })

    //register
    app.post('/register',(req,res)=>{
        let form=req.body.form
        db.findOne({username: form[2]},(err,doc)=>{
            if(doc){
                res.json({'status':'Failed'})
            }else{
                bcrypt.hash(form[5], 13, (err, hash)=>{
                    db.insertOne({email:form[3], fullName:form[0]+" "+form[1], username:form[2],password:hash,books:[], podcasts:[], groups:[] },(err, docs)=>{
                        res.cookie('id',docs.ops[0]._id, { maxAge: 3600*24*15, httpOnly: false, sameSite: true })
                        res.json({'status':'success'})
                    })
                })
            }
        })
        

    })

    //login
    app.post('/login',(req,res)=>{
        let name=req.body.username
        let password=req.body.password
        db.findOne({$or: [{username: name}, {email: name} ]}, (err,doc)=>{
            if (doc){
                bcrypt.compare(password,doc.password, (err,result)=>{
                    if(result){
                        res.cookie('id',doc._id, { maxAge: 3600*24*15, httpOnly: false, sameSite: true })
                        res.json({'status':'success'})
                    }else{
                        res.json({'status':'Failed'})
                    }
                })
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //get podcast list
    app.post('/podcastlist',(req,res)=>{
        let id=req.body.id
        let search = req.body.search
        db.findOne({_id: new ObjectID(id)}, (err,docs)=>{
            if(docs){
                dbb.findOne({id:idd}, (err,doc)=>{
                    let podcasts=doc.podcasts
                    podcasts = podcasts.filter(i=>i.audio.name.includes(search))
                    res.json({'status':'success',items: podcasts})
                })
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //get a particular podcast
    app.post('/getPodcast',(req,res)=>{
        let id=req.body.id
        let podId=req.body.podId
        db.findOne({_id: new ObjectID(id)}, (err,doc)=>{
            if(doc){
                dbb.findOne({id:idd}, (err,docs)=>{
                    let podcasts=docs.podcasts
                    let podcast = podcasts.find(i => i.id==podId)
                    res.json({'status':'success',item: podcast, id:podId})
                })
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //update podcast
    app.post('/updatePodcast',(req,res)=>{
        let id=req.body.id
        let podId=req.body.podId
        let type=req.body.type
        db.findOne({_id: new ObjectID(id)}, (err,doc)=>{
            if(doc){
                dbb.findOne({id:idd}, (err,docs)=>{
                    let podcasts=docs.podcasts
                    let podcasts2=doc.podcasts
                    let podcast = podcasts.find(i => i.id==podId)
                    let podcast2= podcasts2.find(i => i.id==podId)
                    let podcastInd = podcasts.findIndex(i => i.id==podId)
                    let podcastInd2 = podcasts2.findIndex(i => i.id==podId)
                    if(type=='like'){
                        podcast.audio.likes=podcast.audio.likes+1
                        podcast2.audio.likes=podcast2.audio.likes+1
                    }else{
                        podcast.audio.listens=podcast.audio.listens+1
                        podcast2.audio.listens=podcast2.audio.listens+1
                    }
                    podcasts = [...podcasts.slice(0,podcastInd),podcast,...podcasts.slice(podcastInd+1)]
                    podcasts2 = [...podcasts2.slice(0,podcastInd2),podcast2,...podcasts2.slice(podcastInd2+1)]
                    db.findOneAndUpdate({id:idd},{$set: {podcasts} })
                    db.findOneAndUpdate({_id: new ObjectID(id)},{$set: {podcasts2} })
                    res.json({'status':'success',item: podcast, id:podId})
                })
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //get group list
    app.post('/grouplist',(req,res)=>{
        let id=req.body.id
        let search = req.body.search
        db.findOne({_id: new ObjectID(id)}, (err,docs)=>{
            if(docs){
                dbb.findOne({id:idd}, (err,doc)=>{
                    let podcasts=doc.groups
                    podcasts = podcasts.filter(i=>i.group.name.includes(search)|| i.group.purpose.includes(search) || i.group.des.includes(search) )
                    res.json({'status':'success',items: podcasts})
                })
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //get user
    app.post('/groupUser',(req,res)=>{
        let id=req.body.id
        let grpId = req.body.groupId
        db.findOne({_id: new ObjectID(id)}, (err,doc)=>{
            if(doc){
                dbb.findOne({id:idd}, (err,docs)=>{
                    let podcasts=docs.groups
                    let podcast = podcasts.find(i => i.id==grpId)
                    podcast.list=[...podcast.list, doc.username]
                    let podInd = podcasts.findIndex(i => i.id==grpId)
                    podcasts=[...podcasts.slice(0,podInd),podcast,...podcasts.slice(podInd)]
                    dbb.findOneAndUpdate({id:idd},{$set:{podcasts}})
                    let docses={...doc}
                    delete docses.password
                    res.json({'status':'success',item: podcast, id:grpId, user:docses})
                })
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //update chats
    app.post('/updateGroup',(req,res)=>{
        let id=req.body.id
        let grpId=req.body.grpId
        let chats=req.body.chats
        db.findOne({_id: new ObjectID(id)}, (err,doc)=>{
            if(doc){
                dbb.findOne({id:idd}, (err,docs)=>{
                    let podcasts=docs.groups
                    let podcast = podcasts.find(i => i.id==grpId)
                    let podcastInd = podcasts.findIndex(i => i.id==grpId)
                    podcast.chat = chats
                    podcasts = [...podcasts.slice(0,podcastInd),podcast,...podcasts.slice(podcastInd+1)]
                    db.findOneAndUpdate({id:idd},{$set: {podcasts} })
                    res.json({'status':'success'})
                })
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //get book
    app.post('/book',(req,res)=>{
        let id=req.body.id
        let bookId=req.body.bookId
        db.findOne({_id: new ObjectID(id)}, (err,doc)=>{
            if(doc){
                dbb.findOne({id:idd},(errs,docs)=>{
                    let books= docs.books
                    let bookUser = doc.books.find(i=> i.id==bookId)
                    let book = books.find(i=> i.id==bookId)
                    res.json({'status':'success', book:{...book, email:doc.email, img:doc.profileImg, name: doc.fullName, purchase: bookUser.purchase} })
                })
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //after payment
    app.post('/payComplete',(req,res)=>{
        let id=req.body.id
        let bookId = req.body.bookId
        let orderId = req.body.orderId
        let type = req.body.type
        db.findOne({_id: new ObjectID(id)}, (err,doc)=>{
            if(doc){
                let books=doc.books
                let book = books.filter(i=>i.id==bookId)
                let ind= books.findIndex(i=>i.id==bookId)
                book.purchase=true
                book.lend= type
                book.orderId=orderId
                books=[...books.slice(0,ind),book,...books.slice(ind+1)]
                db.findOneAndUpdate({_id:new ObjectID(id)}, {$set: {books} })
                res.json({'status':'success', book})
            }else{
                res.json({'status':'Failed'})
            }
        })
    })

    //after sold
    app.post('/trade',(req,res)=>{

    })
    app.get('*',(req,res)=>{
        res.sendFile("index.html", {root:'client/dist'})
    })
}
module.exports=routes