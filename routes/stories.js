const express = require('express')
const router = express.Router()
const{ensureAuth,ensureGuest} = require('../controller/auth')

const Story = require('../models/Story')
const User = require('../models/User')
//@desc Show add page
//@route Get /strories/add
router.get('/add',ensureAuth,(req,res)=>{
    res.render('stories/add')
})

//@desc Process post stories
//@route post /stories
router.post('/', ensureAuth,async(req,res)=>{
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

//@desc displays public stories
//only need '/' because pur route for /stories in app js uses /stories by default
router.get('/',ensureAuth, async(req,res)=>{
    try{
        const stories = await Story.find({status: 'public'}).populate('user').sort({createdAt:'desc'}).lean()
        res.render('stories/index',{stories: stories})
    }catch(err){

    }
})
module.exports = router