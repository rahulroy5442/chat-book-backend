
//const app=express()
const UserR=require('./Routes/User')
require('./DBconfig/DBruner')

const {app,server}=require('./chat/server')

const port=process.env.PORT

app.use(new require('express').json())
app.use(UserR)

server.listen(port,()=>{
  console.log("Server connected at"+port)
})
