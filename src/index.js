
//const app=express()
const UserR=require('./Routes/User')
require('./DBconfig/DBruner')
const user=require('./DBconfig/User/User')
const {app,server}=require('./chat/server')

const port=process.env.PORT

app.use(new require('express').json())
app.use(UserR)

server.listen(port,()=>{
  console.log("Server connected at"+port)
})
/* app.listen(port,()=>{
    console.log("Running at"+port)
})
 */