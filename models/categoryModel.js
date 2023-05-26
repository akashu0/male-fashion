const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({

   categoryName:{
    type: String,
    required: true
   },
   CategoryDescription: {
    type: String,
    required: true
  },
  status:{
    type:String, 
    default:0
  }

})

module.exports = mongoose.model("Category",categorySchema)