var userList=[]
const userAdd=({myroom})=>
{
  
    if(!user || !room)
    {
        return {error:"Please mention all field"}
    }
    const findmatch=userList.find((userIt)=>{
        return userIt.user==user && room==userIt.room
    })

    if(findmatch)
    {
        return {error:"Please try with different user name or room"}
    }
    const users={myroom}
    userList.push(users)
    return {users}
}

const remove=(id)=>
{
    const Index=userList.findIndex((user)=>user.id==id)
 
    if(Index!=-1)
    {
        return userList.splice(Index,1)[0]
    }

}

const getUser=(id)=>
{
 const userobj=userList.find((user)=>user.id==id)
 return userobj
}
const getUsersInRoom=(room)=>
{
    const userListRoom=userList.filter((user)=>user.room==room)
    return userListRoom
}


module.exports={
    userAdd,
    remove,
    getUser,
    getUsersInRoom
}