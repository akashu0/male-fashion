const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Whislist = require("../models/wishlistModel");
const Address = require("../models/addressModel");
const Otp = require("../models/otpmodel");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const mongoose = require("mongoose");

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
    // const user = req.session.user_id
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

// ------LOGIN PAGE---------

const loading_loginpage = async (req, res) => {
  try {
    const title = req.flash("title");
    res.render("login", { title: title[0] || "" });
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

    res.render("signup");
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

const load_productpage = async (req, res) => {
  try {
    const send_data = [];
    const catergoryData = await Category.find();
    if (catergoryData.length > 0) {
      for (let i = 0; i < catergoryData.length; i++) {
        const product_data = [];
        const cat_id = catergoryData[i]["_id"].toString();
        const cat_pro = await Product.find({ category_id: cat_id });
        if (cat_pro.length > 0) {
          for (let j = 0; j < cat_pro.length; j++) {
            product_data.push({
              id: cat_pro[j]["_id"],
              product_name: cat_pro[j]["productName"],
              product_color: cat_pro[j]["productColor"],
              product_size: cat_pro[j]["productSize"],
              product_price: cat_pro[j]["price"],
              productDes: cat_pro[j]["productDes"],
              image: cat_pro[j]["productImage"],
            });
          }
        }
        send_data.push({
          category: catergoryData[i]["categoryName"],
          product: product_data,
        });
      }
      res.render("productPage", { data: send_data });
    } else {
     
      res.redirect("/", {
        msg: " Failed to get product page",
        data: send_data,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// VIEWPRODUCT PAGE
const load_viewproduct = async (req, res) => {
  try {
    const productid = req.query.id;
    const productdata = await Product.findById({ _id: productid });

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
    const cartData = await Cart.findOne({ userId: userid }).populate(
      "product.product_id"
    );
    if (cartData) {
      res.render("cart", { cart: cartData });
    } else {
      res.render("cart", { message: "Cart is empty plz shop" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// #add to cart methode
const add_to_cart = async (req, res) => {
  try {
    const product_id = req.query.id;
    const userId = req.session.user_id;
    const cart_data = await Cart.updateOne(
      { userId: userId },
      { $push: { product: { product_id } } },
      { upsert: true }
    );
    res.send({ success: true, msg: "product added to cart", data: cart_data });
  } catch (error) {
    console.log(error.message);
  }
};
// --------------#add to whishlist-------------

//  LOADING WHISHLIST PAGE with DEATILS

const load_whishlist = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const wishlist = await Whislist.findOne({ userId: userid }).populate( "product.product_id");
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

    console.log(product_id);
    const wish_data = await Whislist.updateOne(
      { userId: userId },
      { $push: { product: { product_id } } },
      { upsert: true }
    );
    res.send({
      success: true,
      msg: "product added to whishlist",
      data: wish_data,
    });
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
      // res.status(200).send({success: true,msg:"success",data: user});
      res.render("profile", { user: user });
    } else {
      res.redirect("/login");
      // res.status(400).send({success: false,msg:error.message});
    }
  } catch (error) {
    console.log(error.message);
  }
};
//#update address or adding multiple address and  get updated document;
const add_address = async (req, res) => {
  //  try {
  //   const data = await Address.findOne({userid: req.body.userid});
  //   if(data){
  //     var addaddress=[];
  //      for(let i =0; i< data.address.length; i++){
  //        addaddress.push(data.address[i]);

  //      }

  //      addaddress.push(req.body.address);
  //     const updated_address = await Address.findOneAndUpdate({userid : req.body.userid },{$set: {address: addaddress}},{returnDocument:"after"})
  //     res.status(200).send({success:true,msg:"address added",data: updated_address});

  //   }else{

  //     const newaddress = new Address({
  //         userid : req.body.userid,
  //         address : req.body.address
  //     });

  //     const address_data = await newaddress.save();
  //      res.status(200).send({success:true,msg:"address added",data: address_data});

  //   }
  //  } catch (error) {
  //   console.log(error.message);
  //  }

  try {
    const userdata = await Address.findOne({ userid: req.session.user_id });
    if (userdata) {
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
      //  res.status(200).send({success: true,msg:"address add",data: addaddress});
      res.status(200).redirect("/profile");
    }
  } catch (error) {
    // res.status(500).send({suucess: false, msg: error.message})
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
    console.log(password);
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
const check_out = async (req, res) => {
  try {
    const userid = req.session.user_id;
    // const toobject = new mongoose.Types.ObjectId(userid)
    const address = await Address.find({ userid: userid });

    res.render("checkout", { user: address });
  } catch (error) {
    console.log(error.message);
  }
};

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
};
