const express = require('express');
const JobSeekerModel = require('../model/jobseeker.model');
const auth = require('../middleware/auth.middleware');
const PostJobModel = require('../model/postjob.model');
const JobFormModel = require('../model/jobform.model');
const RecDashboardRoute = express.Router();

//active jobs
RecDashboardRoute.get("/activeJobs",auth, async (req, res)=>{
    try {
        const id = req.body.RuserID 
        const activeJobs = await PostJobModel.find({RuserID:id});
        console.log("Active jobs", activeJobs.length)
        res.status(200).send({
            msg: activeJobs.length
        })
    } catch (error) {
        res.status(400).send({
            msg: error.message
        })
    }
})

//Jobs with no response

RecDashboardRoute.get("/jobsWithNoResponse", auth, async (req, res) => {
  try {
    const id = req.body.userID;
    const noResponse = await PostJobModel.find({ userID: id, jobResponse: false });
    console.log("jobs with no response", noResponse.length);
    res.status(200).send({
      msg: noResponse
    });
  } catch (error) {
    res.status(400).send({
      msg: error.message
    });
  }
});

//Unread Responses 
RecDashboardRoute.get("/unreadResponses", auth, async (req, res) => {
  try {
    console.log(req.body.userID)
    const data = await JobFormModel.find({ RuserID: req.body.RuserID, isViewed: false})
    res.status(200).send({
      msg: data.length
    })
  } catch (error) {
    res.status(400).send({
      msg: error.message
    })
  }
})
  
//Number of responses for a particular job post 
RecDashboardRoute.get("/applicants/:id" , auth,async (req, res)=>{
    try {
        const id = req.params.id
        const getApplicatants = await JobSeekerModel.find({jobUniqueID: id})
        res.status(200).send({
            msg:getApplicatants
        })  
    } catch (error) {
        res.status(400).send({
            msg: error.message
        })
    }
})

//total applicants
RecDashboardRoute.get("/applicants",auth, async(req, res)=>{
  try {
    const id = req.body.RuserID 
    console.log("idd", id)
     const data = await JobFormModel.find({RuserID: id})
     console.log("unread responses", data.length)
     res.status(200).send({
      msg: data
     })
    
  } catch (error) {
    res.status(400).send({
      msg: error.message
    })
  }
     
})

//total jobs applied for client 
RecDashboardRoute.get("/totalapplicants",auth, async(req, res)=>{
  try {
    const id = req.body.userID 
    console.log("idd", id)
     const data = await JobFormModel.find({userID: id})
     console.log("unread responses", data.length)
     res.status(200).send({
      msg: data
     })
    
  } catch (error) {
    res.status(400).send({
      msg: error.message
    })
  }
     
})

module.exports = RecDashboardRoute

