const jwt=require('jsonwebtoken')
const user=require('../DBconfig/User/User')

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
        res.status(401).send({'error':'please authorize'})
    }
}

module.exports=auth