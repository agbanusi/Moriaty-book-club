import React, { Component } from 'react';
import './Grouproom.css'
import { Link } from 'react-router-dom';

var ident
class Grouproom extends Component {
    constructor(props){
        super(props)
        this.state={
            completeData:[],
            store:[],
            data:[],
            drop:'date',
            value:'',
            height:"",
            loading:true,
            loader:false
        }
    }
    async componentDidMount(){
        ident= this.getCookie('id')
        this.main(ident)
    }
    main=async(id,search)=>{
        search=search || ""
        const method={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,search})}
        try{
            const dat = await fetch('/grouplist',method)
            var data =await dat.json()
            data = this.sorted(data,'date')
            if( data.status=='success'){
                //save the results gotten
                this.setState({data:data.items.slice(0,20),store:data.items.slice(20),completeData:data.items,loading:false})
            }else{
                //refresh page in case of error
                this.props.history.push('/home')
            }
        }catch{
            this.props.history.push('/home')
        }
    }

    sorted=(data,type)=>{
        if(type=='date'){
            return data.sort((a,b)=> this.getDays(a.time)-this.getDays(b.time))
        }
        else if(type=='popular'){
            return data.sort((a,b)=>a.likes-b.likes)
        }
    }
    getDays=(date)=>{
        //get current date
        const presentDate=Date.now()
        //parse given date to milliseconds since jan 1 1970
        const pastDate=Date.parse(date)
        const diff=presentDate-pastDate
        //after getting the difference, get the difference in days
        const days=diff/(1000*3600)
        return Math.round(days)
    }
    format=(st)=>{
        //format numbers less than ten to have a zero in front of them
        if(st>9){
            return st
        }
        return '0'+st
    }
    
    add=async()=>{
        //this is to add more to the data shown on the screen from either the store
        this.setState({data:[...this.state.data,...this.state.store.slice(0,20)],store:[...this.state.store.slice(20)]})
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

    getHeight=()=>{
        //get the height of the cover, the scrolltop and also the height of each item rendered
        const cover=document.getElementById('cover')
        const item=document.getElementsByClassName('row')[0]
        if(item){
            let height={scroll:cover.scrollHeight, top:cover.scrollTop,offset:cover.offsetHeight, item:item.clientHeight}
            this.setState({height})
            return height
        }
        return this.state.height
    };
    paginate=()=>{
        //it is a callback function for the scroll event listener, which checks if the user
        //scrolls past a particular point, here close to the end of the rendered page, then render more items
        let tt=this.getHeight()
        //condition for if the page is at its end and the debounce is activated
        if(tt.top+tt.offset >=tt.scroll-100){
            //save the required heights
            this.setState({height:tt})
            //conditional change of the loader key for rendering loading below the page
            if(this.state.incomplete){this.setState({loader:true})}
            this.add()     //call the function add
        }
    }
    change =(e)=>{
        //a callback function for the change event listener for inputs,
        //the search filters rendered pages,
        switch(e.target.id){
            case 'search':
                this.setState({value:e.target.value})
                if(e.target.value != ""){this.search(e.target.value) }
                break;
            case 'deep':
                if(e.target.value !==""){
                    if(this.search(e.target.value).length<10){
                        this.setState({loading:true})
                        this.main(ident,e.target.value)
                    }
                    else{
                        this.search(e.target.value)
                    }
                }
            case 'dropdown':
                let {data} = this.state
                if(e.target.value=='date'){
                    data=this.sorted(data,'date')
                }else{
                    data=this.sorted(data,'popular')
                }
                this.setState({drop:e.target.value,data})
        }
    }
    exist=(val1,val2)=>{
        //a filter function for the items rendered
        if((val1 && val2)){
            val1=val1.trim().toLowerCase()
            val2=val2.trim().toLowerCase()
            if(val1.includes(val2) || val2.includes(val1)){
                return true
            }
            return false
        }
        return false
    }
    
    search=(val)=>{
        //the search function which sends the data that should be rendered
        let totalData=this.state.completeData
        totalData=totalData.filter(i=>this.exist(i.full_name,val) || this.exist(i.owner.name,val) || this.exist(i.description,val))
        this.setState({data:totalData.slice(0,20),store:totalData.slice(20)})
        return totalData
    }
    render() {
        return (
           <div id='cover' onScroll={this.paginate}>
                <div>
                <h1 > Rooms List</h1>
                <div className='mid dine'><i className="fa fa-search" aria-hidden="true" id='deep' onClick={this.change}></i><input id='search' placeholder="Search podcast by name, description or owner's name" value={this.state.value} onChange={this.change} /></div>
                <select id='dropdown' value={this.state.drop} onChange={this.change}>
                    <option value='date'>Sort By Latest</option>
                    <option value='popular'>Sort By Most Popular</option>
                </select>
                </div>
                {this.state.loading?
                    <div className='load'> Loading...</div>:
                    this.state.data.map((repo,k)=>(
                    <div className='row' id={k} key={k}>
                      <Link href={repo.group.url}>
                        <img src={repo.owner.avatar} />
                        <div>
                            <h3>{this.name(repo.group.name)}</h3>
                            <h5>{!repo.group.description? 'Nil': repo.group.description.length>100?repo.group.description.slice(0,98)+'...':repo.group.description}</h5>
                            <div className='divide'>
                            <p className='border'>{'❤ '+ repo.group.likes}</p>
                            <p className='border'>{'🤝 '+ repo.group.joined}</p>
                            <p>{'Created '+this.getDays(repo.time)+' days ago by '+repo.owner.name}</p>
                            </div>
                        </div>
                      </Link>  
                    </div>
                ))}
                {this.state.loader?<p>Loading...</p>:<></>}
            </div>
            
        )
    }
}


export default Grouproom;