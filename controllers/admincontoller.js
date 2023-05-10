
const User = require("../models/userModel");
const Product = require("../models/productModel")
const Category = require('../models/categoryModel');
const bcrypt = require("bcryptjs");
const categoryModel = require("../models/categoryModel");





// ---admin login page
const login_Page = async (req, res) => {
  try {
    res.render("adminlogin");
  } catch (error) {
    console.log(error.message);
  }
};
// --verify log deatils----
const verify_login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("loginPage", { title: "Email and password is incorrect" });
        } else {
          req.session.admin_id = userData._id;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("loginPage", {
          title: "Email and password is incorrect",
        });
        res.send("worng")
      }
    } else {
      res.render("loginPage", { title: "Email and password is incorrect" });
      
    }
  } catch (error) {
    console.log(error.message);
  }
};
//  LOG IN

const load_dashboard = async (req, res) => {
  try {
    res.render("adminhome");
  } catch (error) {
    console.log(error.message);
  }
};
// --------USERS MANAGEMENT-----

// ----USER PAGE AND LISTING THE USER--------
const load_users = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });
    res.render("user", { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};



//---------------BLOCK AND UNBLOCK USER BY ADMIN --------------
const block_user = async (req, res) => {

  try {
    const id = req.query.id;
   
    const user    =  await User.findByIdAndUpdate({_id: id}, { $set: { block: true }}) 
      if (user) {
      
        res.send({ message: 'User blocked successfully' });
      } 
    }
   catch (error) {
    console.log(error.message);
   

  }

};
const unblock_user = async (req, res) => {
  try {
    const id = req.query.id;
 
    const userData = await User.findByIdAndUpdate({_id: id}, { $set: { block: false } });

    if(userData){
    res.send({ message: 'User has been unblocked.' });
    }

  } catch (error) {
    console.log(error.message);
   

  }
};

//-----------------PRODUCT MANAGEMENT----------------





//  -------PRODUCT PAGE------
const load_productPage = async (req, res) => {
  try {
    const productData = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category_details"
        }
      }
    ])
    if (productData) {
      res.render('product', { product: productData });
      
    } else {
      res.redirect('/admin/dashboard')
     
    }

  } catch (error) {
    console.log(error.message);

  }
};
// ------- ADD PRODUCT---PAGE-----


const load_addproduct = async (req, res) => {
  try {

    const category = await Category.find({})
    res.render("addproduct", { category: category });
  } catch (error) {
    console.log(error, message);
  }
};



// ---------ADD PRODUCTS------
const add_product = async (req, res) => {


 
  try {
 

    const arrImages = [];
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        arrImages.push(req.files[i].filename);
      }
    }
   
    const product = new Product({
      productName: req.body.productName,
      productColor: req.body.productColor,
      productSize: req.body.productSize,
      price: req.body.price,
      productQuantity: req.body.productQuantity,
      productDes: req.body.productDes,
      category_id: req.body.category_id,
      productImage: arrImages
    });
    const product_data = await product.save();
    res.status(200).redirect('/admin/product')
    // res.status(200).send({succces: true, msg:"product details",data:product_data})
  } catch (error) {
    res.status(400).send({succces: false,  msg: error.message })
    console.log(error.message);

  }

}
// ---EDIT PRODUCT----

const edit_product = async (req, res) => {

  try {
    const id = req.query.id;
    const product_data = await Product.findById({ _id: id });
   
     res.render('editproduct', { product: product_data }); 
  } catch (error) {
    console.log(error.message);
  }
}
//---------UPDATE PRODUCT(EDIT-PRODUCT POST)--------- 
const update_product = async (req, res) => {

  try {

    let dataobj;
    const arrImages =[];

    if( req.files.length > 0){   
       for(let i = 0; i < req.files.length; i++ ){
          arrImages[i] =  req.files[i].filename ;
       }
       dataobj = {
        productName:req.body.productName,
        productColor:req.body.productColor,
        productSize:req.body.productSize,
        price:req.body.price,
        productDes:req.body.productDes,
        productImage:arrImages,
       }

    }else{
//  ##for if admin not updating the image
      dataobj = {
        productName:req.body.productName,
        productColor:req.body.productColor,
        productSize:req.body.productSize,
        price:req.body.price,
        productDes:req.body.productDes
       }

    }

    
    const product_data = await Product.findByIdAndUpdate({_id:req.body.id},{ $set:dataobj},{ new:true});
   
        res.redirect('/admin/product')
  } catch (error) {
    console.log(error.message);
    res.status(500).send({success:false, msg: error.message});
  }

}

///--------------DELETE PRODUCT---------

const delete_product = async (req, res) => {

  try {
    const id = req.query.id;
    await Product.deleteOne({ _id: id });
    res.redirect('/admin/product');
  } catch (error) {
    console.log(error.message);
  }

}



// CATEGORY MANAGEMENT

//----------- ADD CATEGORY------------

const category_list = async (req, res) => {

  try {
    const categorydata = await Category.find({});
    res.render('category', { category: categorydata })
  } catch (error) {
    console.log(error.message);
  }

}


const add_category = async (req, res) => {
  try {
     
    const categoryName = req.body.categoryName;
    const CategoryDescription = req.body.CategoryDescription;

    const category = new Category({
      categoryName: categoryName,
      CategoryDescription: CategoryDescription
    });

    const category_data = await category.save();
    res.status(200).send({sucess:true,msg:"category is added",data:category_data});

  } catch (error) {
    console.log(error.message);
  }
}
// -------ORDER---

const load_order = async (req, res) => {

  try {
    res.render('order');
  } catch (error) {

    console.log(error.message);
  }


}




module.exports = {
  login_Page,
  verify_login,
  load_dashboard,
  load_users,
  block_user,
  unblock_user,
  load_productPage,
  add_product,
  add_category,
  load_addproduct,
  edit_product,
  update_product,
  delete_product,
  category_list,
  load_order
};
