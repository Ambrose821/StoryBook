const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
var path = require('path');
const methodOverride = require('method-override') //Allows us to use PUT and DELETE
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const mongoose = require('mongoose')

const passport = require('passport')
const MongoStore = require('connect-mongo')

//Load config
dotenv.config({path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

//connect to database
connectDB()

const PORT = process.env.PORT || 5000
const app = express()

//Body parser middleware to accept for, data
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//middle ware for methodOverride so use of PUT and DELETE is possible
//from method-Overide docs
 app.use(methodOverride((req,res)=>{
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        //look in urlencoded POST  bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
 }))

const {formatDate, truncate, stripTags,editIcon } = require('./helper/ejs')
//set view engine to ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Make formatDate function available globally to EJS templates
app.locals.formatDate = formatDate;
app.locals.truncate = truncate;
app.locals.stripTags = stripTags;
app.locals.editIcon = editIcon;
//Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl : process.env.MONGO_URI})

}))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

//Set global Variable for user instead of adding it to every route with {user: req.user}
app.use((req,res,next)=>
{
    res.locals.user = req.user || null
    next()
})
//use layouts

app.use(expressLayouts)
app.set('layout','layouts/main')



//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//routes

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

app.listen(PORT, console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`))
 