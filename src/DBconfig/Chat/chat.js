 const mongoose=require('mongoose')
const Validator=require('validator')

const ChatDB=new mongoose.Schema({

    Email:{
        type:String,
        
        required:true,
        trim: true,
        validate(value)
        {
            if(!Validator.isEmail(value))
            {
                throw new Error("Invalid email")
            }
        }
    },
  
    NUID:{
        type:String,
        required:true,
        unique:true
    },
    chatList:[
        {
            
            friend:{
               // type:String
                 type:mongoose.Schema.Types.ObjectId,
                ref:'userdbs'
                },
                Unseen:{
                    type:Number,
                    default:0
                },
                UnseenRefer:{
                    type:Number,
                    default:0
                },
            messages:[{
                    Sender:{
                    type:String
                    
                    },
                    Recieve:{
                    type:String
                },
                reply:{
                    type:String
                },
                replyIndex:{
                    type:Number
                },
                createdAttime:{
                    type:Date
                },
                    owner:{
                            type:String
                    },
                    replyTo:{
                        type:String
                    }}]
        }
    ]
   

},{timestamps:true})


ChatDB.methods.toJSON= function()
{
    const userfield=this
    const userObj=userfield.toObject();
    delete userObj.password
    return userObj
}
ChatDB.statics.fetchUnseen=async (CurrentUser,chatUsers)=>{
   
    const val=await chats.findOne({NUID:CurrentUser}).select("-chatList.messages")
    const Unseen=[]
    const UnseenRef=[]
    const len=chatUsers.length
   
       
        for(var i=0;i<len;i++)
        { 
            val.chatList.map(res=>{
            
            if(res.friend.toString()==chatUsers[i].id)
            {
                
                chatUsers[i]['Unseen']=res.Unseen
                chatUsers[i]['UnseenRef']=res.UnseenRefer
               /*  console.log(res) */
            }
            })
            if(chatUsers[i]['Unseen']==undefined || chatUsers[i]['UnseenRef']==undefined)
            {
                chatUsers[i]['Unseen']=0
                chatUsers[i]['UnseenRef']=0
            }

        }
      
        
    
    return chatUsers

}
ChatDB.statics.findIT=async (CurrentUserID,chatId,pagefrom,limit,pageto)=> {
    const pageStartIndex=pagefrom*limit

    const totalMessageToreturn=(pageto-pagefrom)*limit
    await chats.findOneAndUpdate({NUID:CurrentUserID,"chatList.friend":{$ne:chatId}},{$push:{chatList:{friend:chatId}}})
    
    await chats.findOneAndUpdate({NUID:chatId,"chatList.friend":{$ne:CurrentUserID}},{$push:{chatList:{friend:CurrentUserID}}})
    
   /*  const val=await chats.findOne({NUID: CurrentUserID}).select({ chatList: {$elemMatch: {friend:chatId}}}).select("chatList.messages") */

   const val=await chats.findOne({NUID: CurrentUserID}).select({ chatList: {$elemMatch: {friend:chatId}},'chatList.messages':{$slice:[pageStartIndex,totalMessageToreturn]}})

            return val.chatList[0]
                 
    }


    ChatDB.statics.IncrementCounterOfUnSeen=async (CurrentUser,chatId)=>{
        ///
      
            await chats.findOneAndUpdate({NUID:chatId},{$inc:{"chatList.$[insidechatList].Unseen":1}},{"arrayFilters":[{"insidechatList.friend":CurrentUser}], new: true,
            upsert: true,
            rawResult: true}).then(res=>{
             
                return "Update-success"
            }).catch(res=>{
             //   console.log(res)
                return res
            })
        
           
            
        
        }
        ChatDB.statics.IncrementCounterOfUnSeenRefer=async (CurrentUser,chatId)=>{
            ///
         
                await chats.findOneAndUpdate({NUID:CurrentUser},{$inc:{"chatList.$[insidechatList].UnseenRefer":1}},{"arrayFilters":[{"insidechatList.friend":chatId}], new: true,
                upsert: true,
                rawResult: true}).then(res=>{
                    
                    return "Update-success"
                }).catch(res=>{
                 //   console.log(res)
                    return res
                })
            
               
                
            
            }    
ChatDB.statics.setUnSeenToZero=async (CurrentUser,chatId)=>{
///
    await chats.findOneAndUpdate({NUID:CurrentUser},{$set:{"chatList.$[insidechatList].Unseen":0}},{"arrayFilters":[{"insidechatList.friend":chatId}], new: true,
    upsert: true,
    rawResult: true}).then(res=>{
        return "Update-success"
    }).catch(res=>{
        return res
    })


}

ChatDB.statics.setUnSeenRefToZero=async(CurrentUser,chatId)=>{
    ///
        await chats.findOneAndUpdate({NUID:chatId},{$set:{"chatList.$[insidechatList].UnseenRefer":0}},{"arrayFilters":[{"insidechatList.friend":CurrentUser}], new: true,
        upsert: true,
        rawResult: true}).then(res=>{
            return "Update-success"
        }).catch(res=>{
            return res
        })
    
    
    }

ChatDB.statics.updateIT=async (CurrentUserID,chatId,message)=> {
   
   await chats.findOneAndUpdate({NUID:CurrentUserID,"chatList.friend":{$ne:chatId}},{$push:{chatList:{friend:chatId}}})
   await chats.findOneAndUpdate({NUID:chatId,"chatList.friend":{$ne:CurrentUserID}},{$push:{chatList:{friend:CurrentUserID}}})
   
 
   const val=await chats.findOneAndUpdate({NUID:CurrentUserID},{$push:{"chatList.$[insidechatList].messages":{$each:[message],$position:0}}},{"arrayFilters":[{"insidechatList.friend":chatId}], new: true,
   upsert: true,
   rawResult: true})
   
    const Rmessage={
        ...message/* ,
        "Recieve":message.Sender,
        createdAttime:new Date(message.createdAttime) */
    }
    const owner=Rmessage.owner

    Rmessage.owner=Rmessage.replyTo
    Rmessage.replyTo=owner
    Rmessage.Recieve=message.Sender

    delete Rmessage.Sender
    
   await chats.findOneAndUpdate({NUID:chatId},{$push:{"chatList.$[insidechatList].messages":{$each:[Rmessage],$position:0}}},{"arrayFilters":[{"insidechatList.friend":CurrentUserID}], new: true,
   upsert: true,
   rawResult: true})

     const chatLists=val.value.chatList
     let updatedData=null
     
     chatLists.map(data=>{

        if(data.friend.toString()===chatId)
        {
            updatedData=data.messages[0]
        }
     })
     if(!updatedData)
     {
         
         throw new Error("UpdatingFaild")
     }
     
    return updatedData

   
}

 ChatDB.methods.saveData=async function()
{
    const newChat=this

    
    await newChat.save()
  
    return newChat
}
 


/* ChatDB.pre('save',async function(next)
{
    const userfield=this
  try
    {
    if(userfield.isModified('password'))
    {   
        userfield.password=await bcrypt.hash(userfield.password,8)
    }
    next()
    }
    catch(e)
    {
        throw new Error("Something Went Wrong while saving data")
    }
})  */


const chats=mongoose.model('chats',ChatDB)
module.exports=chats
  