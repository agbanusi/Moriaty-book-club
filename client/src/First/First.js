import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import images from './images'
import './First.css'

const First =()=>{
    const [i,setHi]=useState(0)
    useEffect(()=>{
        const inv=setInterval(()=>{
            var ind = Math.floor(Math.random()*12)
            setHi(ind) 
        },5000)
        return ()=>clearInterval(inv)
    },[])
    
    return (
        <div className='background'>
            <div className='left'>
            <h1 className='lefty'>Welcome To Moriaty Book Club!</h1>
            <p className='lefty'>Welcome to one of the best book club ever, your non physical health
            is our concern. We're all about sharing and gaining knowledge. You can upload and sell your ebooks or make it accessible for borrowing
            on our platform, not only that, you can also buy, borrow or read free books on our platform. As if that's not enough
            you can join voice chat groups created by others and can be searched and found by book titles or authors and discuss what you've learnt so far without leaving the comfort of your
            home!. Join the our group of elite book readers today!</p>
            <button className='orange'><Link style={{color:'black',textDecoration:'none'}} to='/home'>Go to our Catalog   <i class="fa fa-arrow-right" aria-hidden="true"></i></Link></button>
            </div>
            <div className='right'>
            <img className='firstImg' src={images[i]} />
            </div> 
        </div>
    )
    }
export default First