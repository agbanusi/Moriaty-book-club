require('dotenv').config();
const express= require('express')
const app  =express()
const bodyParser=require('body-parser')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const mongodb = require('mongodb').MongoClient
const routes = require('./backend/routes')
const sockets = require('./backend/socket')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// Serve static files from the React app
app.use(express.static(__dirname+'/client/dist'));

mongodb.connect(process.env.DB,{ useUnifiedTopology: true },(err,client)=>{
    const db =client.db('Cluster0')
    //home
    routes(app,db)
    sockets(app,io)
    http.listen(process.env.PORT || 5000, () => {
        console.log('listening on port 5000');
    })
})





//app.listen(5000, console.log('server listening at port 5000'))