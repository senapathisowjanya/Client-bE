const express = require('express');
const UserModel = require('../model/user.model');
const forgetRoute = express.Router()
const {createTransport} =  require("nodemailer")
require("dotenv").config();
const bcrypt = require("bcrypt")
let tempEmail = "";


forgetRoute.post("/forget",async (req, res)=>{
    try {
        const {email} =  req.body 
        const checkUser = await UserModel.find({email})
        if(checkUser.length > 0){
     tempEmail = email
    //  console.log(tempEmail)
     const transporter = createTransport({
        host:process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth :{
            user : process.env.MAIL_USER,
            pass: process.env.MAIL_API_KEY
        }
    })
            
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Reset Password Link",
        text: "Here is the link to reset your password",
        html: "Here is the link to reset your password: <a href='https://client-pro-venkysanju246.vercel.app/ForgotPassword'>Click to Reset</a>"
      };
      
            transporter.sendMail(mailOptions, (err, info)=>{
                if(err){
                    return res.status(500).send({
                        msg:err.message
                    })
                }else{
                    return res.status(200).send({
                        msg:"Email sent successfully"
                    })
                }
            })
            
        }else{
            return res.status(400).send({
                msg:"User not found"
            })
        }  
    } catch (error) {
        res.status(404).send({
            msg:error.message
        })
    }
   
})

forgetRoute.post("/update/:email", async (req, res) => {
  try {
    const { password } = req.body;
    const { email } = req.params
    console.log("Email updated", email)
    const emailCheck = await UserModel.findOne({ email: email });
    console.log("emailCheck", emailCheck)
    if (emailCheck) {
      const hash = bcrypt.hashSync(password, 5);
      const passUpdate = await UserModel.findByIdAndUpdate(emailCheck._id, { password: hash });

      const transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_API_KEY
        }
      })

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Password changed Successfully",
        text: "Here is the link to Login",
        html: "Password updated succesfully. Please login with new credentials: <a href='https://client-pro-venkysanju246.vercel.app/Login'>Login</a>"
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).send({
            msg: err.message
          })
        } else {
          return res.status(200).send({
            msg: "Password updated successfully"
          })
        }
      })

      
    } else {
      return res.status(400).send({
        msg: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(500).send({
      msg: error.message,
    });
  }
});


module.exports = forgetRoute