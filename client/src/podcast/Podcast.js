import React, { Component } from 'react';
import './Podcast.css'
import img from '../../asset/background music.jpg'

class Podcast extends Component {
    constructor(props){
        super(props);
        this.state={
            data:'',
            like:false
        }
    }
    async componentDidMount(){
        let id=this.getCookie('id')
        let podId=this.getUrlParameter('id')
        podId = decodeURI(podId)
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id, podId})}
        const jason = await fetch('/getPodcast',method)
        const data = await jason.json()
        if (data.status=='success'){
            this.setState({data: data.item,id, podId:data.id})
            document.getElementById('dio').addEventListener('playing',this.send(id,podId,'listen'))
        }else{
            console.log('something isn\'t right')
        }
    }
    send=async(id,podId,type)=>{
        if(!this.state.like || type=='listen'){
            const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,podId,type})}
            const jason = await fetch('/updatePodcast',method)
        }
        
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

    render() {
        const {data,like,id, podId}=this.state
        return (
            <div className='pod'>
               {data.type=='audio'?
            <div className='audioPod' style={{backgroundImage:img, backgroundSize:'100% 100%'}}>
            <img src={data.owner.profileimg} className='userImg' />
            <audio id='dio' className='userAudio' controls={true} autoplay={false} src={data.audio.audio} />
            </div>:
            <video id='dio' controls={true} autoplay={false} src={data.audio.audio} className='audioPod'>
            <img src={data.owner.profileimg} className='userImg' />
            </video> } 
            <div><button className='likePod' title='Click to like this podcast' onClick={()=>{this.send(id,podId,'like'); this.setState({like:!like})}}>{like?'❤️':'🤍'}</button></div>
            </div>
        );
    }
}

export default Podcast;