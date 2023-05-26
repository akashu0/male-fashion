const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishlistModel");
const Coupon = require("../models/couponModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const Banner = require("../models/banner");
const Otp = require("../models/otpmodel");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const mongoose = require("mongoose");
const Razorpay =require('razorpay');

// password decrypt
const securepassword = async (password) => {
  try {
    const passwordHash = await bcryptjs.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// ---------------Home PAGE---------

const landing_Page = async (req, res) => {
  try {
    const banner = await Banner.find({})
    const product = await Product.find({})
    res.render("home",{banner: banner,product: product});
  } catch (error) {
    console.log(error.message);
  }
};

// catergory product page only

const tshirt_page = async(req,res)=>{
try {
  const catergory_name = req.query.id
  console.log(catergory_name);
 const category_data = await Category.findOne({ categoryName: catergory_name})
if(category_data){
  const cat_id = category_data._id
  const category_details = await Product.find({category_id: cat_id})
  if (category_details) {
    res.render('categorypage',{category: category_details});
  }else{
    res.redirect('/')
  }
}else{
  res.redirect('/')
}
} catch (error) {
  console.log(error.message);
}

} 

// ------LOGIN PAGE---------

const loading_loginpage = async (req, res) => {
  try {
    const title = req.flash("title");
    res.render("login", { title: title[0] || "" ,});
  } catch (error) {
    console.log(error.message);
  }
};

//-------------- LOGIN VERIFICATION---------

const verify_login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcryptjs.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.block == true) {
          req.flash("title", "User is unauthorized");
          res.redirect("/login");
        } else {
          req.session.user_id = userData._id;

          res.redirect("/");
        }
      } else {
        req.flash("title", "Email and password invalid");
        res.redirect("/login");
      }
    } else {
      req.flash("title", "user is not found");
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// -----SIGUP PAGE---------

const load_signup = async (req, res) => {
  try {
    const title = req.flash("title");
    res.render("signup",{ title: title[0] || "" ,});
  } catch (error) {
    console.log(error.message);
  }
};

// insert new user

const register_user = async (req, res) => {
  try {
    const decryptpass = await securepassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: decryptpass,
      phone: req.body.phone,
    });
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      req.flash("title", "User is already exists");
      res.redirect("/signup");
    } else {
      const user_data = await user.save();
      req.flash("title", "please enter username $ password");
      res.redirect("/login");
    }
  } catch (error) {
    res.status(400);
    console.log(error.message);
  }
};

// load otp page

const otp_page = async (req, res) => {
  try {
    const title = req.flash("title");
    res.render("otppage", { title: title[0] || "" });
  } catch (error) {
    console.log(error.message);
  }
};

// otp sigin page need to check whether user is vaild or not (with email)

const opt_singIn = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      if (userData.block == false) {
        const OTP = otpGenerator.generate(4, {
          digits: true,
          alphabets: false,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "akash97kulakkada@gmail.com",
            pass: "vjtjkomazpfyjwkf",
          },
        });
        var mailOptions = {
          from: "akash97kulakkada@gmail.com",
          to: userData.email,
          subject: "OTP VERIFICATION",
          text: "PLEASE ENTER THE OTP FOR LOGIN " + OTP,
        };
        transporter.sendMail(mailOptions, function (error, info) {});
        console.log(OTP);
        const otp = new Otp({ email: req.body.email, otp: OTP });
        const salt = await bcryptjs.genSalt(10);
        otp.otp = await bcryptjs.hash(otp.otp, salt);
        const result = await otp.save();

        res.render("otpverify", { data: result });
      } else {
        req.flash("title", "User is already exists");
        res.redirect("/logwithotp");
      }
    } else {
      req.flash("title", "User is not found");
      res.redirect("/logwithotp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  ----OTP ver page----
const load_otpverifypage = async (req, res) => {
  try {
    const title = req.flash("title");
    res.render("otpverify", { title: title[0] || "" });
  } catch (error) {
    console.log(error.message);
  }
};

// verifying otp
const otp_verify = async (req, res) => {
  try {
    const useremail = req.body.email;

    const userotp = req.body.otp;
    console.log(userotp);
    const otpHolder = await Otp.findOne({ email: useremail });
    console.log(otpHolder);
    if (otpHolder) {
      const validuser = await bcryptjs.compare(userotp, otpHolder.otp);

      if (validuser) {
        req.session.userid = req.body.email;
        res.render("home");
      } else {
        console.log("otp wg");
        req.flash("title", "your otp is worng");
        res.redirect("/logwithotp");
      }
    } else {
      console.log("expire");
      req.flash("title", "You used an Expried OTP");
      res.redirect("/logwithotp");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Server Error" });
  }
};

//--------------------------PRODUCT PAGE----------------
// Loading product page with catergory and produtc deatils

// const load_productpage = async (req, res) => {
//   try {
//     const send_data = [];
//     const catergoryData = await Category.find();
//     if (catergoryData.length > 0) {
//       for (let i = 0; i < catergoryData.length; i++) {
//         const product_data = [];
//         const cat_id = catergoryData[i]["_id"].toString();
//         const cat_pro = await Product.find({ category_id: cat_id });
//         if (cat_pro.length > 0) {
//           for (let j = 0; j < cat_pro.length; j++) {
//             product_data.push({
//               id: cat_pro[j]["_id"],
//               product_name: cat_pro[j]["productName"],
//               product_color: cat_pro[j]["productColor"],
//               product_size: cat_pro[j]["productSize"],
//               product_price: cat_pro[j]["price"],
//               productDes: cat_pro[j]["productDes"],
//               image: cat_pro[j]["productImage"],
//             });
//           }
//         }
//         send_data.push({
//           category: catergoryData[i]["categoryName"],
//           product: product_data,
//         });
//       }
//       res.render("productPage", { data: send_data });
      
//     } else {
//       res.redirect("/", {
//         msg: " Failed to get product page",
//         data: send_data,
//       });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// all product is loading in a single page with category details
const load_productpage = async(req,res)=>{

  try {
    var page = 1;
    if(req.query.page){
     page = req.query.page
    }
    const limit = 4;

    const product_data = await Product.find({}).populate('category_id').limit(limit * 1).skip((page - 1) * limit).exec();
    const count = await Product.find({}).populate('category_id').countDocuments();

    if(product_data){
     res.render('product',{product: product_data, totalpage : Math.ceil(count/limit), currentpage: page});
    }else{
    res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
  
}

// VIEWPRODUCT PAGE
const load_viewproduct = async (req, res) => {
  try {
    const productid = req.query.id;
    const productdata = await Product.findById({ _id: productid }).populate('category_id');
    res.render("viewproduct", { data: productdata });
  } catch (error) {
    console.log(error.message);
  }
};

// ----------------CART------------------

// #laad cart page

const load_cart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    // const userid = req.body.user_id;
    const cartData = await Cart.findOne({ userId: userid }).populate(
      "product.product_id"
    );
    if (cartData) {
      res.render("cart", { cart: cartData });
    } else {
      res.render("cart", { message: "Cart is empty plz shop"});
    }
  } catch (error) {
    console.log(error.message);
  }
};

// #add to cart methode
const add_to_cart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const product_id = req.query.id;
    const finduserincart = await Cart.findOne({ userId: userId });
    if (finduserincart) {
      const productindex = finduserincart.product.findIndex((product) => {
        // console.log('true or false', new String(product.product_id ).trim() == new String(product_id).trim());
        return (
          new String(product.product_id).trim() == new String(product_id).trim()
        );
      });
      if (productindex == -1) {
        const cart_data = await Cart.updateOne(
          { userId: userId },
          { $push: { product: { product_id } } },
          { upsert: true }
        );
        res.send({
          success: true,
          msg: "product added to cart",
          data: cart_data,
        });
      } else {
        res.send({ message: "1" }); //already added the product in cart
      }
    } else {
      const updatecart = new Cart({
        userId: userId,
        product: { product_id },
      });
      const data = await updatecart.save();
      res.send({ mes: "added", data: data });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// In cart with incrementing the product number of quantity also saving the number in database with each ajax call
const increment_product = async (req, res) => {
  try {
    const prodid = req.query.id;
    const checkQuatity = await Product.findById({ _id: prodid });
    const incr = checkQuatity.isselected + 1;
    if (checkQuatity.productQuantity >= incr) {
      const productupdate = await Product.updateOne(
        { _id: prodid },
        { $inc: { isselected: 1 } }
      );
      res.send({ message: "1" });
    } else {
      res.send({ message: "0" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const decrement_product = async (req, res) => {
  try {
    const prodid = req.query.id;
    console.log(prodid);
    const userid = req.body.userid;
    const productupdate = await Product.updateOne(
      { _id: prodid },
      { $inc: { isselected: -1 } }
    );
    res.send({ message: "1" });
  } catch (error) {
    console.log(error.message);
  }
};
// delete item from the cart
const delete_cartitem = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productid = req.query.id;
    const cartitem = await Cart.findOne({ userId: userId });
    const productindex = cartitem.product.findIndex((product) => {
      return (
        new String(product.product_id).trim() == new String(productid).trim()
      );
    });
    if (productindex !== -1) {
      cartitem.product.splice(productindex, 1);
      await cartitem.save();
      res.send({ message: "1" });
    } else {
      res.send({ message: "0" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// --------------#add to whishlist-------------

//  LOADING WHISHLIST PAGE with DEATILS

const load_whishlist = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const wishlist = await Wishlist.findOne({ userId: userid }).populate(
      "product.product_id"
    );
    if (wishlist) {
      res.render("wishlist", { wishlist: wishlist });
    } else {
      res.render("wishlist", { wishlist: "Wishlist is empty plz shop" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ------- add to whishlist

const add_to_whishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const product_id = req.query.id;
    const finduserinwishliist = await Wishlist.findOne({ userId: userId });
    if (finduserinwishliist) {
      const productindex = finduserinwishliist.product.findIndex((product) => {
        // console.log('true or false', new String(product.product_id ).trim() == new String(product_id).trim());
        return (
          new String(product.product_id).trim() == new String(product_id).trim()
        );
      });
      if (productindex == -1) {
        const wish_data = await Wishlist.updateOne(
          { userId: userId },
          { $push: { product: { product_id } } },
          { upsert: true }
        );
        res.send({
          success: true,
          msg: "product added to cart",
          data: wish_data,
        });
      } else {
        res.send({ message: "1" }); //already added the product in wishlist
      }
    } else {
      const updatewishlist = new Wishlist({
        userId: userId,
        product: { product_id },
      });
      const data = await updatewishlist.save();
      res.send({ mes: "added", data: data });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const delete_wishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productid = req.query.id;
    const wishitem = await Wishlist.findOne({ userId: userId });
    const productindex = wishitem.product.findIndex((product) => {
      return (
        new String(product.product_id).trim() == new String(productid).trim()
      );
    });
    if (productindex !== -1) {
      wishitem.product.splice(productindex, 1);
      await wishitem.save();
      res.send({ message: "1" });
    } else {
      res.send({ message: "0" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// -------------PROFILE SETUP---------

const load_profile = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const idobject = new mongoose.Types.ObjectId(userid);
    if (userid !== undefined) {
      const user = await User.aggregate([
        {
          $match: {
            _id: idobject,
          },
        },
        {
          $lookup: {
            from: "addres",
            localField: "_id",
            foreignField: "userid",
            as: "address_details",
          },
        },
      ]);

      const order_details = await Order.find({ userId: userid })
        .populate("product.product_id")
        .populate("address")
        .exec();
      res.render("profile", { user: user, order: order_details });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const edituser_Details = async(req,res)=>{
try {
  const userId = req.session.user_id;
  const update_user = await User.findByIdAndUpdate({_id: userId},{ $set:{name: req.body.name,email: req.body.email, phone: req.body.phone}})
  if(update_user){
    res.send({message:'1'})
  }else{
    res.send({message:'0'})
  }
} catch (error) {
  console.log(error.message);
}
}



//#update address or adding multiple address and  get updated document;
const add_address = async (req, res) => {
  const userId = req.session.user_id;
  try {
    const userdata = await Address.findOne({ userId: userId });
    if (userdata) {
      const address = new Address({
        userId: userId,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        country: req.body.country,
        landmark: req.body.landmark,
        zipcode: req.body.zipcode,
      });
      const addaddress = await address.save();
      // res.status(200).send({success: true,msg:"address add",data: addaddress});
      res.status(200).redirect("/profile");
    } else {
      const address = new Address({
        userid: req.session.user_id,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        country: req.body.country,
        landmark: req.body.landmark,
        zipcode: req.body.zipcode,
      });
      const addaddress = await address.save();
      res.status(200).redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
  }
};
// #DELETE ADDRESS
const delete_address = async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete({ _id: req.query.id });
    res.send({ success: true, message: "Address is deleted" });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .send({ success: false, message: "Have some network issue" });
  }
};
// #UPDATE USER PASSWORD
const update_password = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const password = req.body.password;
    const userdata = await User.findOne({ _id: userid });
    if (userdata) {
      const newpassword = await securepassword(password);
      const userData = await User.findByIdAndUpdate(
        { _id: userid },
        { $set: { password: newpassword } }
      );
      res.send({ success: true, message: "Your password has been updated" });
    } else {
      res.send({ success: false, message: "User is not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  LOGOUT

const log_out = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
// ------------checkout ------------
const   check_out = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const cart = await Cart.find({ userId: userid }).populate(
      "product.product_id"
    );
    const address = await Address.find({ userid: userid });
    const coupon = await Coupon.find({});
    // res.render("checkout", { user: address, cart: cart });
    res.render("checkout", { user: address, cart: cart ,coupon: coupon});
  } catch (error) {
    console.log(error.message);
  }
};
// checking for user enter coupon is valid or not
const checkvalid_Coupon = async (req, res) => {
  try {
    const couponCode = req.query.id;
    const coupon = await Coupon.findOne({ couponName: couponCode });
    if (coupon) {
      res.json({ message: "1", coupon: coupon });
    } else {

      res.send({ message: "Coupon code invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// -------------------ORDER-------------
const order_Details = async (req, res) => {
  try {
    const userId = req.session.user_id;
    //  const userId = req.body.userid
    const method = req.body.paymentmethod;
    const couponAmount = req.body.discount;
    const totalAmount = parseInt(req.body.purchase);
    const itemquantity = req.body.itemquantity;
    const address = req.body.address;
    const categoryId = req.body.categoryId;
    const productdeatils = await Cart.findOne({ userId: userId });
    const productIds = productdeatils.product.map(function (item) {
      return item.product_id;
    });
    const order_details = new Order({
      userId: userId,
      total: totalAmount,
      coupon: couponAmount,
      address: address,
      paymentMethod: method,
      itemquantity: itemquantity,
      category_id: categoryId,
    });

    // Push each product ID to the product field of the order
    for (const productId of productIds) {
      order_details.product.push({
        product_id: productId,
      });
    }
    const data = await order_details.save();
    if (data) {
      res.send({ message: "1", send: data });
    } else {
      res.send({ message: "0", send: data });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// user  cancelling the one order or particular product
const cancel_oder = async (req, res) => {
  const orderid = req.query.id;
  if(orderid){
    const orderitem = await Order.findByIdAndUpdate(
      { _id: orderid },
      { $set: { status: "Cancelled" } }
    );
    res.send({message: "1"}) // if orderstatus is updated sending ajax responce to fronted 
  }else{
    res.send({message: "0"}) // if orderstatus is updated send message 0 as string.message will shown to user by sweet_alert
  }
  
};
// viewing orderhistory(purchased item from cart) and details
const order_histroy = async (req, res) => {
  try {
    const orderid = req.query.id;
    const order_Details = await Order.findById({ _id: orderid })
      .populate("product.product_id")
      .populate("address")
      .exec();
    if (order_Details) {
      res.render("orderhistory", { order: order_Details });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// for online payement through razorpayment and loading the page
const razorpay_method = async(req,res)=>{
try {
  const orderid = req.query.id
  const order_data = await Order.findById({_id: orderid}).populate('address').populate('product.product_id')
if(order_data){
  const amount = order_data.total
  var instance = new Razorpay({ key_id: 'rzp_test_9zuaMGnBpzoHQX', key_secret: 'wFBPfR1miTW0y7beeh8DWXLs' })
 const order = await instance.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt#1",
  })
  res.render('razorpy',{order: order_data,payorder: order,amount: amount});
}else{
res.redirect('/checkout')
}
} catch (error) {
  console.log(error.message);
}
}
// after online payment succes page
const ordersuccess_page = async(req,res)=>{
try {
  res.render('paymentsuccess')
} catch (error) {
  console.log(error.message);
}
}
// After receving the peoduct user want to return the product 
const return_order = async(req,res)=>{
try {
  
const orderid = req.query.id
console.log(orderid);
const order_update = await Order.findByIdAndUpdate(
  { _id: orderid },
  { $set: { status: "Return" } }
);
if (order_update) {
  res.send({ message: "1" });
} else {
  res.send({ message: "0" });
}

} catch (error) {
  console.log(error.message);
}
}





module.exports = {
  register_user,
  landing_Page,
  verify_login,
  loading_loginpage,
  opt_singIn,
  otp_verify,
  otp_page,
  load_otpverifypage,
  load_signup,
  load_productpage,
  add_to_cart,
  add_to_whishlist,
  load_cart,
  load_whishlist,
  load_profile,
  add_address,
  delete_address,
  update_password,
  log_out,
  check_out,
  load_viewproduct,
  decrement_product,
  increment_product,
  delete_cartitem,
  checkvalid_Coupon,
  order_Details,
  cancel_oder,
  order_histroy,
  razorpay_method,
  tshirt_page ,
  delete_wishlist,
  ordersuccess_page,
  return_order,
  edituser_Details
  
};
