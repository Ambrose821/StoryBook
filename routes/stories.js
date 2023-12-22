const express = require('express')
const router = express.Router()
const{ensureAuth} = require('../controller/auth')

const Story = require('../models/Story')
const User = require('../models/User')
//@desc Show add page
//@route Get /strories/add
router.get('/add',ensureAuth,(req,res)=>{
    res.render('stories/add')
})

//@desc Process post stories
//@route post /stories
router.post('/', ensureAuth, async(req,res)=>{
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
        res.render('stories/index',{stories: stories, user:req.user})
    }catch(err){
        console.log(err)
        res.render('error/500')
    }
})
//@desc edit existing story page
//@GET /stories/edit/:id
router.get('/edit/:id',ensureAuth, async(req,res)=>
{
    const story = await Story.findOne({
        _id: req.params.id
    }).lean()

    if(!story){
        return res.render('error/404')
    }
    if(story.user != req.user.id){
        res.redirect('/stories')
    }else{
        res.render('stories/edit',{
            story:story
        })
    }
})
//@desc Update Story when edited
//@route PUT /strories/:id
router.put('/:id',ensureAuth, async(req,res)=>{
  try{
    let story = await Story.findById(req.params.id).lean();
    if(!story){
        return res.render('error/404')
    }
    if(story.user != req.user.id){
        res.redirect('/stories')
    }
    else{
        const { title, status, body } = req.body;
        const updateFields = { title, status, body };
        
        story = await Story.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updateFields, { new: true });
        
        res.redirect('/dashboard')
    }
    }catch(error){
        console.log(error)
    }
})

router.delete('/:id',ensureAuth, async(req,res)=>{
    try{

        let story = await Story.findById(req.params.id).lean();
        if(!story){
            return res.render('error/404')

        }
        if(story.user != req.user.id){
            res.redirect('/stories')
        }
        else{
        
            const{title,status,body} = req.body;
        const updateFields = {title,status,body};
            //Could have also used await Story.remoce({._id req.params.id})
        story = await Story.findOneAndDelete({ _id: req.params.id, user: req.user.id }, updateFields, { new: true })
        res.redirect('/dashboard')
     }
     
        }catch(err){
        console.log(err)
        return res.render('error/500')
    }

}
)

router.get('/:id',ensureAuth,async(req,res)=>{
    try{
    const story = await Story.findOne({_id: req.params.id}).populate('user').lean()

    
    if(!story){
        return res.render('error/500')
    }

    else{
        res.render('stories/single',{story: story,user:req.user})
    }
} catch(err){
    console.log(err)
    res.render('error/500')
}

})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
      const stories = await Story.find({
        user: req.params.userId,
        status: 'public',
      })
        .populate('user')
        .lean()
  
      res.render('stories/index', {
        stories,
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  })
module.exports = router