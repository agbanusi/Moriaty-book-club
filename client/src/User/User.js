import React, { Component, useState } from 'react'
import './User.css'
import { Link } from 'react-router-dom'
import shortid from 'shortid'
//remember to export all your coud names and presets to an .env file

var nav =   navigator.getUserMedia ||
     navigator.webkitGetUserMedia ||
     navigator.mozGetUserMedia ||
    navigator.msGetUserMedia||
    OTPlugin.getUserMedia;


export default class User extends Component {
    constructor(props){
        super(props)
        this.state={
            user:{img:'',books:[],library:[]},
            newImg:[],
            popup1:false,
            popup2:false
        }
    }
    async componentDidMount(){
        const sess = this.getCookie('id')
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sess})}
        const dat = await fetch('/userData',method)
        const data = await dat.json()
        if(data.status=='success'){
            this.setState({user:data.user})
        }else{
            this.props.history.push('/home')
        }
        
    }
    
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
    change=(e)=>{
        let ind=Number(e.target.id[0])
        let newImg=this.state.newImg
        switch(e.target.id.slice(1,)){
            case 'title':
               newImg[ind].title=e.target.value
               break;
            case 'description':
                newImg[ind].description=e.target.value
                break;
            case 'free':
                newImg[ind].free=!newImg[ind].free
                break;
            case 'price':
                if(Number(e.target.value) || e.target.value=='.'|| e.target.value==''){
                    newImg[ind].price=e.target.value
                }
                break;
        }
        this.setState({newImg})
    }
    submit=async()=>{
        //send to server and return updated media
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sess,books:this.state.newImg})}
        const dat = await fetch('/updateBooks',method)
        const user = await dat.json()
        this.setState({user,newImg:[]})
    }
    remove=(e)=>{
        var newUser=this.state.user
        newUser.books=[...newUser.slice(0,e.target.id),...newUser.slice(e.target.id+1)]
        this.setState({user:newUser})
    }
    podCast=()=>{
        this.setState((state)=>({popup1:!state.popup1}))
    }
    bookClub=()=>{
        this.setState((state)=>({popup2:!state.popup2}))
    }
    widget=()=>(
        cloudinary.createUploadWidget({
            cloudName: 'johnny11',
            uploadPreset: 'bookClub'}, (error, result) => { 
              if (!error && result && result.event === "success") {
                let link = shortid.generate()+shortid+generate()
                let url= window.location.hostname+'/purchase?id='+encodeURI(link)
                this.setState((state)=>({newImg: [...state.newImg,{id: link, url,book: result.info.secure_url, format:result.info.format, thumbnail:result.info.thumbnail_url.replace('c_limit,h_60,w_90','w_200,h_250,c_fill'),title:'',description:'',free:true,price:''}] }))
              }
            }
        ) 
    )
    widget2=()=>(
        cloudinary.createUploadWidget({
            cloudName: 'johnny11',
            uploadPreset: 'gvvdma98'}, async(error, result) => { 
              if (!error && result && result.event === "success") {
                let user=this.state.user
                user.img=result.info.secure_url
                const sess = this.getCookie('id')
                const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sess,img:result.info.secure_url})}
                const dat = await fetch('/upload',method)
                const data = await dat.json()
                if (data.status == 'success'){
                    this.setState({user})
                }
              }
            }
        )
    )
    render() {
        var {user,newImg,popup1,popup2} = this.state
        return (
            <div className='User'>
                <div className='headUser'>
                    <h2> Welcome {user.name}</h2>
                    <div className='profileUser'>
                        <img src={user.img} className='profile' onClick={()=>{this.widget2().open()}} />
                    </div>
                </div>
                <div className='statsUser'>
                    <h4> Total Books Sold/Borrowed: {user.bookNumber}</h4>
                    <h4> Total Revenue from books: {user.bookRevenue}</h4>
                    <h3> Account Balance: {user.accountBalance}</h3>
                </div>
                <div className='addUser'>
                    <p>{user.books.length>0?<i> Want to upload more books?</i> : <i>No books uploaded yet, want to upload?</i>}</p>
                    <button className='uploadUser' onClick={()=>{this.widget().open()}}>Upload +</button>
                </div>
                <div className='books'>
                    {newImg.length>0?<p>Please note that we collect 10% of proceeds of every books sold or borrowed, and lending rate for each monetized books is 15% of selling price.</p>:<></>}
                    <div className='contentLands'>
                    {newImg.map((i,k)=>{
                        return (
                        <div key={k} id={k} className='showLand'>
                            <img className='bookLand' src={i.thumbnail} />
                            <p>{i.format.toUpperCase()}</p>
                            <h5>Title of the book</h5>
                            <input id={k+'title'} onChange={this.change} value={newImg[k].title} placeholder='enter the title of the book' />
                            <h5>Describe the book briefly</h5>
                            <textarea id={k+'description'} onChange={this.change} value={newImg[k].description} placeholder='briefly describe the book'/>
                            <button id={k+'free'} onClick={this.change} >{newImg[k].free?'Free': 'Selling'}</button>
                            {!newImg[k].free?<h5>Price of book</h5>:<></>}
                            {!newImg[k].free? <input id={k+'price'} onChange={this.change} value={newImg[k].price} placeholder='input the desired price' /> : <></>}
                            {!newImg[k].free? <p>Please note that lending rate for each monetized books is 15% of selling price and is available to the user for 30days.</p>: <></>}
                        </div>)
                    })}
                    {newImg.length>0? <button onClick={this.submit}>Save</button>:<></>}
                    </div>
                    <div className='extraUser'>
                        <button onClick={this.podCast} className='extras'>Create A Podcast</button>
                        <button className='extras'><Link className='extra' style={{right:'0px'}} to='/podcasts'>Listen To A Podcast</Link></button>
                        <button onClick={this.bookClub} className='extras'>Create A Book Club</button>
                        <button className='extras'><Link className='extra' style={{right:'0px'}} to='/bookclubs'>Join A Book Club</Link></button>
                    </div>
                    <div className='contentL'>
                        <h3>Books Uploaded</h3>
                        <div className='contentLands'>
                            {user.books.length>0?user.books.map((i,k)=>{
                                return(
                                <div key={k} id={k} className='showLand'>
                                    <img className='bookLand' src={i.img} />
                                    <h3>{i.title}</h3>
                                    <p className='typeLand'>{i.docType}</p>
                                    <p className='typeLand'>{i.description}</p>
                                    <h5 className='typeLand'>$ {i.price}</h5>
                                    <button className='buyLand' id={k} onClick={this.remove}>Remove</button>
                                </div>)
                            }):<p className='undefUser'>Can't wait to see your first uploaded book! 😁</p>}
                        </div>
                    </div>
                    <div className='contentL'>
                        <h3>Library</h3>
                        <div className='contentLands'>
                            {user.books.length>0?user.library.map((i,k)=>{
                                return(
                                <div key={k} id={k} className='showLand'>
                                    <img className='bookLand' src={i.img} />
                                    <h3>{i.title}</h3>
                                    <p className='typeLand'>{i.docType}</p>
                                    <p className='typeLand'>{i.description}</p>
                                    <h5 className='typeLand'>$ {i.price}</h5>
                                    <button className='buyLand' id={k} ><Link to={i.url}>Read</Link></button>
                                </div>)
                            }):<p className='undefUser'>You haven't gotten any book to read 🥺, you can check here<Link className='lastUserL' to='/home'>📚 Books.</Link> </p>}
                        </div>
                    </div>
                </div>
                {popup1 && <PodCast {...this.props} handleClose={this.podCast} />}
                {popup2 && <Groupy {...this.props} handleClose={this.bookClub} />}
            </div>
        )
    }
}

var rec
const PodCast=(props)=>{
    const [swit, setSwit]=useState(false)
    const [type,setType]=useState(true)
    const [audioChunk,setAudio]=useState([])
    const [vidChunk,setVideo]=useState([])
    const [name, setName] = useState('Enter the name of your podcast.')

    const switcher1=()=>{
        setSwit(true)
        audioDiv.style.borderBottom='2px solid blue'
        videoDiv.style.borderBottom='0px'
        messagePod.innerHTML=''
    }
    const switcher2=()=>{
        setSwit(false)
        audioDiv.style.borderBottom='0px'
        videoDiv.style.borderBottom='2px solid blue'
        messagePod.innerHTML=''
    }
    const getCookie=(name)=>{
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
    const start=()=>{
        navigator.mediaDevices.getUserMedia({audio:true,video:false})
        .then((stream)=>{
            record(stream)
            rec.start()
            mesAudio.style.color='blue'
            setType(false)
        })
        .catch((err)=>{
            console.log(err.name+' occured, which is '+err.message)
            nav.call(navigator,{audio:true},(stream)=>{
                record(stream)
                rec.start()
                mesAudio.style.color='blue'
                setType(false)
            },(er)=>{
                console.log(er.name+' occured, which is '+er.message)
            })
        })
        
    }
    const stop=()=>{
        rec.stop()
        mesAudio.style.color='green'
        messagePod.innerHTML='Audio Saved'
        setType(true)
    }
    const record=(stream)=>{
        let audio = audioChunk
        rec=new MediaRecorder(stream)
        rec.ondataavailable=async(e)=>{
            audio.push(e.data)
            setAudio(audio)
            if(rec.state=='inactive'){
                console.log('done')
                let blob=new Blob (audioChunk,{type:'audio/mpeg-3'})
                let audio = await upload(blob,'audio')
                //let newV=document.createElement('audio')
                //newV.src=audio
                //newV.autoplay=true
                //newV.controls=true
                //mesAudioTag.appendChild(newV)
                mesRetake.innerHTML +=`<audio src=${audio} autoplay='true' controls='true' ></audio>`
            }
        }
    }
    const start2=()=>{
        navigator.mediaDevices.getUserMedia({audio:true,video:true})
        .then((stream)=>{
            record2(stream)
            rec.start()
            mesVideo.style.color='blue'
            setType(false)
        })
        .catch((err)=>{
            console.log(err.name+' occured, which is '+err.message)
            nav.call(navigator,{audio:true,video:true},(stream)=>{
                record2(stream)
                rec.start()
                mesVideo.style.color='blue'
                setType(false)
            },(er)=>{
                console.log(er.name+' occured, which is '+er.message)
            })
        })
        
    }
    const stop2=()=>{
        mesVideo.style.color='green'
        setType(true)
        rec.stop()
        messagePod.innerHTML='Video Saved'
    }
    const record2=(stream)=>{
        videoPodder.srcObject=stream
        let videos = vidChunk
        rec=new MediaRecorder(stream)
        rec.ondataavailable=async(e)=>{
            videos.push(e.data)
            setVideo(videos)
            if(rec.state=='inactive'){
                let blob=new Blob (vidChunk, {type:'video/mp4'})
                let audio = await upload(blob,'video')
                stream.getTracks().forEach(function(track) {
                    if (track.readyState == 'live') {
                        track.stop();
                    }
                });
                let newVid=document.createElement('video')
                newVid.src=audio
                newVid.autoplay=true
                newVid.controls=true
                newVid.setAttribute('class','videoPodPod')
                videoPodder.parentNode.replaceChild(newVid,videoPodder)
            }
        }
    }
    const upload=async(blob,type)=>{
        var audio
        if(type=='audio'){
            audio = await uploadAudio(blob,'johnny11','myt2oqwd')
        }
        else{
            audio = await uploadAudio(blob,'johnny11','au283tot')
        }
        const sess = getCookie('id')
        const podId=shortid.generate()+shortid.generate()
        const url= window.location.hostname+'/podcast?id='+encodeURI(podId)
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sess, podId, audio:{audio:audio,url,name,time: Date.now(), likes:0, listens:0} })}
        const dat=await fetch('/addPodcast',method)
        const data= await dat.json()
        if(data.status=='success'){
            return audio
        }else{
            type=='audio'?this.start():this.start2()
        }
        
    }
    const uploadAudio=async(file,name,preset)=>{
        let form = new FormData()
        form.append('upload_preset',preset)
        form.append('file',file)
        form.append('resource-type','video')
        const method={method:'POST',body:form}
        let dat = await fetch(`https://api.cloudinary.com/v1_1/${name}/upload`,method)
        let data = await dat.json()
        return data.secure_url
    }
    return(
        <div className='podCover'>
            <div className='podMain'>
                <div className="close-icon" onClick={props.handleClose}>x</div>
                <div className='mainPod'>
                    <div className='dividePod'><h4 id='audioDiv' className='dividerPod' onClick={switcher1}>Audio Podcast</h4> <p>|</p> <h4 id='videoDiv' style={{borderBottom:'2px solid blue'}} className='dividerPod' onClick={switcher2}>Video Podcast</h4></div>
                    <p id='messagePod'></p>
                    {swit?
                        <div key='firstTag' id='mesAudioTag'>
                            <div id='mesRetake'></div>
                            {type?<i className="fa fa-microphone bigPod" onClick={start} id='mesAudio' />:<i className="fa fa-stop bigPod" onClick={stop} id='mesAudio' />} 
                        </div>:
                        <div key='secondTag' className='mesVideoTag'>
                            <div className='videoPod'><video id='videoPodder' className='videoPodPod' autoPlay={true} controls={true} /></div>
                            {type?<i className="fa fa-video-camera bigPod bigVidPod" onClick={start2} id='mesVideo' />:<i className="fa fa-stop bigPod bigVidPod" onClick={stop2} id='mesVideo' />}
                        </div>}
                    <input className='boiledOverPod' value={name} onChange={(e)=>setName(e.target.value)} />
                </div>
            </div>
        </div>
    )
}

const Groupy=(props)=>{
    const [name,setName]=useState('')
    const [purpose, setPurpose]=useState('')
    const [des, setDes]=useState('')

    const submit=async(e)=>{
        e.preventDefault()
        if(name!='' && purpose !='' && des !=''){
            const sess = getCookie('id')
            let grpId= shortid.generate()+shortid.generate()
            const url=window.location.hostname+'/bookclub?id='+encodeURI(grpId)
            const group={name,purpose,des,url}
            const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sess,grpId,list:[], group:{...group,time: Date.now(), likes:0, joined:0} })}
            const dat = await fetch('/addGroup',method)
            const data = dat.json()
            if(data.status=='success'){
                message.innerHTML='Group Created, check it out at <a href='+data.url+'></a>'
            }
        }else{
            message.innerHTML='One of more fields empty'
        }
    }
    const getCookie=(name)=>{
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
    const change=(e)=>{
        switch(e.target.id){
            case 'name':
                setName(e.target.value)
                break;
            case 'purpose':
                setPurpose(e.target.value)
                break;
            case 'description':
                setDes(e.target.value)
                break;
        }
    }
    return (
        <div className='podCover'>
            <div className='podMain'>
                <div className="close-icon" onClick={props.handleClose}>x</div>
                <div className='groupCover'>
                    <p id='message'></p>
                    <form onSubmit={submit} className='groupForm'>
                        <div><h4>Name of Group *</h4><input id='name' onChange={(e)=>change(e)} value={name} required /></div>
                        <div><h4>Purpose of Group *</h4><input id='purpose' onChange={(e)=>change(e)} value={purpose} required/></div>
                        <div><h4>Group Description *</h4><textarea id='description' onChange={(e)=>change(e)} value={des} required/></div>
                        <button type='submit' className='submitGroup'>Create Group</button>
                    </form>
                </div>
            </div>
        </div>
    )
}