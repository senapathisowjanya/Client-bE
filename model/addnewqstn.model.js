const mongoose = require('mongoose');

const addqtsnSchema = mongoose.Schema({
    AddNewQstn: Array
})

const AddNewQstnModel = mongoose.model("addnewqstn", addqtsnSchema)

module.exports = AddNewQstnModel