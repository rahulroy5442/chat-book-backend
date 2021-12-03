
//const app=express()
const UserRouter=require('./Routes/User')
const LoginRouter=require('./Routes/Login')
const SignUpRouter=require('./Routes/Signup')
const {app,server}=require('./chat/server')
const express=require('express')
var rootRouter = express.Router();

require('./DBconfig/DBruner')
/*
HJDUJ

*/


rootRouter.use('/login',LoginRouter)
rootRouter.use('/signup',SignUpRouter)
rootRouter.use('/user',UserRouter)


app.use(new require('express').json())
app.use('/',rootRouter)

server.listen(process.env.PORT,()=>{
  console.log("Server connected at"+process.env.PORT)
})
