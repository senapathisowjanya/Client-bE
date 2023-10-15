const express = require('express');
const JobSeekerModel = require('../model/jobseeker.model');
const auth = require('../middleware/auth.middleware');
const PostJobModel = require('../model/postjob.model');
const JobFormModel = require('../model/jobform.model');
const RecDashboardRoute = express.Router();

//active jobs
RecDashboardRoute.get("/activeJobs", auth,async (req, res)=>{
  try {
    const optn = req.query.sortValue 
    console.log("get active", optn);
    if(optn===undefined || optn===""){
      console.log("No sort value found")
      const id = req.body.RuserID 
      console.log("Ruserid", id)
      const activeJobs = await PostJobModel.find({RuserID:id}).sort({ createdAt: -1 });
      const arr = [];
      for(let i =0;i<activeJobs.length;i++){
       const uid = activeJobs[i].uniqueID
       const check = await JobFormModel.find({jobUniqueID:uid, isViewed: false});
       arr.push(check.length);
      }
      res.status(200).send({
          msg: activeJobs,
          unread: arr
      })
    }else if(optn==="asc"){
      console.log("Ascending jobs")
      const id = req.body.RuserID 
      const activeJobs = await PostJobModel.find({RuserID:id}).sort({ createdAt: 1 });
      const arr = [];
      for(let i =0;i<activeJobs.length;i++){
       const uid = activeJobs[i].uniqueID
       const check = await JobFormModel.find({jobUniqueID:uid, isViewed: false});
       arr.push(check.length);
      }
      res.status(200).send({
          msg: activeJobs,
          unread: arr
      })
    }else if(optn==="des"){
      const id = req.body.RuserID 
      const activeJobs = await PostJobModel.find({RuserID:id}).sort({ createdAt: -1 });
      const arr = [];
      for(let i =0;i<activeJobs.length;i++){
       const uid = activeJobs[i].uniqueID
       const check = await JobFormModel.find({jobUniqueID:uid, isViewed: false});
       arr.push(check.length);
      }
      res.status(200).send({
          msg: activeJobs,
          unread: arr
      })
    }
     
  } catch (error) {
      res.status(400).send({
          msg: error.message
      })
  }
})

//Jobs with no response

RecDashboardRoute.get("/jobsWithNoResponse", auth, async (req, res) => {
  try {
    const id = req.body.RuserID;
    const noResponse = await PostJobModel.find({ RuserID: id, jobResponse: false });
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
    const data = await JobFormModel.find({RuserID: id, isViewed : false})
     res.status(200).send({
      msg: data
     })
    
  } catch (error) {
    res.status(400).send({
      msg: error.message
    })
  }
     
})

//total applications for a single job post
RecDashboardRoute.get("/onejobapplications/:id", auth, async (req, res) => {
  try {
    console.log("Application1")
    const id = req.params.id;
    const jobFormData = await JobFormModel.find({ jobUniqueID: id , candidateStatus : "All"});
    const jobSeekerData = await JobSeekerModel.find({ jobUniqueID: id });
    console.log("Application2")

    for (let i = 0; i < jobFormData.length; i++) {
    console.log("Application3")
      const formData = jobFormData[i];
      const matchingJobSeeker = jobSeekerData.find(jobSeeker => jobSeeker.jobUniqueID === formData.jobUniqueID);
   
      if (matchingJobSeeker) {
        // Update the name field in jobFormData
        formData.name = matchingJobSeeker.firstName;
        formData.email = matchingJobSeeker.email;
        formData.phone = matchingJobSeeker.phoneNumber
        formData.resumeFilename = matchingJobSeeker.image
        // Save the updated document back to the database
        await formData.save();
      }
    }
    console.log("Application4")


    res.status(200).send({
      msg: jobFormData
    });
  } catch (error) {
    res.status(500).send({
      msg: error.message
    });
  }
});

//get request for shrtlisted candidates
RecDashboardRoute.get("/onejobapplications/shortlisted/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await JobFormModel.find({jobUniqueID: id ,candidateStatus:"Shortlisted"})
    res.status(200).send({
      msg: data
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//for kanboard data dyanamic update for shorlisted
RecDashboardRoute.post("/onejobapplications/2/:id", auth, async(req, res)=>{
  try {
    const id = req.params.id;
    const payload = req.body.candidateStatus
    console.log("2", payload);
    const finddata = await JobFormModel.findOne({_id: id});
    finddata.candidateStatus = "Shortlisted";
    await finddata.save();
    res.status(200).status({
      msg:"candidate status updated successfully"
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//get request for interviewed candidates
RecDashboardRoute.get("/onejobapplications/interviewed/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await JobFormModel.find({jobUniqueID: id , candidateStatus:"Interviewed"})
    res.status(200).send({
      msg: data
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//for kanboard data dyanamic update for interviewd
RecDashboardRoute.post("/onejobapplications/3/:id", auth, async(req, res)=>{
  try {
    const id = req.params.id;
    const payload = req.body
    const finddata = await JobFormModel.findOne({_id: id});
    finddata.candidateStatus = "Interviewed";
    await finddata.save();
    res.status(200).status({
      msg:"candidate status updated successfully to interviewd"
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//get request for hired candidates
RecDashboardRoute.get("/onejobapplications/hired/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await JobFormModel.find({jobUniqueID: id, candidateStatus:"Hired"})
    res.status(200).send({
      msg: data
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//for kanboard data dyanamic update for hired
RecDashboardRoute.post("/onejobapplications/4/:id", auth, async(req, res)=>{
  try {
    const id = req.params.id;
    const payload = req.body
    const finddata = await JobFormModel.findOne({_id: id});
    finddata.candidateStatus = "Hired";
    await finddata.save();
    res.status(200).status({
      msg:"candidate status updated successfully to Hired"
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//get request for rejected candidates
RecDashboardRoute.get("/onejobapplications/rejected/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await JobFormModel.find({jobUniqueID: id,candidateStatus:"Rejected"})
    res.status(200).send({
      msg: data
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//for kanboard data dyanamic update for rejected
RecDashboardRoute.post("/onejobapplications/5/:id", auth, async(req, res)=>{
  try {
    const id = req.params.id;
    const payload = req.body
    const finddata = await JobFormModel.findOne({_id: id});
    finddata.candidateStatus = "Rejected";
    await finddata.save();
    res.status(200).status({
      msg:"candidate status updated successfully to Rejected"
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//total jobs applied for client 
RecDashboardRoute.get("/totalapplicants",auth, async(req, res)=>{
  try {
    const id = req.body.userID 
     const data = await JobFormModel.find({userID: id})
     res.status(200).send({
      msg: data
     })
    
  } catch (error) {
    res.status(400).send({
      msg: error.message
    })
  }
     
})



//checking edgecase, a person cannot apply for 2 same jobs
RecDashboardRoute.get("/secondApply/:id", async (req, res)=>{
  const id = req.params.id 
  const {email} = req.query 
  const checkData = await JobSeekerModel.find({jobUniqueID : id, email : email})
  if(checkData.length!=0){
     res.status(400).send({
      msg:"Already Applied to this job!!"
     })
  }else{
    res.status(200).send({
      msg:"Fresh user"
    })
  }
})

RecDashboardRoute.get("/postionname/:id", auth, async (req, res) => {
  try {
    const id = req.params.id
    const getposition = await PostJobModel.findOne({ uniqueID: id })
    res.status(200).send({
      msg: getposition
    })
  } catch (error) {
    res.status(500).send({
      msg: error.message
    })
  }

})

//for getting firstName for rcruiter dashboard
RecDashboardRoute.post("/fname", auth, async (req, res) => {
  const Ruserid = req.body.RuserID
  const data = await UserModel.findOne({ _id: Ruserid })
  res.send({
    msg: data
  })
})

//for getting email and name for profile modal
RecDashboardRoute.get("/emailProfile/:id", auth, async (req, res) => {
  const userid = req.params.id
  const data = await UserModel.findOne({ _id: userid })
  res.send({
    msg: data
  })
})

module.exports = RecDashboardRoute