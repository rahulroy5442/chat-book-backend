const express=require('express');
const app=express();

const http=require('http')
const axios=require('axios')

const server=http.createServer(app)
const cors=require('cors')
const jwt = require('jsonwebtoken');
const iw=require('socket.io')
const io=iw(server, {
    cors: {
        origin: '*',
      }
})


 app.use(cors({
    origin:"http://localhost:8000"
})) 


io.use(function(socket,next)
{

    if(socket.handshake.auth && socket.handshake.auth.token)
        {

            jwt.verify(socket.handshake.auth.token,process.env.JWT_KEY,function(error,decode){
                if(error)
                {
                 
                    return next(new Error(
                        {error:error.message}
                    ))
                }
                socket.decode=decode  
          
                next()
            })
            
        }
        else
        {
          
                next()
            
          
            
        }
}).on('connection',(socket)=>
{
  
    socket.on('join',(room,callback)=>{
   
      
        if(socket.decode!==undefined)
            {
               
               
                socket.join(socket.decode._id)
            }
      
   
    })

    socket.on("FriendsListner",(userList,callback)=>{
        

           userList.map(res=>{
                io.to(res.id).emit('Refresh',{User:socket.decode._id})
            }) 
    })

    socket.on('Seen-Notifier',(room,callBack)=>{
       
        io.to(room.SelectedChat).emit('Notify-Succes',{SetVal:room.Unseen,room:room.SelectedChat,senderId:room.myId})
        callBack()
    })

    socket.on('New-message',async (connection,callback)=>
    {
       
        const url='http://localhost:'+process.env.PORT+'/user/store/'+connection.room
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+socket.handshake.auth.token
          }
        await axios.post(url,{messages:{'Sender':connection.message,createdAttime:connection.createdAttime,reply:connection.reply}}, {
             headers
          }).then(res=>{
            
             
    
                callback(connection.message,connection.reply)
            
      
        }).catch(err=>{
            
            return err
        })
       
      io.to(connection.room).emit('message',{message:connection.message,room:connection.Sroom,reply:connection.reply})
    
    })

    socket.on('disconnect',()=>{
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+socket.handshake.auth.token
          }

        axios.post('http://localhost:'+process.env.PORT+'/user/status',{status:false},{headers}).then(res=>{
       
         res.data.allUser.map(val=>{
              io.to(val._id).emit('Refresh',{User:socket.decode._id})
          })
 
        }).catch(error=>{
         
        })
       

       


    })

    
})
module.exports={app,server}

