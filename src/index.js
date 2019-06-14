//https://www.hackerrank.com/challenges/simple-text-editor/problem?h_r=next-challenge&h_v=zen&h_r=next-challenge&h_v=zen&h_r=next-challenge&h_v=zen&h_r=next-challenge&h_v=zen
const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./Routers/user')
const taskRouter = require('./Routers/task')


const app = express()

const port = process.env.PORT || 3000

//multipart library(middleware) to help upload and store files
const multer = require('multer')
const upload = multer({
  dest: 'images',
  //limits property in multer is an Object
  //that provides multiple options
  //like limiting the size of the image
  limits:{
    //file size is provided in number bytes
    fileSize: 1000000
  },
  //fileFilter is an another option provided by multer
  //in the form of a function
  //cb is for callback
  fileFilter(req, file, cb){

    //provides methods on the original name
    //of the file
    //match provides us a way to wrtie regex(regular expressions)
    //within forward slashes. Eg: match(/..../)
    if(!file.originalname.match(/\.(doc|docx)/)){
      return cb(new Error('Please upload a word file'))
    }

    cb(undefined, true)

    //cb(new Error('File must be a PDF'))
    //if everything went well then
    //first argument is undefined and other one is true
    //cb(undefined, true)
    //not in use but still written
    //cb(undefined, false)
  }
})

//upload.single('xxxx')
//xxxx: should match the key name in
//form-data in postman


app.listen(port, () => {
  console.log("Server is up on port ",port);
})

app.post('/upload', upload.single('upload'), (req, res) => {
  res.send()
},
//middleware to display the error message in the form of json
//and not like and HTML page
(error, req, res, next) => {
  res.status(400).send({error: error.message})
})

//express middleware use
// app.use((req, res, next) => {
//   res.status(503).send('Site under maintenance.')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
