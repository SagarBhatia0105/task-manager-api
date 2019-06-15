const mongoose = require('mongoose');
const validator = require('validator');

console.log(process.env.DATABASE_URL);
console.log(typeof(process.env.DATABASE_URL));
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser : true,
  useCreateIndex : true
})
