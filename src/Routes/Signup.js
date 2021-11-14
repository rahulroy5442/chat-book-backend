const express=require('express')
const router=new express.Router()



const Users=require('../DBconfig/User/User')
const TempUser=require('../DBconfig/User/tempUser')


router.post('/',async(req,res)=>{
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
   module.exports=router