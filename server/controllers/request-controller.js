const connectDB = require('../database/connection')
const axios = require('axios')
const FCM = require('fcm-node')

exports.memberRequests = (req,res) => {
    var id = req.params.memberid
    connectDB.query('SELECT * FROM requests1 WHERE memberid = ?' , [id] , (err,requests) => {
        if(!requests || requests.length === 0) res.send([])
        var requests1 = []
        for(var i = 0; i < requests.length; i++){
            var results = {
                requestid : requests[i].requestid,
                userName : requests[i].userName,
                userPhone : requests[i].userPhone,
                userAddress : requests[i].userAddress,
                userCity : requests[i].userCity,
                userAge : requests[i].userAge,
                userGender : requests[i].userGender,
                requestDetails : requests[i].requestDetails,
                requestFile : JSON.parse(requests[i].requestFile),
                ministry : requests[i].ministry,
                userMacaddress : requests[i].userMacaddress,
                usertoken : requests[i].usertoken,
                memberid : requests[i].memberid,
                requeststatus : requests[i].requeststatus
            }
            requests1.push(results)
        }
        res.send(requests1)
    })
}

exports.userRequests = (req,res) => {
    var user = req.params.userMacaddress
    connectDB.query('SELECT * FROM requests WHERE userMacaddress = ? ORDER BY requeststatus' , [user] , (err,requests) => {
        if(!requests || requests.length === 0) res.send([])
        var requests1 = []
        for(var i = 0; i < requests.length; i++){
            var results = {
                requestid : requests[i].requestid,
                userName : requests[i].userName,
                userPhone : requests[i].userPhone,
                userAddress : requests[i].userAddress,
                userCity : requests[i].userCity,
                userAge : requests[i].userAge,
                userGender : requests[i].userGender,
                requestDetails : requests[i].requestDetails,
                requestFile : JSON.parse(requests[i].requestFile),
                ministry : requests[i].ministry,
                userMacaddress : requests[i].userMacaddress,
                usertoken: requests[i].usertoken,
                memberid : requests[i].memberid,
                requeststatus : requests[i].requeststatus
            }
            requests1.push(results)
        }
        res.send(requests1)
    })
}

exports.addRequest = (req,res) => {
    if(!req.files){
        var requeststatus = 'false'
        var userName = req.body.userName,
            userPhone = req.body.userPhone,
            userAddress = req.body.userAddress,
            userCity = req.body.userCity,
            userAge = req.body.userAge,
            userGender = req.body.userGender,
            requestDetails = req.body.requestDetails,
            requestFile = 'null',
            ministry = req.body.ministry,
            userMacaddress = req.body.userMacaddress,
            usertoken = req.body.usertoken,
            requeststatus = requeststatus

        var sql = 'INSERT INTO requests SET userName = ? , userPhone = ? , userAddress = ? , userCity = ? , userAge = ? , userGender = ? , requestDetails = ? , requestFile = ? , ministry = ? , userMacaddress = ? , usertoken = ? , requeststatus = ?'
        connectDB.query(sql , [userName,userPhone,userAddress,userCity,userAge,userGender,requestDetails,requestFile,ministry,userMacaddress,usertoken,requeststatus] , (err,results) => {
            if(err) res.send(err)
            res.end('done')
        })
    }else {
        var requeststatus = 'false',
            requestfiles1 = [],
            requestfiles = req.files
        for(var i = 0; i < requestfiles.length; i++){
            requestfiles1.push('server/uploads/' + requestfiles[i].filename)
        }
        
        var userName = req.body.userName,
            userPhone = req.body.userPhone,
            userAddress = req.body.userAddress,
            userCity = req.body.userCity,
            userAge = req.body.userAge,
            userGender = req.body.userGender,
            requestDetails = req.body.requestDetails,
            requestFile = JSON.stringify(requestfiles1),
            ministry = req.body.ministry,
            userMacaddress = req.body.userMacaddress,
            usertoken = req.body.usertoken,
            requeststatus = requeststatus

        var sql = 'INSERT INTO requests SET userName = ? , userPhone = ? , userAddress = ? , userCity = ? , userAge = ? , userGender = ? , requestDetails = ? , requestFile = ? , ministry = ? , userMacaddress = ? , usertoken = ? , requeststatus = ?'
        connectDB.query(sql , [userName,userPhone,userAddress,userCity,userAge,userGender,requestDetails,requestFile,ministry,userMacaddress,usertoken,requeststatus] , (err,results) => {
            if(err) res.send(err)
            console.log(requestfiles1)
            res.end('done')
        })
    }
}

exports.updateRequest = (req,res) => {
    var id = req.params.requestid,
        requeststatus = 'true'

    connectDB.query('UPDATE requests SET requeststatus = ? WHERE requestid = ?' , [requeststatus,id] , (err,results) => {
        if(err) res.send(err)
        res.send('request updated')
    })
}

exports.updateRequest1 = (req,res) => {
    var id = req.body.id,
        memberid = req.body.memberid,
        membertoken = req.body.membertoken,
        requeststatus = 'true'

    
    connectDB.query('SELECT * FROM requests WHERE requestid = ?' , [id] , (err,requests) => {
        for(var x = 0; x < membertoken.length; x++){
            var request = {
                requestid : id,
                memberid : memberid[x],
                membertoken : membertoken[x],
                userName : requests[0].userName,
                userPhone : requests[0].userPhone,
                userAddress : requests[0].userAddress,
                userCity : requests[0].userCity,
                userAge : requests[0].userAge,
                userGender : requests[0].userGender,
                requestDetails : requests[0].requestDetails,
                requestFile : requests[0].requestFile,
                ministry : requests[0].ministry,
                userMacaddress : requests[0].userMacaddress,
                usertoken : requests[0].usertoken,
            }
            connectDB.query('INSERT INTO requests1 SET ?' , [request] , (err,results) => {
                if(err) res.send(err)
            })
        }
        connectDB.query('SELECT membertoken FROM requests1 WHERE requestid = ?' , [id] , (err,members) => {
            if(err) res.send(err)
            connectDB.query('UPDATE requests SET requeststatus = ? WHERE requestid = ?' , [requeststatus,id] , (err,results) => {
                if(err) res.send(err)
                let fcm = new FCM(process.env.SERVER_KEY)
                let tokens = []
                for(var i = 0; i < members.length; i++){
                    tokens.push(members[i].membertoken)
                }
            
                let message = {
                    registration_ids : tokens,
                    notification : {
                        title : 'aytmen notification',
                        body : 'لديك طلب جديد',
                        "click_action" : "FLUTTER_NOTIFICATION_CLICK",
                        "icon" : "fcm_push_icon"
                    }
                }
                fcm.send(message , (err,response) => {
                    if(err) res.send(err)
                    connectDB.query('SELECT * FROM requests' , (err,requests) => {
                        if(err) res.send(err)
                        res.render('dashboard-requests' , {
                            message : 'تم توجيه الطلب',
                            requests : requests
                        })
                    })
                })
            })
        })
    })
    // connectDB.query('SELECT memberid,membertoken FROM members WHERE membername = ?' , [membername] , (err,member) => {
    //     if(err) res.send(err)
    //     connectDB.query('UPDATE requests SET memberid = ? , membertoken = ? WHERE requestid = ?' , [member[0].memberid,member[0].membertoken,id] , (err,resuts) => {
    //         if(err) res.send(err)
    //         else {
    //             let fcm = new FCM(process.env.SERVER_KEY)
    //             let message = {
    //                 to : member[0].membertoken,
    //                 notification : {
    //                     title : 'aytmen notification',
    //                     body : 'لديك طلب جديد',
    //                     "click_action" : "FLUTTER_NOTIFICATION_CLICK",
    //                     "icon" : "fcm_push_icon"
    //                 }
    //             }
    //             fcm.send(message , (err,response) => {
    //                 if(err) res.send(err)
    //                 connectDB.query('SELECT * FROM requests' , (err,requests) => {
    //                     if(err) res.send(err)
    //                     res.render('dashboard-requests' , {
    //                         message : 'تم توجيه الطلب',
    //                         requests : requests
    //                     })
    //                 })
    //             })
    //         }
            
    //     })
    // })
}

exports.confirmRequest = (req,res) => {
    var id = req.params.memberid,
        requestid = req.params.requestid
    connectDB.query('DELETE FROM requests1 WHERE memberid != ? AND requestid = ?' , [id,requestid] , (err,results) => {
        if(err) res.send(err)
        res.send("done")
    })
}