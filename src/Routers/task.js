const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')


router.post('/tasks', auth, async (req, res) => {
  //const task = new Task(req.body)

  const task = new Task({
    //... is an ES6 operator
    //spread operator
    ...req.body,
    owner: req.user._id
  })
  try{
    await task.save()
    res.status(201).send(task)
  }
  catch(e){
    res.status(400).send(e)
  }

})

//tasks?limit=10&skip=0
//pagination technique used to limit to x results
//and skip the first n results
//GET /tasks?sortBy=createdAt_asc or
//GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}

  if(req.query.completed){
    match.completed = req.query.completed === 'true'
  }
  if(req.query.sortBy){
    const parts = req.query.sortBy.split(":")
    sort[parts[0]] = parts[1] === 'desc'? -1:1
  }

   try{
     await req.user.populate({
         path: 'tasks',
          match,
          options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
          }
       }).execPopulate()
    res.status(200).send(req.user.tasks)
  }catch(e){
    //console.log(e);
    res.status(500).send(e)
  }
})

router.get('/tasks/:id', async (req, res) => {
  const _id = req.params.id;

  try{
    //const task = await Task.find({_id})
    const task = await Task.findOne({
      _id, owner: req.user._id
    })
    if(!task){
      res.status(404).send('No such tasks')
    }
    res.status(201).send(task)
  }catch(e){
    res.status(500).send(e)
  }
})

router.patch('/tasks/:id', async (req, res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })

  if(!isValidOperation){
    return res.status(400).send('Invalid update')
  }

  try{
    const task = await Task.findById(req.params.id)
    updates.forEach((update) => task[update] = req.body[update])

    await task.save()

    if(!task){
      res.status(404).send()
    }

    res.send(task)
  }catch(e){
    res.status(400).send(e)
  }
})

router.delete('/tasks/:id', async (req, res) => {
  try{
    const task = await Task.findByIdAndDelete(req.params.id)
    if(!task){
      res.status(400).send()
    }

    res.send(task)
  }catch(e){
    res.status(404).send(e)
  }
})

module.exports = router
