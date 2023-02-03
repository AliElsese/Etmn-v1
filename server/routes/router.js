const express = require('express');
const route = express.Router();
const connectDB = require('../database/connection')
const jwt = require('jsonwebtoken')
const {verify} = require('./middleware')
const multer = require('multer');
const storage = multer.diskStorage({
    destination : (req , file , cb) => {
        cb(null , './server/uploads')
    },

    filename : (req , file , cb) => {
        cb(null , file.originalname)
    }
})
const upload = multer({ storage : storage })

const FCM = require('fcm-node')

const memberController = require('../controllers/member-controller')
const requestController = require('../controllers/request-controller')

const dashboardRender = require('../services/dashboard-render')

// api members
route.post('/api-addMember' , memberController.create)
route.post('/api-addNewMember' , memberController.addMember)
route.get('/api-activateMember/:membertoken/:memberid' , memberController.activateMember)
route.put('/api-updateToken/:memberid' , memberController.updateToken)
route.get('/api-member/:memberphone' , memberController.find)
route.get('/api-allMinistries' , memberController.allMinistries)

// api requests
route.get('/api-memberRequests/:memberid' , requestController.memberRequests)
route.get('/api-userRequests/:userMacaddress' , requestController.userRequests)
route.post('/api-addRequest' , upload.array('requestFile') , requestController.addRequest)
route.put('/api-updateRequest/:requestid' , requestController.updateRequest)
route.post('/api-updateRequest' , requestController.updateRequest1)
route.post('/api-confirmRequest/:memberid/:requestid' , requestController.confirmRequest)

// login
route.post('/auth/login' , (req,res) => {
    try {
        var {name , password} = req.body
        
        if(!name || !password) {
            res.render('login' , {
                message : 'من فضلك قم بادخال اسمك وكلمة السر'
            })
        } else {
            connectDB.query('SELECT * FROM admin WHERE name = ?' , [ name ] , async (err , results) => {
                if(err) res.send(err)
                else if(!results || results.length == 0 || password != results[0].password){
                    res.render('login' , {
                        message : 'اسم المستخدم او كلمة السر خطأ'
                    })
                } 
                else {
                    var id = results[0].adminid
                    var token = jwt.sign({id : id} , process.env.JWT_SECRET , {
                        expiresIn : process.env.JWT_EXPIRES_IN
                    })
                    var cookieOptions = {
                        expires : new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                        ),
                        
                        httpOnly : false,
                        secure : false
                    }
                    res.cookie('jwt' , token , cookieOptions)
                    res.render('administration')
                }
            })
        }
    } catch (error) {
        res.send(error)
    }    
})

// notifications
route.post('/api-sendNotificationRequest' , (req,res) => {
    try {
        let fcm = new FCM(process.env.SERVER_KEY)
        let message = {
            to : '/topics/' + req.body.topic,
            notification : {
                title : 'aytmen notification',
                body : 'لديك طلب جديد',
                "click_action" : "FCM_PLUGIN_ACTIVITY",
                "icon" : "fcm_push_icon"
            }
        }
        fcm.send(message , (err,response) => {
            if(err) res.send(err)
            console.log(message)
            console.log(response)
            res.send(response)
        })
    } catch (error) {
        res.send(error)
    }
})

// render dashboard
route.get('/dashboard' , dashboardRender.showDashboardPage)
route.get('/add-member' , dashboardRender.showAddMemberPage)
route.get('/login' , dashboardRender.showLoginPage)
route.get('/administration' , dashboardRender.showAdminPage)
route.get('/dashboard-requests' , dashboardRender.showRequestsPage)
route.get('/update-request/:requestid/:ministry' , dashboardRender.showUpdateRequest)
route.get('/dashboard-members' , dashboardRender.showAccountsPage)

module.exports = route