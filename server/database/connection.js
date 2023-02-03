const mysql = require('mysql')

const connectDB = mysql.createConnection({
    connectionLimit : 10,
    host            : process.env.DATABASE_HOSt,
    user            : process.env.DATABASE_USER,
    password        : process.env.DATABASE_PASSWORD, 
    database        : process.env.DATABASE
})

module.exports = connectDB