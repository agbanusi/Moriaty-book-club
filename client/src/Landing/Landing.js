import React, { Component, useState } from 'react'
import {Link} from 'react-router-dom'
import './Landing.css'

export default class Landing extends Component {
    constructor(props){
        super(props);
        this.state={
            data:[{img:'',title:'A good boy',description:'A test Image for a book',price:'0.00',docType:'PDF',id:'23ertg56'},{img:'',title:'A good boy',description:'A test Image for a book',price:'0.00',docType:'PDF',id:'23ertg56'},{img:'',title:'A good boy',description:'A test Image for a book',price:'0.00',docType:'PDF',id:'23ertg56'},{img:'',title:'A good boy',description:'A test Image for a book',price:'0.00',docType:'PDF',id:'23ertg56'},{img:'',title:'A good boy',description:'A test Image for a book',price:'0.00',docType:'PDF',id:'23ertg56'},{img:'',title:'A good boy',description:'A test Image for a book',price:'0.00',docType:'PDF',id:'23ertg56'},{img:'',title:'A good boy',description:'A test Image for a book',price:'0.00',docType:'PDF',id:'23ertg56'}],
            auth:false,
            img:'',
            options:[],
            name:'',
            value:'',
            overlay:false
        }
    }
    async componentDidMount(){
        const sess = this.getCookie('id')
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id: sess})}
        const fetched = await fetch('/catalog',method)
        const datum= await fetched.json()
        if (datum.status=='success'){
            this.setState({data:datum.data, options:datum.options, auth:datum.auth, name:datum.guest, img:datum.img})
        }else{
            //window.location.href='/'
        }
    }
    change=(e)=>{
        this.setState({value:e.target.value})
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
    expand=()=>{
        document.getElementById('dineLand').style.width='27rem'
    }
    contract=()=>{
        document.getElementById('dineLand').style.width='1rem'
    }
    render() {
        return (
            <div className='Land'>
                <div className='headLand'>
                    {this.state.auth? <h2>Welcome {this.data.name}</h2> : <h2>Welcome Guest</h2>}
                    {!this.state.auth?
                    <div className='divideLand'>
                        <button onClick={()=>{this.setState({overlay:true})}}>Sign In</button>
                        <button><Link style={{color:'white',textDecoration:'none',right:'0px'}} to='/register'>Sign Up</Link></button>
                    </div>:
                    <div className='divideLand'>
                        <Link to='/user' ><img src={this.state.img} className='profile' /></Link>
                    </div>
                    }
                </div>
                <div>
                <div className='dineLand' id='dineLand' onMouseOver={this.expand} >
                    <i className="fa fa-search" aria-hidden="true"></i><input id='search' className='search' onFocus={this.expand} onBlur={this.contract} placeholder="Search by name, description, or author's name" value={this.state.value} onChange={this.change} />
                </div>
                <label for='category' className='labelLand'>Choose a category </label>
                <select id='category'>
                    <option value="">--</option>
                    {this.state.options.map(i=><options value={i}>{i}</options>)}
                </select>
                </div>
                <div className='contentLand'>
                    {this.state.data.map((i,k)=>
                        <div key={k} id={k} className='showLand'>
                            <img className='bookLand' src={i.img} />
                            <h3>{i.title}</h3>
                            <p className='typeLand'>{i.docType}</p>
                            <p className='typeLand'>{i.description}</p>
                            <h5 className='typeLand'>$ {i.price}</h5>
                            <button className='buyLand'><Link style={{color:'whitesmoke',textDecoration:'none',right:'0px'}} to={'/purchase?id='+encodeURI(i.id)}>Get</Link></button>    
                        </div>
                    )}
                </div>
                <footer className='footers'>
                    <div className='medias'>
                        <a href='https://facebook.com/agbanusi' target='_blank'><i className="land fa fa-facebook-official" aria-hidden="true"></i></a>
                        <a href='https://api.whatsapp.com/send?phone=2348073975086' target='_blank'><i className="land fa fa-whatsapp" aria-hidden="true"></i></a>
                        <a href='mailto: agbanusijohn@gmail.com' target='_blank'><i className="land fa fa-envelope"></i></a>
                        <a href='https://twitter.com/agbanusijohn' target='_blank' ><i className="land fa fa-twitter" aria-hidden="true"></i></a>
                        <a href='https://instagram.com/agbanusi_john' target='_blank'><i className="land fa fa-instagram" aria-hidden="true"></i></a>
                    </div>
                    <p>© {new Date().getFullYear()}</p>
                </footer>
                {this.state.overlay && <Item2 change={()=>this.setState({overlay:false})} changeData={(datum)=>this.setState({data:datum.data, options:datum.options, auth:datum.auth, name:datum.guest, img:datum.img,auth:datum.auth})} />} 
            </div>
        )
    }
}

const Item2=(props)=>{
    const [emails,setEmail]=useState('')
    const [passwords,setPassword]=useState('')
    const [type,setType]=useState(true)

    const login=()=>{
        //server path attention
        fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:emails,password:passwords})}).then(res=>res.json()).then(data=>{
            if(data.status==='success'){
                props.changeData(data)
            }
            else{
                document.getElementById('checked').innerHTML=emails.includes('.com')?"Email or Password Incorrect" : "Username or Password Incorrect"
            }
        })
    }
    
    return(
    <div className='mainSignIn' >
        <p className='closeSignIn' onClick={()=>props.change()}>X</p>
        <div className='signIn noPass'>
            <div className='forms yes1'><i class="fa fa-envelope tink" aria-hidden="true"></i><input id='userFirst' value={emails} type='email' onChange={(e)=>setEmail(e.target.value)} placeholder='Please enter your email or username' required/></div>
            <div className='forms'><i class="fa fa-lock tink" aria-hidden="true"></i><input type={!type?'text':'password'} id='passFirst' value={passwords} onChange={(e)=>setPassword(e.target.value)} placeholder='Enter your password' required /><button className='yum' onClick={()=>setType(!type)}>{!type? <i class="fa fa-eye-slash" aria-hidden="true"></i>: <i class="fa fa-eye"></i>}</button></div>
            <p style={{color:'red'}} id='checked'></p>
            <button className='loggy' onClick={()=>login()} >Sign In</button>
            <Link to='/forgot'>Forgot your Password?</Link>
            <div className='helf'>Not a member? <button onClick={()=>{props.change(2)}}>Sign Up</button></div>
        </div>
    </div>
    )
}
//convert the pdf from cloudinary first page to png is .../image/upload/w_200,h_250,c_fill/single_page_pdf.png