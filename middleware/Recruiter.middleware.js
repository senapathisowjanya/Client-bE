const jwt = require("jsonwebtoken")
require("dotenv").config()

const RecruiterAuth = (req, res, next) => {
  const token = req.headers.authorization
  try {
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        console.log(decoded)
        if (err) {
          res.status(400).send({
            msg: "Invalid token. Please login"
          })
        } else {
          req.body.RuserID = decoded.RuserID
          next()
        }
      });
    } else {
      return res.status(401).send({
        msg: "Access Denied/Not Authorized. Please login"
      })
    }

  } catch (error) {
    return res.status(500).send({
      msg: error.message
    })
  }
}

module.exports = RecruiterAuth
