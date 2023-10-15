const mongoose = require("mongoose");

const socialProfileSchema = mongoose.Schema();

const JobFormSchema = mongoose.Schema({
    city: String,
    state: String,
    zip: Number,
    sponsorship: {
        type: String,
    },
    interviewAvailability: {
        type: String,
    },
    Availability: {
        type: String,
    },
    phone:{
        type: String,
    },
    socialProfiles: {
        type: [{
            media: String,
            url: String
        }]
    },
    resume: {
        type: String
    },
    resumeSummary:String,
    jobUniqueID: String,
    userID: String,
    RuserID: String,
    isViewed: Boolean,
    date: {
        type: Date,
        default: Date.now
    },
    position: String,
    candidateStatus: String,
    name: String,
    email: String,
    phone: String,
    resumeFilename: String
});

const JobFormModel = mongoose.model("jobform", JobFormSchema);

module.exports = JobFormModel;