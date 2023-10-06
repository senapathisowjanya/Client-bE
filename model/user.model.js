const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    email :{
        type:String,
    },
    password:{
        type:String
    },
    role:{
        type:String,
    }

})

const UserModel = mongoose.model("user", userSchema)

module.exports = UserModel