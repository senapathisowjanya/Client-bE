const mongoose = require("mongoose");

const PostJobSchema = mongoose.Schema({
  position: String,
  jobDescription: String,
  positionType: {
    type: Array,
  },
  benefits: {
    type: String,
    enum: ['Available', 'Not Available'],
  },
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
});

const PostJobModel = mongoose.model("PostJob", PostJobSchema);

module.exports = PostJobModel;
