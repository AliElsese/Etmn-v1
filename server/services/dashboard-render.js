const connectDB = require('../database/connection')
const axios = require('axios')

module.exports = {
    showDashboardPage : (req,res) => {
        res.render('dashboard')
    },

    showAddMemberPage : (req,res) => {
        res.render('add-member')
    },

    showLoginPage : (req,res) => {
        res.render('login')
    },

    showAdminPage : (req,res) => {
        res.render('administration')
    },

    showRequestsPage : (req,res) => {
        connectDB.query('SELECT * FROM requests ORDER BY requeststatus' , (err,requests) => {
            if(err) res.end(err)
            res.render('dashboard-requests' , {
                requests : requests
            })
        })
    },

    showUpdateRequest : (req,res) => {
        var id = req.params.requestid,
            ministry = req.params.ministry
        connectDB.query('SELECT membername FROM members WHERE memberministry = ?' , [ministry] , (err,members) => {
            if(err) res.send(err)
            res.render('update-request' , {
                id : id,
                members : members
            })
        })
    },

    showAccountsPage : (req,res) => {
        connectDB.query('SELECT * FROM members ORDER BY isActivate' , (err,members) => {
            if(err) res.send(err)
            res.render('dashboard-members' , {
                members : members
            })
        })
    }
}