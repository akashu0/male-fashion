const mongoose= require('mongoose');

 const orderSchema =   mongoose.Schema({

   userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    requried: true
   },
   product :[{
    product_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required: true
    },
    }],
    total:{
        type:Number,
        required:true
    },
    coupon:{
        type:String,
        default:0
    },
    paymentMethod:{
     type:String,
     required:true
    },
   status:{
    type:String,
    default:"Pending"
   },
   address:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"addres",
    required: true
   },
orderDate:{
    type: Date,
    default: Date.now
},
itemquantity:{
    type:Number,
    required:true
},
category_id:{
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Category',
     required:true, 
}

 })
 module.exports = mongoose.model('order',orderSchema);
 