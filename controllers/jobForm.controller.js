const express = require('express');
const JobFormModel = require('../model/jobform.model');
const auth = require('../middleware/auth.middleware');
const PostJobModel = require('../model/postjob.model');
const jobFormRoute = express.Router();

jobFormRoute.post("/jobform",auth, async(req, res)=>{
    try {
        const payload = req.body;
        const id = req.body.userID
        const postjobData = await PostJobModel.findOne({uniqueID : payload.jobUniqueID})
        payload.isViewed = false
        payload.userID = id;
        payload.RuserID = postjobData.RuserID;
        payload.candidateStatus = "All"
        const newApplicant = new JobFormModel(payload)
         await newApplicant.save();
        res.send({
            msg: "JobForm saved successfully"
        });
    } catch (error) {
        res.send({
            msg:error.message
        })
    }
   
})

module.exports = jobFormRoute