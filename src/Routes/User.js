const express=require('express')

const router=new express.Router()

const Users=require('../DBconfig/User/User')
const TempUser=require('../DBconfig/User/tempUser')
const {auth,accountVerification}=require('../Middleware/Auth')

const Chats=require('../DBconfig/Chat/chat')


router.post('/user',async(req,res)=>{
 /*  const tConvert =(time)=> {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? ':AM' : ':PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
  } */
    try
      {
        const result=await Users.findOne({Email:{$eq:req.body.Email}})
        if(result)
        {
          throw new Error('Account Already Exist')
        }
        const userObj=new TempUser(req.body);


        let dt = new Date();
        dt.setSeconds( dt.getSeconds() + 600 );

        userObj.generateToken().then(async (token)=>{
                                                /* console.log(dt,tConvert(dt.toTimeString().slice(0, 8)))  */
        
          await userObj.Addvalue(dt,token)

          
       res.status(201).send({email:req.body.Email})


    /*    welcome(req.body.Email,token).then(async (data)=>{
            res.status(201).send({email:data})
                }).catch(async (e)=>{
              await TempUser.findOneAndDelete({'_id':{$eq:userObj._id}})
              res.status(401).send({error:e.message})
          })  */



        }).catch(e=>{

          res.status(409).send({error:e.message})

        }) 
    
  
      
    }
      catch(e)
        {
            res.status(404).send({error:e.message})
        }
   
})

router.post('/users/verification/:token',async(req,res)=>{
  try{
    
    const User=await accountVerification(req.body.Email,req.body.password,req.params.token)
    //Import to userdbs

    const data=new Users(User)
    data.saveData()

    const chatbox=new Chats({Email:data.Email,NUID:data._id})
    await chatbox.saveData()
    
    res.status(201).send(data)
  }
  catch(e)
  {
    res.status(401).send({error:e.message})
  }
})

router.post('/user/login',async(req,res)=>{
    try{
        
         const user=await Users.findByCredentials(req.body.Email,req.body.password)

         const token=await user.Addvalue()

         res.status(200).send({user,token})
 
     }catch(e)
     {
         
         res.status(401).send({error:e.message})
     }
})

router.get('/user/Reload',auth,async(req,res)=>{
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
router.post('/user/status',auth,async(req,res)=>{
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







router.get('/user/getall',auth,async(req,res)=>{
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
router.post('/user/store/:id',auth,async(req,res)=>{
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


router.get('/user/Onlyfindchat/:id',auth,async(req,res)=>{
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
router.get('/user/setStatus/:id',auth,async(req,res)=>{
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
router.get('/user/findchat/:id',auth,async(req,res)=>{
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
 router.get('/user/addfriend/:id',auth,async(req,res)=>{
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