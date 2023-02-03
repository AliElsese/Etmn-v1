const connectDB = require('../database/connection')
const axios = require('axios')
const FCM = require('fcm-node')

const jwt = require('jsonwebtoken')

exports.create = (req,res) => {
    try {
        var isActivate = 'false'
        if(!req.body.membername || !req.body.memberjob || !req.body.memberministry || !req.body.memberposition || !req.body.memberaddress || !req.body.membercity || !req.body.memberphone || !req.body.memberpassword){
            res.status(404).render('add-member' , {
                message : 'املأ جميع البيانات'
            })
        } else {
            var payload = { member : req.body.membername }
            var token = jwt.sign(payload , process.env.JWT_SECRET , {
                expiresIn : process.env.JWT_EXPIRES_IN
            })
            var cookieOptions = {
                expires : new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                        
                httpOnly : false,
                secure : false
            }
            var member = {
                membername : req.body.membername,
                memberjob : req.body.memberjob,
                memberministry : req.body.memberministry,
                memberposition : req.body.memberposition,
                memberaddress : req.body.memberaddress,
                membercity : req.body.membercity,
                memberphone : req.body.memberphone,
                memberpassword : req.body.memberpassword,
                membertoken : token,
                isActivate : isActivate
            }
            var sql = 'INSERT INTO members SET ?'
            connectDB.query(sql , [member] , (err,result) => {
                if(err) res.send(err)
                res.status(200).render('add-member' , {
                    message : 'تم التسجيل برجاء انتظار الموافقة'
                })
            })
        } 
    } catch (error) {
        res.send(error)
    }
}

exports.addMember = (req,res) => {
    try {
        var isActivate = 'false'
        if(!req.body.membername || !req.body.memberjob || !req.body.memberministry || !req.body.memberposition || !req.body.memberaddress || !req.body.membercity || !req.body.memberphone || !req.body.memberpassword){
            res.status(404).send('حدث خطأ في التسجيل')
        } else {
            var member = {
                membername : req.body.membername,
                memberjob : req.body.memberjob,
                memberministry : req.body.memberministry,
                memberposition : req.body.memberposition,
                memberaddress : req.body.memberaddress,
                membercity : req.body.membercity,
                memberphone : req.body.memberphone,
                memberpassword : req.body.memberpassword,
                membertoken : req.body.membertoken,
                isActivate : isActivate
            }
            var sql = 'INSERT INTO members SET ?'
            connectDB.query(sql , [member] , (err,result) => {
                if(err) res.send(err)
                res.status(200).send('تم التسجيل برجاء انتظار الموافقة')
            })
        } 
    } catch (error) {
        res.send(error)
    }
}

exports.updateToken = (req,res) => {
    var id = req.params.memberid,
        token = req.body.membertoken
    connectDB.query('SELECT membertoken FROM members WHERE memberid = ?' , [id] , (err,member) => {
        if(err) res.send(err)
        else if(member[0].membertoken != token) {
            connectDB.query('UPDATE members SET membertoken = ? WHERE memberid = ?' , [token,id] ,(err,results) => {
                if(err) res.send(err)
                res.send('data updated')
            })
        } else res.send('sametoken')
    })
}

exports.activateMember = (req,res) => {
    var token = req.params.membertoken,
        id = req.params.memberid,
        isActivate = 'true'
    connectDB.query('UPDATE members SET isActivate = ? WHERE memberid = ?' , [isActivate,id] , (err,result) => {
        if(err) res.send(err)
        else {
            if(token != 'null'){
                let fcm = new FCM(process.env.SERVER_KEY)
                let message = {
                    to : token,
                    notification : {
                        title : 'aytmen notification',
                        body : 'لقد تم تفعيل حسابك',
                        "click_action" : "FLUTTER_NOTIFICATION_CLICK",
                        "icon" : "fcm_push_icon"
                    }
                }
                fcm.send(message , (err,response) => {
                    if(err) res.send(err)
                    connectDB.query('SELECT * FROM members ORDER BY isActivate' , (err,members) => {
                        if(err) res.send(err)
                        res.render('dashboard-members' , {
                            message : 'تم تفعيل الحساب',
                            members : members
                        })
                    })
                })
            }
            else {
                connectDB.query('SELECT * FROM members ORDER BY isActivate' , (err,members) => {
                    if(err) res.send(err)
                    res.render('dashboard-members' , {
                        message : 'تم تفعيل الحساب',
                        members : members
                    })
                })
            }
        }
    })
}

exports.find = (req,res) => {
    var memberphone = req.params.memberphone
    connectDB.query('SELECT * FROM members WHERE memberphone = ?' , [memberphone] , (err,member) => {
        if(member.length === 0 || !member) res.send([])
        res.send(member)
    })
}

exports.allMinistries = (req,res) => {
    connectDB.query('SELECT DISTINCT memberministry FROM members' , (err,ministries) => {
        if(err) res.send(err)
        else if(!ministries || ministries.length === 0) {
            var member = {
                memberministry : 'اخرى'
            }
            ministries.push(member)
            res.send(ministries)
        } else {
            var member = {
                memberministry : 'اخرى'
            }
            ministries.push(member)
            res.send(ministries)   
        }
    })
}