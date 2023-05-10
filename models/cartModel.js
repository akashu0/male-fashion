const mongoose= require('mongoose');



const cartSchema = mongoose.Schema({

 product :[{
product_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required: true
}}],
userId:{
    type: String,
    required:true,

},


})

module.exports = mongoose.model("Cart",cartSchema);