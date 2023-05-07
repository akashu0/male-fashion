const mongoose = require('mongoose');


const addressSchema = mongoose.Schema({

   userid :{
    type: String,
    required: true
   },
   address:{
    type: Array,
    required: true
   }



});

module.exports = mongoose.model('addres',addressSchema);
 