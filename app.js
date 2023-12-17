const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
var path = require('path');

const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')

const passport = require('passport')

//Load config
dotenv.config({path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

//connect to database
connectDB()

const PORT = process.env.PORT || 5000
const app = express()

//set view engine to ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
   

}))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

//use layouts

app.use(expressLayouts)
app.set('layout','layouts/main')



//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//routes

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

app.listen(PORT, console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`))
 