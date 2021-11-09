const jwt=require('jsonwebtoken')
const user=require('../DBconfig/User/User')
const tempuser=require('../DBconfig/User/tempUser')
const bcrypt=require('bcryptjs')
const accountVerification=async(Email,password,token)=>{

       
     
        const decode=jwt.verify(token,process.env.JWT_KEY)

        const User=await tempuser.findOne({'_id':decode._id,'Email':Email,'tokens.tokens':token})
        
     
        
        if(!User)
        {
            throw new Error("Problem With verification")
        }

        const ismatch=await bcrypt.compare(password,User.password)
            if(!ismatch)
            {
                throw new Error("Please Enter Correct Credential")  
            }
      
        

        const UsersObj=User.toObject()
        if(new Date()>UsersObj.expireAt)
        {
            await tempuser.findOneAndDelete({'_id':{$eq:decode._id}})
            throw new Error("Sorry time Exceed for Verification")
            
        }
        delete UsersObj.expireAt
        delete UsersObj.createdAt
        delete UsersObj.updatedAt
        delete UsersObj.__v
    
        await tempuser.findOneAndDelete({'_id':{$eq:decode._id}})
        return {...UsersObj}
    
}

const auth=async (req,res,next)=>
{
 
    try
    {
        const token=req.header('Authorization').replace('Bearer ','')
     
        const decode=jwt.verify(token,process.env.JWT_KEY)

        const User=await user.findOne({'_id':decode._id,'tokens.tokens':token})
      
       
        if(!User)
        {
            throw new Error()
        }
        req.token=token
        req.CurrentUser=User
        next()
    }catch(e)
    {
        res.status(401).send({'error':'You are not authorize'})
    }
}

module.exports={auth,accountVerification}