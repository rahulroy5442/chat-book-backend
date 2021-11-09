const sgMail = require('@sendgrid/mail')

const welcome= async (userId,token)=>{

    
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: userId, // Change to your recipient
  from: 'rahulroy5442@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'Token ',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>'+' <a href='+process.env.CLIENT_PORT+'/login/verify/'+token+'>Click here</a>',
}
 return sgMail.send(msg).then(() => {
    return userId
  })
  .catch((error) => {
   throw new Error(error)
  })
  
}

const bye=async (userId)=>
{
    try
    {
    
  //console.log(process.env.SENDGRID_API_KEY)
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//console.log("f")
    const msg = {
            to: userId, // Change to your recipient
            from: {
            name:'See You soon',
            email:'rahulroy5442@gmail.com'}, // Change to your verified sender
            subject: 'Sending with SendGrid is Fun',
            text: 'Good Bye See You later',
            html: '<strong>Good Bye See You later</strong>',
            }
// console.log("f")
        sgMail.send(msg).then(() => {
        console.log('Email sent')
        }).catch((error) => {
            throw new Error(error)
        })
    }
    catch(e)
    {
    console.log(e)
    }
}

module.exports={
    welcome,
    bye
}