const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) =>{
  try {
      const token = req.header('Authorization').replace('Bearer ', '')
      const decoded = jwt.verify(token, process.env.AUTH_TOKEN)
      const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

      if(!user){
        throw new Error(token)
      }

      req.token = token
      req.user = user
      next()
  } catch (e) {
    res.status(401).send({error : 'Please authenticate', e: e})
  }
}

module.exports = auth
