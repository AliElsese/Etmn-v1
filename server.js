const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

dotenv.config({ path: './.env' })

var app = express()
var port = process.env.PORT

app.use(express.urlencoded({ extended : false }))
app.use(express.json())
app.use(cookieParser())

app.set("view engine" , "ejs");

app.use('/css', express.static("public/css"))
app.use('/img', express.static("public/img"))
app.use('/js', express.static("public/js"))

app.use('/' , require('./server/routes/router'))

app.listen(port , ()=>{
    console.log(`Server Running on http://localhost:${port}`); 
});