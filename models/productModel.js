const mongoose =require("mongoose");
const slugify = require('slugify');



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
         ref: 'Category',
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
     slug: {
        type: String,
        unique: true,
       
      }
    
    });

    function arraylimit(val) {
        return val.length <= 3;
    }
    productSchema.pre('save', async function (next) {
        if (this.isModified('productName') || !this.slug) {
          const slug = slugify(this.productName, { lower: true });
      
          let existingUser = await this.constructor.findOne({ slug: slug });
          if (existingUser) {
            let counter = 1;
            while (existingUser) {
              this.slug = `${slug}-${counter}`;
              counter++;
              existingUser = await this.constructor.findOne({ slug: this.slug });
            }
          } else {
            this.slug = slug;
          }
        }
      
        next();
      });


    module.exports = mongoose.model("Product",productSchema);