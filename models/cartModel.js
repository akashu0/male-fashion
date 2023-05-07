const mongoose= require('mongoose');



const cartSchema = mongoose.Schema({

product_id:{
    type: String,
    required: true
},
userId:{
    type: String,
    required:true,

},


})

module.exports = mongoose.model("Cart",cartSchema);