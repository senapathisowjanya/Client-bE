const mongoose = require('mongoose')

const savedQuestionsSchema = mongoose.Schema({
    savedQuestions : Array,
    RuserID : String
})

const savedQuestionsModel = mongoose.model("savedQuestions", savedQuestionsSchema)

module.exports = savedQuestionsModel