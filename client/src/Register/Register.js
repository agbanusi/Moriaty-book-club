import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import './Register.css'

const Item=()=>{
    const [form,setForm]=useState([
        {name:'First Name',type:'text',value:""},{name:'Last Name',type:'text',value:""},
        {name:"Username",type:"text", value:""},
        {name:'Email Address',type:'email',value:""},{name:'Phone Number',type:'tel',value:""},
        {name:'Password',type:'password',value:""}
    ])
    const [check, setCheck]=useState(false)

    const change=(e,i)=>{
        let old=[...form]
        old[i].value=e.target.value
        setForm(old)
    }
    const submit=()=>{
        //server path attention
        let indexes= form.map((i,k)=> i.type==='password'?k:'').filter(String)
        let values = indexes.map(i=> form[i])
        let filt=[...new Set(values)]
        let skip = form.filter(i=> i=='')
        if(check){
            if(filt.length ===1 && skip.length <= 0){
                if(filt[0].length>=7 && (/\d/g).test(filt[0])){
                    fetch('/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({form})}).then(res=>res.json()).then(data=>{
                        if(data.status==='success'){
                            //redirect
                            this.props.history.push('/home')
                        }
                        else{
                            document.getElementById('checkdi').innerText='Username already taken, change and try again'
                        }
                    })
                }else{
                    document.getElementById('checkdi').innerText="Password not strong enough."
                }
                
            }else if(filt.length < 0 || skip.length > 0){
                document.getElementById('checkdi').innerText='One or more field are unfilled, Please fill them before submitting.'
            }else{
                document.getElementById('checkdi').innerText='Your passwords don\'t match'
            }
        }
        else{
            document.getElementById('checkdi').innerText='You haven\'t checked the box for terms and services.'
        }
        
    }

    return(
    <div id='signedd' >
        <div className='leftin' style={{backgroundImage:''}} >
            <h1>Welcome to Moriaty Book Club</h1>
        </div>
        <p className='log'>Already a member? <button><Link style={{color:'whiteSmoke',textDecoration:'none',right:'0px'}} to={'/home'}>Sign In</Link></button></p>
        <div className='rightReg' >
            <h2 className='namer'>Register to Moriaty Book Club.</h2>
            <hr/>
            <div className='names'>
            {form.map((i,k)=>{
                if(i.type==='password'){
                    return (<div><h3>{i.name}</h3><input key={k} type={i.type} placeholder='Must contain at least 6 letters characters and at least one number' value={form[k].value || ''} onChange={(e)=>change(e,k)} required /></div>)
                }
                return (<div><h3>{i.name}</h3><input key={k} type={i.type} value={form[k].value || ''} onChange={(e)=>change(e,k)} required /></div>)
            })}
            </div>
            <p id='checkdi' style={{color:'red'}}></p>
            <div className='ideaCreate'>
            <input type='checkbox' className='id' id='checkbox' onChange={()=>{setCheck(!check)}} name='checkbox' value={check} required />
            <label for='checkbox' className='id' >Creating an account means you're okay with our terms and conditions.</label>
            </div>
            <button className='but' onClick={()=>{submit()}}> Create Account</button>
        </div>
        <p id='copywrite'> ©{new Date().getFullYear()}</p>
    </div>
    )
}

export default Item;