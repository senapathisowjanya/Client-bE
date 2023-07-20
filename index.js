const express = require("express")
const userRoute = require("./controllers/user.controller")
const connectionToDb = require("./config/connection")
const postJobRoute = require("./controllers/postjob.controller")
const app = express()
const cors = require("cors")
app.use(cors())
const path = require("path")
const multer = require("multer")
const UserModel = require("./model/user.model")
const JobSeekerModel = require("./model/jobseeker.model")
const forgetRoute = require("./controllers/forgetpass.controller")
const gridStorage = require("./controllers/addnewqstn")
const AddNewQstnModel = require("./model/addnewqstn.model")
const {createTransport} =  require("nodemailer")
const PostJobModel = require("./model/postjob.model")
const RecDashboardRoute = require("./controllers/RecDashboard.controller")
const jobFormRoute = require("./controllers/jobForm.controller")
const JobFormModel = require("./model/jobform.model")

// const corsOptions = {
//    origin: ["https://client-pro-venkysanju246.vercel.app", "http://localhost:3000"],
//  };
//  app.use(cors(corsOptions));
 
app.use(express.json())
app.use(express.static("public"))

app.use(express.json())
app.use("/user", userRoute)
app.use("/jobs", postJobRoute)
app.use("/password", forgetRoute)
app.use("/clients", RecDashboardRoute)
app.use("/applyjob", jobFormRoute)
require("dotenv").config()


const Storage = multer.diskStorage({
   destination: (req, res, cb) => {
      cb(null, 'public/Images')
   },
   filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
   }
})
const upload = multer({
   storage: Storage
})

//for audio files gridfs

app.post("/api/upload", gridStorage().single("file"), async (req, res) => {
   try {
      const answers = req.body.answers;
      const id = req.body.jobUniqueID;
      console.log("idd", id)
      const findJob = await JobFormModel.findOne({ jobUniqueID: id })
      const postJobFind = await PostJobModel.findOne({uniqueID: findJob.jobUniqueID})
       postJobFind.jobResponse = true;
      //  console.log("postJobFind", postJobFind)
       const mailUser = await UserModel.findOne({_id: postJobFind.RuserID})
       console.log("mailUser: " + mailUser)
       await postJobFind.save();
      const data = new AddNewQstnModel({ AddNewQstn: answers })
      await data.save()
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
         to : mailUser.email,
         subject :"Welcome Message",
         text:"Dear Recruiter, a new response has been received. Kindly log in to the application to access further details."
     }
     transporter.sendMail(mailOptions, (err, info)=>{
         if(err){
              res.status(500).send({
                 msg:err.message
             })
         }else{
              res.status(200).send({
                 msg:"Email sent successfully"
             })
         }
     }) 

      res.send({
         msg: "Data uploaded successfully"
      })
   } catch (error) {
      res.status(404).send({
         msg: error.message
      })
   }
})

//end audio files

app.post("/upload", upload.single('file'), async (req, res) => {
  // res.header('Access-Control-Allow-Origin', 'https://client-pro-venkysanju246.vercel.app/');

   try {
     
      
      const imgs = req.file.filename
      const { email } = req.body
     
      const userCheck = await UserModel.find({ email })

      const newData = new JobSeekerModel({ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, phoneNumber: req.body.phoneNumber, image: req.file.filename, jobUniqueID: req.body.jobUniqueID })
      await newData.save()
      if (userCheck.length > 0) {
         return res.status(200).send({
            msg: "Looks like you already have an account with us"
         })
      }
      return res.status(201).send({
         msg: "upload success"
      })

   } catch (error) {
      return res.status(500).send({
         msg: error.message,
      })
   }
})

app.listen(8080, async () => {
   try {
      await connectionToDb
      console.log("connection to db")
      console.log("connected to server...")
   } catch (error) {
      console.log(error.message)
   }

})