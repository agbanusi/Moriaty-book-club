import React, { Component, useState } from 'react'
import './Purchase.css'
import { PayPalButton } from "react-paypal-button-v2"
import { Link } from 'react-router-dom';
import { Document, Page} from 'react-pdf/dist/esm/entry.parcel';
import { PaystackButton } from 'react-paystack'
import ShortUniqueId from 'short-unique-id';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

const uid = new ShortUniqueId();

export default class Purchase extends Component {
    constructor(props){
        super(props);
        this.state={
            user:'',
            purchase:false,
            amount:0,
            lend:false,
            open:false
        }
    }
    async componentDidMount(){
        let user=this.getCookie('id')
        let bookId=decodeURI(this.getUrlParameter('id'))
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:user, bookId})}
        const jason = await fetch('/book',method)
        const data = await jason.json()
        if (data.status=='success'){
            this.setState({user:data.book, purchase: data.book.purchase, lend:data.book.lend})
        }
    }
    paymentComplete=async(data,type)=>{
        let user=this.getCookie('id')
        let bookId=decodeURI(this.getUrlParameter('id'))
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:user, bookId, orderId:data.orderID, type})}
        const jason= await fetch("/payComplete",method)
        const done = await jason.json()
        if(done.status == 'success'){
            if(!this.state.lend){
                this.setState({purchase:true, amount:this.state.user.price, lend:false,user:done.book, open:true})
                window.open(done.book.url)
            }else{
                this.setState({purchase:true, amount:this.state.user.price*0.15,lend:true, user:done, open:true})
            }
        }else{
            alert("An error occured which we would try to rectify, returning your money or validating your transaction.")
        }
    }
    open=()=>{
        if(!this.state.user.book.lend){
            window.open(this.state.user.book)
        }
        this.setState({open:true})
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
        var {user}=this.state
        const componentProps = {
            email:this.state.user.email,
            amount:this.state.user.price,
            metadata: {
              name:this.state.user.name,
              phone: '08012345678',
            },
            text: `Buy Book for ${this.state.user.price} With PayStack`,
            publicKey:process.env.PAYSTACK,
            onSuccess: () =>{
                alert("Congratulations!, Transaction completed by " + details.payer.name.given_name + 'the book has been automatically added to your library!')
                var data={orderID:uid()}
                return this.paymentComplete(data,false)
                
            },
            onClose: () => alert("You really do need this book, don't leave it!"),
        
          }
          const componentProps2 = {
            email:this.state.user.email,
            amount:this.state.user.price*0.15,
            metadata: {
              name:this.state.user.name,
              phone: '08012345678',
            },
            text: `Lend Book for ${this.state.user.price*0.15} With PayStack`,
            publicKey:process.env.PAYSTACK,
            onSuccess: () =>{
                alert("Congratulations!, Transaction completed by " + details.payer.name.given_name + 'the book has been automatically added to your library!')
                var data={orderID:uid()}
                return this.paymentComplete(data,true)
                
            },
            onClose: () => alert("You really do need this book, don't leave it!"),
        
          }
        return (
            <div className='coverBook'>
                <div className='headUser'>
                    <h2> {user.name}</h2>
                    <div className='profileUser'>
                        <Link to='/user'><img src={user.img} className='profile' /></Link>
                    </div>
                </div>
                <div className='rightBook'>
                    <img src={user.thumbnail} className='bookLand' />
                    <h3>{user.title}</h3>
                    <h5>{user.format.toUpperCase()}</h5>
                    <p>{user.description}</p>
                    {user.purchase?
                        <button className='downBook' onClick={this.open}>{user.lend?'Read online': 'Download and Read'}</button>
                    :user.free?
                    <button className='freeBook' onClick={()=>{window.open(this.state.user.book)}}>Download for Free</button>:
                    <div>
                        <PaystackButton className='buyBook' id='kk' {...componentProps} />
                        <PaystackButton className='lendBook' id='kk' {...componentProps2} />
                        <PayPalButton
                            amount={this.state.user.price}
                            shippingPreference="NO_SHIPPING"
                            onSuccess={(details, data) => {
                                alert("Congratulations!, Transaction completed by " + details.payer.name.given_name + 'the book has been automatically added to your library!');
                                return this.paymentComplete(data)
                            }}
                            onCancel={()=> {alert("You really do need this book, don't leave it be!")}}
                            onError={()=> {alert("It's our fault that this didn't go through, please give us another chance by trying again.")}}
                            options={{
                                clientId: process.env.PRODUCT
                            }}
                        />
                        <p> Please note that the fee for lending a book is 15% of the sales price, which is {user.price*0.15} </p>
                    </div>
                    }
                </div>
                {this.state.open && <Book pdf={this.state.user.book} />}
            </div>
        )
    }
}

const Book=(props)=>{
    const [page, setPage]=useState(1)
    const [pageNo, setNo]=useState(null)

    const loaded=({numPage})=>{
        setNo(numPage)
    }
    const prevPage=()=>{
        if(page>1){
            setPage(page-1)
        }
    }
    const nextPage=()=>{
        if(page < pageNo){
            setPage(page+1)
        }
    }
    
    return(
        <div style={{ width: "100%", height:"100%", position:'absolute', top:"0px", left:"0px"}}>
            <nav>
                <button onClick={()=>prevPage()}>Prev</button>
                <button onClick={()=>nextPage()}>Next</button>
            </nav>

            <div style={{ width: "100%", height:"100%"}} >
                <Document
                    file={props.pdf}
                    onLoadSuccess={(numb)=>loaded(numb)}
                >
                    <Page pageNumber={pageNo} width="100%" />
                </Document>
            </div>

            <p>
                Page {page} of {pageNo}
            </p>
      </div>
    )
}
//user has name, img, book
//user.book has free for free books, img for book image, title, descriptiom
// doctype, purchase for if book has been paid for if not free, lend is to check the type
// of payment whether lend or full buy