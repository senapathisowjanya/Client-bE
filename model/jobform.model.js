const mongoose = require("mongoose")

const JobFormSchma = mongoose.Schema({
    city: String,
    state: String,
    zip: Number,
    dob: Date,
    sponsorship :{
        type: String,
    },
    clientAvailability: {
        type: String,
    },
    avaliableToStart:{
        type: String,
    },
    jobUniqueID: String,
    userID:String,
    RuserID: String,
    isViewed: Boolean,
    date: {
        type: Date,
        default: Date.now
    },
    position:String,
    candidateStatus:String,
    name:String,
    email:String,
    phone:String,
    resumeFilename:String
})

const JobFormModel = mongoose.model("jobform", JobFormSchma)

module.exports = JobFormModel