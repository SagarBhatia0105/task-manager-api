const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
//ES6 destructuring syntax
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/accounts')
const User = require('../models/user')

const upload = multer({
  limits:{
    fileSize: 1000000,
  },
  fileFilter(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
      return cb(new Error('Please upload img file'))
    }

    cb(undefined, true)
  }
})

//console.log('aao');
//user login
router.post('/users/login', async(req, res) => {
  try{
    const user = await User.findByCredentials(req.body.email,
                req.body.password)

    const token = await user.generateAuthToken()

    res.send({user, token})
  }catch(e){
    res.status(400).send()
  }
})

//user signup
router.post('/users', async (req, res) => {

  const users = new User(req.body)
  try{

    const token = await users.generateAuthToken()
    sendWelcomeEmail(users.email, users.name)

    res.status(201).send({users, token})
  }catch(e){
    console.log(e);
    res.status(400).send(e)
  }
})

//user logout
router.post('/users/logout', auth, async(req, res) => {
  try {

    req.user.tokens = req.user.tokens.filter((token) =>{
      return token.token !== req.token
    })

    await req.user.save()

    res.send()
  } catch (e) {

    res.status(500).send()

  }
})

//user log out everywhere
router.post('/users/logoutAll', auth, async(req, res) => {
  try {

    req.user.tokens = []

    await req.user.save()

    res.send()
  } catch (e) {

    res.status(500).send()

  }
})

//to fetch mutilple users
//adding the middleware to the route by adding auth middleware
//as the second argument
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

//update operation for users
router.patch('/users/me', auth, async(req, res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age', 'birthDate']
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })

  if(!isValidOperation){
    return res.status(400).send('Invalid update')
  }

  try{

      updates.forEach((update) => req.user[update] = req.body[update])

      await req.user.save()

      res.send(req.user)
  }catch(e){
    res.status(400).send(e)
  }
})

//delete user account
router.delete('/users/me', auth, async (req, res) => {
  try {

    await req.user.remove()
    sendCancellationEmail(req.user.email, req.user.name)
    res.send(req.user)

  } catch (e) {
    res.status(404).send(e)
  }
})

//upload picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) =>{
  const buffer = await sharp(req.file.buffer)
              .resize({width: 250, height: 250})
              .png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send('image upload complete :)')
}, (error, req, res, next) =>{
  res.status(400).send({error: error.message})
})

//delete user picture
router.delete('/users/me/avatar', auth, async (req, res) =>{
  req.user.avatar = []
  await req.user.save()
  res.send('image deleted!!')
}, (error, req, res, next) =>{
  res.status(400).send({error: error.message})
})

//get the user picture
router.get('/users/:id/avatar', async (req, res) =>{
  try{
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar){
      throw new Error()
    }

    //response header
    res.set('Content-type', 'image/png')
    res.send(user.avatar)
  }catch(e){
    res.status(404).send()
  }
})

module.exports = router
