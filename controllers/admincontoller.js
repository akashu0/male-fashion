const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const bcrypt = require("bcryptjs");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const Banner = require('../models/banner');
const excelJs = require('exceljs');
// ---admin login page
const login_Page = async (req, res) => {
  try {
    res.render("adminlogin");
  } catch (error) {
      res.render('error',{error:error.message})
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
        res.send("worng");
      }
    } else {
      res.render("loginPage", { title: "Email and password is incorrect" });
    }
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

// adminlogout request button

const admin_logout = async(req,res)=>{
try {
  req.session.destroy();
  res.redirect('/admin')
} catch (error) {
    res.render('error',{error:error.message})
  
}

}



// loading dashboad with deatils of each sections like user count, product count,order details
const load_dashboard = async (req, res) => {
  try {
    const revenue = await Order.aggregate([{ '$match': {"status": "Delivered"}},{'$group': {'_id': "null", "total": {"$sum": "$total"}}}])
    const ordercount = await Order.find({}).count()
    const orders = await Order.find({}).populate('userId')
    const product = await Product.find({}).count()
    const user = await User.find({}).count()
    res.render("adminhome",{orders: orders,ordercount: ordercount,user: user, product: product,revenue: revenue });
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

const get_saledata = async (req, res) => {
  try {
    const salesData = await Order.aggregate([{ $match: { status: 'Delivered' } },{ $group: {_id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },totalRevenue: { $sum: '$total' }}},{ $sort: { _id: 1 } }]);
    const categorySales = await Order.aggregate([
      {
        $lookup: {
          from: "categories", // The name of the Category collection
          localField: "category_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $unwind: "$categoryInfo"
      },
      {
        $group: {
          _id: "$categoryInfo.categoryName",
          totalSales: { $sum: "$total" }
        }
      }
    ]);  
   res.json({ salesData: salesData, categorySales: categorySales });  
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

// converting saledata into excel file and downloading the report
const excel_saledata = async(req,res)=>{
try {
  const workbook = new excelJs.Workbook();
  const worksheet = workbook.addWorksheet("Sale Data")
  const revenue = await Order.aggregate([{ '$match': {"status": "Delivered"}},{'$group': {'_id': "null", "total": {"$sum": "$total"}}}])
  const ordercount = await Order.find({}).count()
  const product = await Product.find({}).count()
  const user = await User.find({}).count();

  worksheet.addRow(['Total Revenue',revenue[0].total]);
  worksheet.addRow(["Order Count" ,ordercount]);
  worksheet.addRow(["User Count",  user]);
  worksheet.addRow(["Product Count",product]);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=saledata.xlsx");
  
  return workbook.xlsx.write(res)
    .then(() => {
      res.status(200).end();
    })
    .catch(error => {
      console.error(error);
      res.status(500).end();
    });
} catch (error) {
    res.render('error',{error:error.message})
  
}
}


// --------USERS MANAGEMENT-----

// ----USER PAGE AND LISTING THE USER--------
const load_users = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });
    res.render("user", { users: userData });
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

//---------------BLOCK AND UNBLOCK USER BY ADMIN --------------
const block_user = async (req, res) => {
  try {
    const id = req.query.id;

    const user = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { block: true } }
    );
    if (user) {
      res.send({ message: "User blocked successfully" });
    }
  } catch (error) {
      res.render('error',{error:error.message})
  }
};
const unblock_user = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { block: false } }
    );

    if (userData) {
      res.send({ message: "User has been unblocked." });
    }
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

//-----------------PRODUCT MANAGEMENT----------------

//  -------PRODUCT PAGE---------
const load_productPage = async (req, res) => {
  try {
    const productData = await Product.find({}).populate('category_id').exec();
    if (productData) {
      res.render("product", { product: productData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
      res.render('error',{error:error.message})
  }
};
// ------- ADD PRODUCT---PAGE-----

const load_addproduct = async (req, res) => {
  try {
    const category = await Category.find({});
    res.render("addproduct", { category: category });
  } catch (error) {
    res.render('error',{error:error.message})

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
      productImage: arrImages,
    });
    const product_data = await product.save();
    res.status(200).redirect("/admin/product");
    // res.status(200).send({succces: true, msg:"product details",data:product_data})
  } catch (error) {
      res.render('error',{error:error.message})
  }
};
// ---EDIT PRODUCT----

const edit_product = async (req, res) => {
  try {
    const id = req.query.id;
    const product_data = await Product.findById({ _id: id });

    res.render("editproduct", { product: product_data });
  } catch (error) {
      res.render('error',{error:error.message})
  }
};
//---------UPDATE PRODUCT(EDIT-PRODUCT POST)---------
const update_product = async (req, res) => {
  try {
    let dataobj;
    const arrImages = [];

    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        arrImages[i] = req.files[i].filename;
      }
      dataobj = {
        productName: req.body.productName,
        productColor: req.body.productColor,
        productSize: req.body.productSize,
        price: req.body.price,
        productDes: req.body.productDes,
        productImage: arrImages,
      };
    } else {
      //  ##for if admin not updating the image
      dataobj = {
        productName: req.body.productName,
        productColor: req.body.productColor,
        productSize: req.body.productSize,
        price: req.body.price,
        productDes: req.body.productDes,
      };
    }
    const product_data = await Product.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: dataobj },
      { new: true }
    );

    res.redirect("/admin/product");
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

///--------------DELETE PRODUCT---------

const delete_product = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.deleteOne({ _id: id });
    res.redirect("/admin/product");
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

// CATEGORY MANAGEMENT

//----------- ADD CATEGORY------------

const category_list = async (req, res) => {
  try {
    const categorydata = await Category.find({});
    const title = req.flash("title");
    res.render("category", { category: categorydata ,title: title[0] || "" });
  } catch (error) {
      res.render('error',{error:error.message})
  }
};
// adding category by admin also checking if category already available in database
const add_category = async (req, res) => {
  try {
    const categoryName = req.body.categoryName.trim()
    const CategoryDescription = req.body.CategoryDescription.trim()
   if(categoryName == '' || CategoryDescription == '' ){
    req.flash("title", "categoryName and CategoryDescription is required");
    res.redirect('/admin/category')
   } 

  // find the all category and with map() methode checking if categoryName is matching existing categoryName and if it true redirecting with error message
   const category_details = await Category.find({})
   let  foundCategory;
   category_details.forEach((category) => {
   if(category.categoryName.toLowerCase() === categoryName.toLowerCase()){
       foundCategory = true;
  }
});
 if(foundCategory){
    req.flash("title", "Category already is Available");
    res.redirect('/admin/category')
   }else{
    const category = new Category({
      categoryName: categoryName,
      CategoryDescription: CategoryDescription,
    });

    const category_data = await category.save();
   res.redirect('/admin/category')
  } 
    // res.send({ sucess: true, msg: "category is added", data: category_data });
  } catch (error) {
      res.render('error',{error:error.message})
  }
};
// admin can list and unlist the category this is done by a ajax call with values of categoryid and list or unlist 
const list_unlist = async(req,res)=>{
  try {
    const categoryid = req.body.categoryId
    const tochange = req.body.text
   const cat_data = await Category.findById({_id: categoryid})
  if (cat_data) {
    if(tochange =="List"){
      Category.updateOne(
        { _id: categoryid },
        { $set: { status: "0" } }
      )
        .then(() => {
          res.send({ message: "Item Listed" });
        })
        .catch((error) => {
         
          req.flash("title", "Failed to update category");
            res.redirect('/admin/category')
        });
    }else{
      Category.updateOne(
        { _id: categoryid }, 
        { $set: { status: "1" } }
      )
        .then(() => {
          res.send({ message: "Item Unlisted" });
        })
        .catch((error) => {
          req.flash("title", "Failed to update category");
            res.redirect('/admin/category')
        });
    }
  }else{
    req.flash("title", "Something went worng");
    res.redirect('/admin/category')
  }
  } catch (error) {
      res.render('error',{error:error.message})
  }
}


// -------ORDER-----

const load_order = async (req, res) => {
  try {
    const order_details = await Order.find({}).populate("userId").exec();
    res.render("order", { order: order_details });
  } catch (error) {
      res.render('error',{error:error.message})
  }
};
// order details
const order_details = async (req, res) => {
  try {
    const orderid = req.query.id;
    const order_details = await Order.findById({ _id: orderid })
      .populate("product.product_id")
      .populate("address")
      .populate("userId")
      .exec();
    res.render("orderdetails", { order: order_details });
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

const status_update = async (req, res) => {
  try {
    const orderid = req.body.orderid;
    const status = req.body.status;
    const order_update = await Order.findByIdAndUpdate(
      { _id: orderid },
      { $set: { status: status } }
    );
    if (order_update) {
      res.send({ message: "1" });
    } else {
      res.send({ message: "0" });
    }
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

// -------------COUPON PAGE----------
// coupon page for admin where can listsed coupons and offers 
const load_coupon = async (req, res) => {
  try {
    const coupon_data = await Coupon.find({});
    res.render("coupon", { data: coupon_data });
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

// loading addcoupon page for admin where can add new coupon and offers
const load_addcoupon = async (req, res) => {
  try {
    const category = await Category.find({})
    res.render("addcoupon",{category: category});
  } catch (error) {
      res.render('error',{error:error.message})
  }
};

// adding new coupon and offers and saving in the database
const add_coupon = async (req, res) => {
  try {
    console.log(req.body.category);
  console.log( req.body.category);
    const new_coupon = new Coupon({
      couponName: req.body.couponName,
      couponAmount: req.body.couponAmount,
      couponExprieDate: req.body.couponExprieDate,
      minimumAmount: req.body.minimumAmount,
      category: req.body.category,
      couponDescription:req.body.couponDescription
    
    });
    await new_coupon.save();
    res.redirect("/admin/coupon");
  } catch (error) {
      res.render('error',{error:error.message})
  }
};
// ------------------BANNER------------------
// loading banner page when banner is clicked
const load_bannerpage =async(req,res)=>{
try { 
  const Banner_data = await Banner.find({})

  res.render('banner',{banner: Banner_data});
} catch (error) {
    res.render('error',{error:error.message})
}
}
// adding banner deatils and images as array in database
const add_banner =async(req,res)=>{
try {
  const {Description} = req.body
   const Image = req.file
   const name = req.body.name
  const newBanner = new Banner({
    name: name,
    Image : Image.filename,
    Description: Description,
  })
 const banner = await newBanner.save()
 if(banner){
 res.send({message:"banner added"})
 }else{
  res.send({message:"something went worng"})
 }
} catch (error) {
    res.render('error',{error:error.message})
}
}
// this method is for deleting  selected banner by admin
const delete_banner = async(req,res)=>{
try {
  const id = req.query.id;
  if(id){
    const banner_data = await Banner.findByIdAndDelete({_id: id})
    res.send({message: "1"})
  } else{
    res.send({message: "0"})
  }
} catch (error) {
    res.render('error',{error:error.message})
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
  load_order,
  load_coupon,
  add_coupon,
  load_addcoupon,
  order_details,
  status_update,
  list_unlist,
  load_bannerpage,
  add_banner,
  delete_banner,
  get_saledata,
  admin_logout,
  excel_saledata
};
