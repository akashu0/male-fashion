
const mongoose= require('mongoose');



const couponSchema = new mongoose.Schema({

couponName:{
    type: String,
    required:true
},
couponAmount:{
    type: Number,
    required:true
},
couponExprieDate:{
    type: Date,
    required:true
},
couponDescription:{
    type: String,
    required:true
},
// createdAt: {
//     type: Date,
//     default: Date.now,
//     index: { expires:'90000' },
//   },
minimumAmount:{
    type: Number,
    required:true
},
category:{
    type:String,
    required:false  
}
  
})

module.exports = mongoose.model('coupon',couponSchema);