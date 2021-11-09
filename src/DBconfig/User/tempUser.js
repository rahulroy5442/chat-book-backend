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
    }}],
    expireAt: {
        type: Date,
        required:true
      }

},{timestamps:true})




UserDB.methods.toJSON= function()
{
    const userfield=this
    const userObj=userfield.toObject();
    delete userObj.password
    return userObj
}

UserDB.methods.generateToken=async function(){
    const newUser=this
    return jwt.sign({_id:newUser._id.toString()},process.env.JWT_KEY)
}

UserDB.methods.Addvalue=async function(expiryTime,tokens)
{
    const newUser=this
    
    
    newUser.tokens=newUser.tokens.concat({tokens})
    newUser.expireAt=expiryTime
    await newUser.save()
  
    
}
UserDB.post('save', function(error,doc, next) {
    
    if (error.name === 'MongoError' && error.code === 11000) {
      next(new Error('Please verify your account by going through your email id. You are already signup'));
    } else {
      next();
    }
  });
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
}) 

const user=mongoose.model('tempuserdbs',UserDB)
module.exports=user
 