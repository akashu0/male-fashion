const mongoose = require('mongoose');


const addressSchema = mongoose.Schema({

   userid :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
   },
   address1:{
    type: String,
    required: true
   },
   address2:{
      type: String,
      required: true
   },
   city:{
      type: String,
      required: true
   },
   country:{
      type: String,
      required:true
   },
  landmark:{
   type: String,
   required: true
  },
  zipcode:{
   type: String,
   required: true
  }




});

module.exports = mongoose.model('addres',addressSchema);
 