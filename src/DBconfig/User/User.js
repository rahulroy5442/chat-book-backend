const mongoose=require('mongoose')
const Validator=require('validator')
const Pwv=require('password-validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

const UserDB=new mongoose.Schema({

    Email:{
        type:String,
        unique:true,
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
    FirstName:{
        type:String,
        required:true,
        validate(value)
        {
            if(value.length===0)
             {
                 throw new Error("Empty String");
             }
             else if(value.length>=10)
             {
                 throw new Error("String length exceed it's limit")
                
             }
        }
    },
    LastName:{
        type:String
    },
    password:
    {
        type:String,
        required:true,
        minlength:6,
        trim:true
    },
    DateOfBirth:{
        type:Date,
        required:true
    },
    Gender:{
        type:String,
        required:true
    },
    status:
    {
        type:Boolean,
        require:true,
        default:false,
    },
    friendList:{
        type:Array,required:true
    },tokens:
    [{tokens:{
        type:String,
        required:true
    }}]/* ,
    expireAt: {
        type: Date,
        required:true
      } */

},{timestamps:true})


/* UserDB.virtual('domain').get(function() {
    return this.FirstName+15
  }); */
  
//  UserDB.virtual('task',{
//     ref: 'chats',
//     localField: '_id',
//     foreignField: 'chatList.friend',
    
// }) 


UserDB.methods.toJSON= function()
{
    const userfield=this
    const userObj=userfield.toObject();
    delete userObj.password
    return userObj
}
UserDB.methods.Addvalue=async function()
{
    const newUser=this
    
    var tokens=jwt.sign({_id:newUser._id.toString()},process.env.JWT_KEY)
    newUser.tokens=newUser.tokens.concat({tokens})
  //  newUser.expireAt=expiryTime
    await newUser.save()
  
    return tokens
}/* 
UserDB.pre('save',async function(next)
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
}) */ 
UserDB.methods.saveData=async function(){
    const UserField=this

    await UserField.save()
}
UserDB.statics.findall=async (currentUser)=>
{
    
    const userData=await user.find({_id:{$ne:currentUser._id}})
    let userArray=[]
    userData.map(res=>{
        const Userlist={}
        Userlist["id"]=res._id
        Userlist["Name"]=res.FirstName+" "+res.LastName
        Userlist["Email"]=res.Email
        Userlist['status']=res.status
        userArray=userArray.concat(Userlist)
    })

   
    //await userData.populate('mytask').execPopulate()

    return userArray

}
UserDB.statics.findByCredentials=async (Email,password)=>
{
    const userData=await user.findOne({Email})
    

    if(!userData)
    {
    throw new Error('Account detail not found')
    }

    const ismatch=await bcrypt.compare(password,userData.password)

    if(!ismatch)
    {
        
        throw new Error('Email or password was incorrect.Please enter correct detail')
    }
    return userData

}
const user=mongoose.model('userdbs',UserDB)
module.exports=user
 