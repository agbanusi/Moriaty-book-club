import React, { Component } from 'react'
import './group.css'
import io from 'socket.io-client';
import EmojiPicker from 'vanilla-emoji-picker/dist/emojiPicker'

const socket = io()

var nav =   navigator.getUserMedia ||
     navigator.webkitGetUserMedia ||
     navigator.mozGetUserMedia ||
    navigator.msGetUserMedia||
    OTPlugin.getUserMedia;

var id
export default class Group extends Component {
    constructor(props){
        super(props);
        this.rec=''
        this.state={
            user:'',
            audioChunk:[],
            config:'',
            group:[],
            chats:[],
            chat:'',
            type:true,
            groupId:''
        }
    }
    async componentDidMount(){
        new EmojiPicker()
        id=this.getCookie('id')
        let groupId=this.getUrlParameter('id')
        groupId=decodeURI(groupId)
        const method=  {method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({id,groupId}) }
        const returned = await fetch('/groupUser',method)
        const data= await returned.json()
        //make sure the server does the .ice.v.iceServers.urls and convert to info
        if(data.status=='success'){
            this.setState({user:data.user, group:data.item,chats:data.item.chats, groupId })
        }else{
            this.props.history.push('/home')
        }
        
    }
    sockets=()=>{
        socket.on('join', data => {
            socket.emit('notify-users',{id:data,ident:this.state.groupId,username:this.state.user.username,return:false})
        })
        socket.on('add-users', data => {
            if(!data.return){
               let reb=this.state.group.filter(i=> i !==data.username)
               this.setState({group: [...reb,data.username]})
               //for a single p2p, for multiple I'll advise you send an array of objects containing id and usernames
               socket.emit('notify-users',{id:data.id,ident:data.ident,username:this.state.user.username,return:true})
            }
            else{
                let reb=this.state.group.filter(i=> i !==data.username)
                this.setState({group: [...reb,data.username]})
            }
        })
        socket.on('remove-user', (id) => {
            let div = document.getElementById('o' + filter(id))
            users.removeChild(div)
        })
        socket.on('chatted', (data) => {
            if (document.getElementById('h' + filter(data.ids)).style.backgroundColor != 'green') {
                document.getElementById('h' + filter(data.ids)).click()
            }
            append(data.ids, data.chat, 'receiver')
        })
    }
    getUrlParameter=(name)=>{
        // eslint-disable-next-line
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(this.props.location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
    getCookie=(name)=>{
        var ident
        let t = decodeURIComponent(document.cookie).split(';')
        t.map(i => {
            let b = i.trim().split('=')
            if (b[0] == name) {
                ident = b[1]
            }
        })
        return ident
    };

    chat=(e)=>{
        this.setState({chat:e.target.id, type:true})
    }

    add=async(item)=>{
        let newer=[...this.state.chats,item]
        let groupId=this.getUrlParameter('id')
        groupId=decodeURI(groupId)
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,grpId:groupId,chats:newer})}
        const dat=await fetch('/updateGroup',method)
        const data= await dat.json()
        if(data.status=='success'){
            return true
        }
        return
    }

    start=()=>{
        navigator.mediaDevices.getUserMedia({audio:true,video:false})
        .then((stream)=>{
            this.record(stream)
            this.rec.start()
            mesAudio.style.color='blue'
            this.setState({type:false})
        })
        .catch((err)=>{
            nav.call(navigator,{audio:true},(stream)=>{
                this.record(stream)
                this.rec.start()
                mesAudio.style.color='blue'
                this.setState({type:false})
            },(er)=>{
                console.log(er.name+' occured, which is '+er.message)
            })
        })
    }

    stop=()=>{
        MesAudio.style.backgroundColor='green'
        this.rec.stop()
    }

    send=()=>{
        let item={message:state.chat, type:true, measure:'text'}
        this.setState((state)=>({chats:[...state.chats,item]}))
        this.add(item)
        //socket.emit('send-message',this.state.chat)
    }

    upload=async(blob)=>{
        return await this.uploadAudio(blob,'johnny11','myt2oqwd')
    }
    uploadAudio=async(file,name,preset)=>{
        let form = new FormData()
        form.append('upload_preset',preset)
        form.append('file',file)
        form.append('resource-type','video')
        const method = {method:'POST',body:form}
        let dat = await fetch(`https://api.cloudinary.com/v1_1/${name}/upload`,method)
        let data = await dat.json()
        return data.secure_url
    }

    record= async(stream)=>{
        let {audioChunk} = this.state
        this.rec=new MediaRecorder(stream)
        this.rec.ondataavailable=async(e)=>{
            audioChunk.push(e.data)
            this.setState({audioChunk})
            if(this.rec.state=='inactive'){
                let blob=new Blob (audioChunk,{type:'audio/mpeg-3'})
                let audio = await this.upload(blob)
                let item={message:audio, type:true, measure:'audio'}
                this.setState((state)=>({chats:[...state.chats,item]}))
                this.add(item)
                //socket.emit('send-audio',blob)
            }
        }
    }
    
    render() {
        const {chat,chats,user,type, group}=this.state
        return (
            <div className='chat'>
                <nav>
                {user.groups.map(i=><Link href={i.url}>{i.name}</Link>)}
                </nav>
                <div className='main'>
                    <div className='header'>
                        <div className='topHeaderChat'>
                            <h1>{group.name}</h1>
                            <img className='imgChat' src={user.img} />
                        </div>
                        <p>{group.list.join(',').length<100?group.list.join(','):group.list.join(',').slice(0,98)+'...'}</p>
                    </div>
                    <div className='backgroundGroup' style={{backgroundImage:user.group.img}}>
                    {chats.map((i,k)=>{
                    if(i.measure=='text'){
                        if(i.type){
                            return <div className='chatsMain' id={k} key={k} style={{backgroundColor:'#1f84c7',marginRight:'60%',marginLeft:'5%'}}>{i.message}</div>
                        }
                        return <div className='chatsMain' id={k} key={k} style={{backgroundColor:'green',marginRight:'5%',marginLeft:'60%'}}>{i.message}</div>
                    }
                    else{
                        if(i.type){
                            return <audio src={i.message} className='chatsMain' id={k} key={k} style={{backgroundColor:'#1f84c7',marginRight:'60%',marginLeft:'5%'}} />
                        }
                        return <audio src={i.message} className='chatsMain' id={k} key={k} style={{backgroundColor:'green',marginRight:'5%',marginLeft:'60%'}} />
                    }
                    })}
                    </div>
                    <div className='inputs'><input id='formded' onChange={this.chat} data-emoji-picker="true" value={chat} /> <button className='sender' id={chat==''?'MesAudio':'message'} onClick={chat==''?(type?this.start:this.stop):this.send}>{chat==''?(type?<i className="fas fa-microphone"></i>:<i className="fas fa-stop" style={{color:'red'}}></i>):<i className="fa fa-paper-plane" aria-hidden="true"></i>}</button></div>
                </div>
            </div>
        )
    }
}
