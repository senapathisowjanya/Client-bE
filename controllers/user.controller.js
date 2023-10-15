const express = require("express")
const UserModel = require("../model/user.model")
const userRoute = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {createTransport} =  require("nodemailer")
const auth = require("../middleware/auth.middleware")
require("dotenv").config()

userRoute.post("/register", async(req, res)=>{
    try {
        const {firstName,lastName,email, password, role} = req.body
        const userCheck = await UserModel.findOne({email})
        if(userCheck){
            return res.status(401).send({
                msg:"User Already Registered, Please Login !"
            })
        }else{
            bcrypt.hash(password, 5,async (err, hash)=>{
                const newUser = new UserModel({firstName, lastName, email, password:hash, role})
                await newUser.save()

                const transporter = createTransport({
                    host:process.env.MAIL_HOST,
                    port: process.env.MAIL_PORT,
                    auth :{
                        user : process.env.MAIL_USER,
                        pass: process.env.MAIL_API_KEY
                    }
                })
                
                const mailOptions = {
                    from :process.env.MAIL_USER,
                    to : email,
                    subject :"Welcome Message",
                    text:"Registration Successful.",
                    html:`Congratulations ${firstName}! Your account registration has been successfully completed. Please proceed to login: <a href='https://client-pro-venkysanju246.vercel.app/Login'>Login</a>`
                }
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

        res.status(201).send({
            msg:`User Successfully Registered`
        }) 
            })
        }
    } catch (error) {
        res.status(400).send({
            msg:error.message
        })
    }
})

userRoute.post("/login", async(req, res)=>{
    try {
        const {email, password} = req.body
        const userCheck = await UserModel.findOne({email})
        if(userCheck){
            if(userCheck.role === "recruiter"){
                bcrypt.compare(password, userCheck.password, (err, result)=>{
                    if(result){
                        const token = jwt.sign({RuserID: userCheck._id}, process.env.JWT_SECRET, {expiresIn:"7d"})
                        return res.status(200).send({
                            msg:"Recruiter Login Success",
                            token: token,
                            role: userCheck.role
                        })
                    }else{
                        return res.status(401).send({
                            msg:"Invalid password"
                        })
                    }
                  })      
            }else if(userCheck.role === "jobseeker"){
              bcrypt.compare(password, userCheck.password, (err, result)=>{
                if(result){
                    const token = jwt.sign({userID: userCheck._id}, process.env.JWT_SECRET, {expiresIn:"7d"})
                    return res.status(200).send({
                        msg:"Login Success",
                        token: token,
                        role: userCheck.role
                    })
                }else{
                    return res.status(401).send({
                        msg:"Invalid password"
                    })
                }
              })
            }
        }else{
            return res.status(401).send({
                msg:"No User Found, Please Register First!"
            })
        }
    } catch (error) {
        return res.status(401).send({
            msg:error.message
        })
    }
})

module.exports = userRoute