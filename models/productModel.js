const mongoose =require("mongoose");


 const productSchema =  mongoose.Schema({

    productName:{
        type: String,
        required:true,
    },
    productColor:{
        type: String,
        required:true,
    },
    price:{
        type: String,
        required: true,
    },
    productSize:{
     type: String,
    required: true,
    },
   
    productDes:{
        type: String,
        required: true,
    },
    category_id:{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'categories',
         required:true, 
    },
    isselected:{
        type: Number,
        default:0
    },
    productStatus: {
        type: Boolean,
        default: true,
      },
      productQuantity: {
        type: String,
        required: true
      },
    productImage:{
        type: Array,
        required: true,
        validate:[arraylimit,"maximun 3 product image"]
     },
    
    });

    function arraylimit(val) {
        return val.length <= 3;
    }


    module.exports = mongoose.model("Product",productSchema);