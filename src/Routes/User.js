const express=require('express')

const router=new express.Router()

const Users=require('../DBconfig/User/User')

const {auth,accountVerification}=require('../Middleware/Auth')

const Chats=require('../DBconfig/Chat/chat')


router.get('/Reload',auth,async(req,res)=>{
  try{
        const CurrentUser=req.CurrentUser
        const user=await Users.findById(CurrentUser).select('-tokens')
        if(!user)
        {
          throw new Error('User not Found')
        }
        res.status(200).send({user})
  }
  catch(e)
  {
        res.status(401).send({error:e.message})
  }
})

////////////////////////////////////////////////////////
router.post('/status',auth,async(req,res)=>{
  try{
    //console.log(req.body,req.CurrentUser._id)
    
    await Users.findOneAndUpdate({_id:req.CurrentUser._id},req.body)
    const allUser=await Users.find({_id:{$ne:req.CurrentUser._id}})
//    console.log("ol",allUser)

    res.status(200).send({Users:req.CurrentUser,allUser})
  }catch(e)
  {
    res.status(404).send({error:e.message})
  }
})



///////////////////////////////////////////////////////







router.get('/getall',auth,async(req,res)=>{
  try{
    const allUser=await Users.findall(req.CurrentUser)
    
   const UpdatedUsers=await Chats.fetchUnseen(req.CurrentUser._id,allUser)
 // console.log('OP',UnSeen,allUser)
    res.status(200).send({Users:req.CurrentUser,UpdatedUsers})
  }catch(e)
  {
   
    res.status(404).send({error:e.message})
  }
})
 
///////////////////////////
router.post('/store/:id',auth,async(req,res)=>{
  try{
    const CurrentUser=req.CurrentUser
    
    
    const chatMessage=req.body.messages
    if(chatMessage.reply==null)
      delete chatMessage.reply
    //console.log(chatMessage)
    if(chatMessage.reply)
    {
      const myreply=chatMessage.reply.message
      const index=chatMessage.reply.index
      const owner=chatMessage.reply.owner
      const receiver=chatMessage.reply.receiver
      chatMessage.reply=myreply
      chatMessage.replyIndex=index
      chatMessage.owner=owner
      chatMessage.replyTo=receiver
    }
    //console.log(chatMessage)
    await Chats.IncrementCounterOfUnSeen(CurrentUser._id,req.params.id)
    await Chats.IncrementCounterOfUnSeenRefer(CurrentUser._id,req.params.id)
    const value=await Chats.updateIT(CurrentUser._id,req.params.id,chatMessage)
    /* console.log(value.friend) */
    res.status(200).send({chatMessages:value})
  }catch(e)
  {
    res.status(404).send({error:e.message})
  }
})
////////////////////////


router.get('/Onlyfindchat/:id',auth,async(req,res)=>{
  try{
    const CurrentUser=req.CurrentUser
    
    const value=await Chats.findIT(CurrentUser._id,req.params.id,req.query.pagefrom,req.query.limit,req.query.pageto)
    res.status(200).send({chatMessages:value.messages})
  }catch(e)
  {
    res.status(404).send({error:e.message})
  }
})
///jj


///////////////////////
router.get('/setStatus/:id',auth,async(req,res)=>{
  try{
   /*  console.log(req.query.limit,req.query.page) */
    const CurrentUser=req.CurrentUser
    
   
    await Chats.setUnSeenToZero(CurrentUser._id,req.params.id)
    await Chats.setUnSeenRefToZero(CurrentUser._id,req.params.id)


    res.status(200).send({message:"status set success full"})
  }catch(e)
  {
    res.status(404).send({error:e.message})
  }
})

///////////////////////
router.get('/findchat/:id',auth,async(req,res)=>{
  try{
   /*  console.log(req.query.limit,req.query.page) */
    const CurrentUser=req.CurrentUser
    
    const value=await Chats.findIT(CurrentUser._id,req.params.id,req.query.pagefrom,req.query.limit,req.query.pageto)
    
    await Chats.setUnSeenToZero(CurrentUser._id,req.params.id)
    await Chats.setUnSeenRefToZero(CurrentUser._id,req.params.id)


    res.status(200).send({chatMessages:value.messages})
  }catch(e)
  {
    res.status(404).send({error:e.message})
  }
})
///////////////////////
 router.get('/addfriend/:id',auth,async(req,res)=>{
  try{
    const CurrentUser=req.CurrentUser
    
    CurrentUser.friendList=CurrentUser.friendList.concat({_id:req.params.id})
    await CurrentUser.save()
    res.status(200).send({CurrentUser})
  }catch(e)
  {
    res.status(404).send({error:e.message})
  }
})
 

 module.exports=router;