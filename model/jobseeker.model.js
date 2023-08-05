const mongoose = require("mongoose")

const JobSeekerSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    image:{
        type: String
    },
    jobUniqueID: String,
    userID: String
})

const JobSeekerModel = mongoose.model("Image", JobSeekerSchema)

module.exports = JobSeekerModel