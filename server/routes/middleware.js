var jwt = require('jsonwebtoken')

exports.verify = (req,res,next) => {
    var token = req.cookies.jwt
    if(!token) {
        return res.render('login')
    }
    next()
}