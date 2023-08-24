const express = require("express")
const userRoute = require("./controllers/user.controller")
const { connectionToDb, initializeGridBucket } = require("./config/connection")
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
const { createTransport } = require("nodemailer")
const PostJobModel = require("./model/postjob.model")
const RecDashboardRoute = require("./controllers/RecDashboard.controller")
const jobFormRoute = require("./controllers/jobForm.controller")
const JobFormModel = require("./model/jobform.model")
const auth = require("./middleware/auth.middleware")
// const activityLogger = require("./middleware/activityLoggerMiddleware")
// const requestIp = require('request-ip');
// app.use(requestIp.mw());
// app.use(activityLogger);
app.use(express.json())
app.use(express.static("public"))

// app.use(express.json())
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

//recuiter audio

app.post("/api/recAudio", auth, async (req, res) => {

   const jid = req.body.RuserID
   console.log("ruserid: " + jid)
   const uploadMiddleware = gridStorage(req, jid).single("file");

   uploadMiddleware(req, res, async (err) => {
      if (err) {
         // Handle the multer error here
         return res.status(500).send({ msg: "File upload failed." });
      }
   });

   try {
      const uniqueID = uuid.v4();
      const payLoad = req.body
      console.log("payload", payLoad)
      payLoad.uniqueID = uniqueID
      payLoad.jobResponse = false;
      const newJob = new PostJobModel(payLoad)
      await newJob.save()
      res.status(201).send({
         msg: "Job posted successfully",
         uniqueID: uniqueID
      })
   } catch (error) {
      res.status(400).send({
         msg: error.message
      })
   }
});

app.post("/api/upload/:jid", auth, (req, res) => {
   const jid = req.params.jid
   let userId = req.body.userID
   const uploadMiddleware = gridStorage(req, req.body.userID, jid).single("file");

   uploadMiddleware(req, res, async (err) => {
      if (err) {
         // Handle the multer error here
         return res.status(500).send({ msg: "File upload failed." });
      }

      try {
         const answers = req.body.answers;
         const id = req.body.jobUniqueID;
         console.log("idd", id)
         const findJob = await JobFormModel.findOne({ jobUniqueID: id })
         const postJobFind = await PostJobModel.findOne({ uniqueID: findJob.jobUniqueID })
         postJobFind.jobResponse = true;

         const mailUser = await UserModel.findOne({ _id: postJobFind.RuserID })
         console.log("mailUser: " + mailUser.email)
         await postJobFind.save();

         const data = new AddNewQstnModel({ AddNewQstn: answers })
         data.jobUniqueId = id
         data.userID = userId
         console.log("userid", userId)
         await data.save()

         const transporter = createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
               user: process.env.MAIL_USER,
               pass: process.env.MAIL_API_KEY
            }
         });

         const mailOptions = {
            from: process.env.MAIL_USER,
            to: mailUser.email,
            subject: "Welcome Message",
            text:"Received a new response",
            html: "Dear Recruiter, a new response has been received. Kindly log in to the application to access further details: <a href='https://client-pro-venkysanju246.vercel.app/dashboard'>Click to view</a>"
         };

         transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
               res.status(500).send({
                  msg: err.message
               });
            } else {
               res.status(200).send({
                  msg: "Email sent successfully"
               });
            }
         });

         res.send({
            msg: "Your response has been submitted"
         });
      } catch (error) {
         res.status(404).send({
            msg: error.message
         });
      }
   });
});

//end audio files

//retrieve audio
app.get("/gridStorage/:fileName", async (req, res) => {
   try {
      const gridBucket = await initializeGridBucket();
      const paramFileName = req.params.fileName;

      const filesCursor = gridBucket.find({ filename: paramFileName });
      const result = await filesCursor.toArray();

      if (!result || result.length === 0) {
         res.status(404).send({
            msg: "File Does Not Exist!!",
         });
      } else {
         res.setHeader("Content-Type", "application/octet-stream");
         gridBucket.openDownloadStreamByName(paramFileName).pipe(res);
      }
   } catch (error) {
      res.status(500).send({
         msg: error.message,
      });
   }
});

//getting filename from grid fs 
app.get("/getAudioFilename/:userId/:jobUniqueID", async (req, res) => {
   try {
      const userId = req.params.userId;
      const jobUniqueID = req.params.jobUniqueID;
      const gridBucket = await initializeGridBucket(); // Initialize GridFS bucket

      // Find the document using userID
      const filesCursor = gridBucket.find({ "metadata.userID": userId, "metadata.jobUniqueID": jobUniqueID });
      const result = await filesCursor.toArray();

      if (!result || result.length === 0) {
         res.status(404).json({ message: "File not found for the provided user ID" });
      } else {
         const filename = result[0].filename;
         res.status(200).json({ filename });
      }
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

app.post("/upload", upload.single('file'), auth, async (req, res) => {

   try {
      const imgs = req.file.filename

      const newData = new JobSeekerModel({ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, phoneNumber: req.body.phoneNumber, image: req.file.filename, jobUniqueID: req.body.jobUniqueID })
      newData.userID = req.body.userID
      await newData.save()
      return res.status(201).send({
         msg: "upload success"
      })

   } catch (error) {
      return res.status(500).send({
         msg: error.message,
      })
   }
})

app.get("/checkApply", async (req, res) => {
   const { email } = req.query
   console.log("email", email)
   const userCheck = await UserModel.find({ email })
   if (userCheck.length > 0) {
      return res.status(400).send({
         msg: "Looks like you already have an account with us"
      })
   } else {
      return res.status(200).send({
         msg: "New User"
      })
   }
})

//for view responses
app.get("/getResponse/:id/:jid", async (req, res) => {
   const id = req.params.id
   const jid = req.params.jid
   console.log("jid: " + jid)
   const FullData = await JobFormModel.findOne({ userID: id, jobUniqueID: jid })
   const ResumeData = await JobSeekerModel.findOne({ userID: id, jobUniqueID: jid })
   // console.log("ResumeData", ResumeData)
   // console.log("FullData", FullData)
   FullData.isViewed = true
   await FullData.save();
   res.send({
      ResumeData: ResumeData,
      FullData: FullData
   })
})

app.listen(8080, async () => {
   try {
      await connectionToDb
      // console.log("connection to db")
      // console.log("connected to server...")


      console.log("Connected to the database");
      console.log("Connected to the server...");


   } catch (error) {
      console.log(error.message)
   }

})