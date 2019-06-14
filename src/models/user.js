const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const task = require('./task')

const userSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true,
    trim : true
  },
  age:{
    type : Number,
    default: 0,
    validate(value){
      if(value < 0){
        throw new Error('Age must be a positive number');
      }
    }
  },
  //Date to be entered as YYYY-MM-DD
  birthDate:{
    type : String,
    validate(value){
      if(validator.isAfter(value)){
        throw new Error('Date of birth is invalid');
      }
    }
  },
  email:{
    type : String,
    unique : true,
    required : true,
    trim : true,
    lowercase:true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error('invalid email id');
      }
    }
  },
  password:{
    type : String,
    required : true,
    trim : true,
    minlength : 7,
    validate(value){
      if(value.toLowerCase().includes('password')){
        throw new Error('Password cannot include "password" string');
      }
    }
  },
  tokens:[{
    token:{
      required: true,
      type: String
    }
  }],
  //type buffer has been created because
  //we don't want to store the image on file system
  //because of deployment issues
  avatar: {
      type: Buffer
  }
},{
  timestamps: true
})

//virutal keyword is used to create a virtual property
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

/*Method - 2 to hide private data*/
userSchema.methods.toJSON = function(){
  const user = this
  const userObject = this.toObject()

  delete userObject.password
  delete userObject.tokens
  //to delete the avatar data in read profile response
  //because it is to large
  delete userObject.avatar
  return userObject
}

userSchema.methods.generateAuthToken = async function(){
  const user  = this

  const token = jwt.sign({_id: user._id.toString()}, 'thisismynewcourse')

  user.tokens = user.tokens.concat({token})

  await user.save()

  return token
}

userSchema.statics.findByCredentials = async(email, password) =>{
  const id = await User.findOne({email})
  if(!id){
    throw new Error('Unable to log in email!')
  }

  const pass = await bcrypt.compare(password, id.password)

  if(!pass){
      throw new Error('Unable to log in password!')
  }

  return id
}

userSchema.pre('save', async function(next){
  const user = this

  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 2)
  }

  next()
})

//Delete user tasks when the user is removed
userSchema.pre('remove', async function(next) {
  const user = this

  await task.deleteMany({ owner : user._id})

  next()
})

const myFunction = async () =>{
  const token = jwt.sign({_id:'abc123'}, 'thisismy newcourse', {expiresIn: '0 seconds'})
  const data = jwt.verify(token, 'thisismy newcourse')

  console.log(data);
}

const User = mongoose.model('user', userSchema)

module.exports = User
