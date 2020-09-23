var users_list = []

function socket(app,io){
    io.on('connection', socket => {

        users_list.push(socket.id)
        
        socket.emit('join', socket.id )

        socket.on('notify-users',(data)=>{
            if(data.return){
                socket.in(data.ident).emit('add-users', {id:data.id,ident:data.ident, return:true,username:data.username}) 
            }
            else{
                socket.join(data.ident)
                socket.in(data.ident).emit('add-users', {id:data.id,ident:data.ident, return:false,username:data.username})
            }
        })
        
        //socket.broadcast.emit()
        socket.on('chat', (data) => {
        //if (io.sockets.connected[data.id] !== null) {
        socket.to(data.id).emit('chatted', data)
            //}
        })

        socket.on('disconnect', () => {
            //console.log(socket.id + ' disconnected')
            users_list = users_list.filter(i => i !== socket.id)
            io.emit('remove-user', socket.id)
        })

    })
}
module.exports=socket