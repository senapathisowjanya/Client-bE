const mongoose = require("mongoose");

const PostJobSchema = mongoose.Schema({
  position: String,
  salary: String,
  jobDescription: String,
  jobType: {
    type: Array,
  },
  positionType: {
    type: Array,
  },
  benefits: {
    type: String,
    enum: ['Available', 'Not Available'],
  },
  city:String,
  state:String,
  zip:String,
  addNewQuestion: Array,
  status:{
    type: String,
    default:"Draft",
    enum:["Draft", "Posted"]
  },
  RuserID: String,
  uniqueID:String,
  jobResponse: Boolean,
  date: {
    type: Date,
    default: Date.now
},
jobLink: String,
createdAt: {
  type: Date,
  default: Date.now
}
});

const PostJobModel = mongoose.model("PostJob", PostJobSchema);

module.exports = PostJobModel;