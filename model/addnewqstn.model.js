const mongoose = require('mongoose');

const addqtsnSchema = mongoose.Schema({
    AddNewQstn: Array,
    jobUniqueId: String,
    userID: String
})

const AddNewQstnModel = mongoose.model("addnewqstn", addqtsnSchema)

module.exports = AddNewQstnModel