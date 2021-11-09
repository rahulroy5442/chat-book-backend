const messageHolder=(name,text)=>
{
    return{
        name,
        text,
        CreatedAt : new Date().getTime()
    }
}

const LocationSender=(name,url)=>
{
    return{
        name,
        url,
        CreatedAt : new Date().getTime()
    }
}


module.exports={messageHolder,LocationSender}