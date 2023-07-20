const jwt = require("jsonwebtoken")
require("dotenv").config()

const jonFormAuth = (req, res, next)=>{
const token = req.headers.authorization

try {
    if(token){
        console.log("token", token)
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=> {
            console.log("decoded", decoded)
            if(decoded){
                req.body.uniqueID = decoded.userID
                next()
            }else{
                return res.status(400).send({
                    tmsg:"token has expired"
                })
            }
      });
    }else{
        return res.status(400).send({
            msg:"Access Denied/Not Authorized"
        })
    }
    
} catch (error) {
    return res.status(500).send({
        msg:"Something went wrong"
    })
}
}

module.exports = jonFormAuth
