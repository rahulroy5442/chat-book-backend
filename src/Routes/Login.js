const express=require('express')
const router=new express.Router()

const Users=require('../DBconfig/User/User')

const Chats=require('../DBconfig/Chat/chat')
const {auth,accountVerification}=require('../Middleware/Auth')



router.post('/',async(req,res)=>{
    try{
        
         const user=await Users.findByCredentials(req.body.Email,req.body.password)

         const token=await user.Addvalue()

         res.status(200).send({user,token})
 
     }catch(e)
     {
         
         res.status(401).send({error:e.message})
     }
})

router.post('/verification/:token',async(req,res)=>{
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

  module.exports=router