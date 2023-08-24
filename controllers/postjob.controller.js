const express = require('express');
const PostJobModel = require('../model/postjob.model');
const auth = require('../middleware/auth.middleware');
const postJobRoute = express.Router()
const uuid = require("uuid");
const JobFormModel = require('../model/jobform.model');
const AddNewQstnModel = require('../model/addnewqstn.model');
const savedQuestionsModel = require('../model/savedQuestions');

postJobRoute.post("/postjob",auth, async (req, res) => {
  try {
    const uniqueID = uuid.v4();
    const payLoad = req.body
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
})

postJobRoute.get("/onejob/:id", async (req, res) => {
  const {id} = req.params
  const data = await PostJobModel.findOne({ uniqueID: id });
  res.status(200).send({
    msg: data
  })
})

postJobRoute.get("/alljobs", auth, async (req, res) => {
  try {
  const data = await PostJobModel.find({ userID: req.body.userID });
  res.status(200).send({
    msg: data
  })
  } catch (error) {
    res.status(400).send({
      msg: error.message
    })
  }
  
})

//for getting questions
postJobRoute.get("/onejob/:id/:jid",auth, async (req, res) => {
  const data = await PostJobModel.findOne({ RuserID: req.body.RuserID, uniqueID: req.params.jid });
  res.status(200).send({
    msg: data
  })
})

//getting answers
postJobRoute.get("/onejob/answers/:id/:jid", async (req, res) => {
  const id = req.params.id;
  const data = await AddNewQstnModel.findOne({ userID: id, jobUniqueId : req.params.jid});
  res.status(200).send({
    msg: data
  })
})

postJobRoute.post("/jobform", async(req, res)=>{
  const payLoad = req.body 
  const jobForm = new JobFormModel(payLoad)
  await jobForm.save()
  res.status(200).send({
    msg:"jobForm saved successfully"
  })
})

//storing jobpost link to db
postJobRoute.post("/addlink/:link", auth, async (req, res) => {

  const linkk = req.params.link
  const joblink = `https://client-pro-venkysanju246.vercel.app/SingleJobPost/${linkk}`
  // console.log(linkk)
  // console.log(joblink)
 
  const data = await PostJobModel.findOne({uniqueID: linkk})

  data.jobLink = joblink
    await data.save()
  res.send({
    msg:"link saved"
  })
})

//Archived jobs
postJobRoute.post("/archive/:id", async (req, res) =>{
    const id = req.params.id
    const data = await PostJobModel.findOne({uniqueID: id})
    data.status = "Draft"
    await data.save()
    res.status(200).send({
      msg:"job archived"
    })
})

postJobRoute.patch("/update/:id", async (req, res) =>{
  const id = req.params.id
  const payload = req.body
  const data = await PostJobModel.findOne({uniqueID: id})
 const updatedJob = await PostJobModel.findByIdAndUpdate({_id: data._id}, payload)
 res.status(201).send({
  msg:"updated job"
 })

})

//for saving questions
postJobRoute.post("/saveQuestion", auth, async (req, res) => {
  const rid = req.body.RuserID;
  // console.log("qstns", req.body);
  
  const dataCheck = await savedQuestionsModel.findOne({ RuserID: rid });
  
  if (dataCheck) {
    dataCheck.savedQuestions.push(req.body.saveQuestion); 
    await dataCheck.save(); 
  } else {
    const newQuestion = new savedQuestionsModel({
      savedQuestions: [req.body.saveQuestion], 
      RuserID: rid,
    });
    await newQuestion.save();
  }

  res.send({
    msg: "Question saved successfully",
  });
});

//for getting questions 
postJobRoute.get("/getQuestions", auth, async (req, res) => {
  try {
    const rid = req.body.RuserID;
    const dataCheck = await savedQuestionsModel.findOne({ RuserID: rid });
    // console.log("qstsns", dataCheck.savedQuestions)
    if(dataCheck){
      return res.status(200).send({
        msg: dataCheck.savedQuestions
      })
    }else{
      es.status(200).send({
        msg: "No Saved Questions Avaliable"
      })
    }
    
  } catch (error) {
    return res.status(500).send({
      msg :"Error getting questions"
    })
  }

})

module.exports = postJobRoute