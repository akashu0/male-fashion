const User = require("../models/userModel");
const Category = require('../models/categoryModel')
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Whislist = require('../models/wishlistModel');
const Address = require('../models/addressModel');
const Otp = require('../models/otpmodel');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');





// password decrypt
const securepassword = async (password) => {
  try {

    const passwordHash = await bcryptjs.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message);
  }
}





// ---------------Home PAGE---------

const landing_Page = async (req, res) => {

  try {
    // const user = req.session.user_id

    res.render('home');

  } catch (error) {
    console.log((error.message));
  }

}

// ------LOGIN PAGE---------

const loading_loginpage = async (req, res) => {
  try {

    const title = req.flash('title');
    res.render('login', { title: title[0] || '' })
  } catch (error) {

    console.log(error.message);
  }
}

//-------------- LOGIN VERIFICATION---------

const verify_login = async (req, res) => {

  try {
    const email = req.body.email
    const password = req.body.password

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcryptjs.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.block == true) {
          req.flash('title', "User is unauthorized");
          res.redirect('/login')

        } else {
          req.session.user_id = userData._id;

          res.redirect('/');
        }
      } else {
        req.flash('title', "Email and password invalid")
        res.redirect('/login');
      }
    } else {
      req.flash('title', "user is not found")
      res.redirect('/login');
    }
  } catch (error) {

    console.log(error.message);
  }

}

// -----SIGUP PAGE---------

const load_signup = async (req, res) => {
  try {
    const title = req.flash('title');
    res.render('signup', { title: title[0] || '' });
  } catch (error) {
    console.log(error.message);
  }
}

// insert new user
const register_user = async (req, res) => {

  try {

    const decryptpass = await securepassword(req.body.password);
    const user = new User({


      name: req.body.name,
      email: req.body.email,
      password: decryptpass,
      phone: req.body.phone
    });
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      req.flash('title', 'This email is already exists');
      res.redirect('/signup');
    } else {
      const user_data = await user.save();
      req.flash('title', 'Registration successful. Please log in to continue.');
      res.redirect('/login');
    }

  } catch (error) {
    res.status(400);
    console.log(error.message);

  }
}




// load otp page

const otp_page = async (req, res) => {

  try {

    res.render('otpPage')

  } catch (error) {
    console.log(error.message);
  }


}


// otp sigin page need to check whether user is vaild or not (with phone number)

// const opt_singIn = async (req, res) => {
//   try {
//     console.log("started");
//     const user = req.body.email;
//     const userData = await User.findOne({ email: user });
//     if (userData) {
//       if (userData.block == false) {
//         const OTP = otpGenerator.generate(4, { digits: true, alphabets: false, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
//         const transporter = nodemailer.createTransport({
//           service: 'gmail',
//           auth: {
//             user: 'akash97kulakkada@gmail.com',
//             pass: 'vjtjkomazpfyjwkf'
//           }
//         });

//         var mailOptions = {
//           from: 'akash97kulakkada@gmail.com',
//           to: userData.email,
//           subject: 'OTP VERIFICATION',
//           text: 'PLEASE ENTER THE OTP FOR LOGIN ' + OTP
//         };
//         transporter.sendMail(mailOptions, function (error, info) {
//           if (error) {
//             console.log(error);
//           } else {
//             console.log('Email sent: ' + info.response);
//           }
//         });
//         console.log(OTP);
//         const otp = new Otp({ email: user, otp: OTP });
//         const salt = await bcryptjs.genSalt(10);
//         otp.otp = await bcryptjs.hash(otp.otp, salt);
//         const result = await otp.save();
//         return res.status(200).render('otpverify', { user: userData });
//       } else {
//         res.status(400).redirect("/login", { title: "user is unauthorized" })
//       }
//     } else {
//       // res.status(400).redirect("/login", { title: "user is not found please sig up" })
//       return res.status(400).redirect("/login")
//     }
//   } catch (error) {
//     console.log(error.message);
//   }

// }

const opt_singIn = async (req, res) => {
  try {
    
    console.log(user);
    const userData = await User.findOne({ email: user });
    if (userData) {
      if (userData.block == false) {
        const OTP = otpGenerator.generate(4, { digits: true, alphabets: false, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'akash97kulakkada@gmail.com',
            pass: 'vjtjkomazpfyjwkf'
          }
        });

        var mailOptions = {
          from: 'akash97kulakkada@gmail.com',
          to: userData.email,
          subject: 'OTP VERIFICATION',
          text: 'PLEASE ENTER THE OTP FOR LOGIN ' + OTP
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
            console.log(OTP);
        const otp = new Otp({ email: user, otp: OTP });
        const salt = await bcryptjs.genSalt(10);
        otp.otp = await bcryptjs.hash(otp.otp, salt);
        const result = await otp.save();
        if(result){
          res.status(200).send({ success: true, message: 'OTP sent successfully' });
        }else{
          res.status(400).send({ success: false, message: 'network issues' });
        }
       
      } else {
        // res.status(400).send({ success: false, message: 'User is unauthorized' });
        res.status(400).json({ success: false, message: 'User is unauthorized' })
      }
    } else {
      //  res.status(400).send({ success: false, message: 'User not found. Please sign up.' });
       res.status(400).json({ success: false, message: 'User not found' })
    }
  } catch (error) {
    console.log(error.message);
    //  res.status(500).send({ success: false, message: 'Internal server error.' });
     res.status(400).json({ success: false, message: 'Internal server error' })
  }
}


//  ----OTP verify page----
const load_otpverifypage = async (req, res) => {
  try {
    res.render('otpverify')

  } catch (error) {
    console.log(error.message);
  }
}


const otp_verify = async (req, res) => {
  try {
    const useremail = req.body.email
    const userotp = req.body.otp
    console.log(useremail);
    const otpHolder = await Otp.findOne({ email: useremail })
    if (otpHolder) {
      const validuser = await bcryptjs.compare(userotp, otpHolder.otp);
      if (validuser) return res.status(200).redirect('/')
      else {
        return res.status(400).redirect("/login", { title: "your otp is worng" })
      }
    } else {
      return res.status(400).render("/login", { title: "You used an Expried OTP" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
}

//--------------------------PRODUCT PAGE----------------
// Loading product page with catergory and produtc deatils

const load_productpage = async (req, res) => {
   
  try {
    const send_data = [];
    const catergoryData = await Category.find();
    if (catergoryData.length > 0) {
      for (let i = 0; i < catergoryData.length; i++) {
        const product_data = [];
        const cat_id = catergoryData[i]['_id'].toString();
        const cat_pro = await Product.find({ category_id: cat_id });
        if (cat_pro.length > 0) {
          for (let j = 0; j < cat_pro.length; j++) {
            product_data.push({

              "id": cat_pro[j]['_id'],
              "product_name": cat_pro[j]['productName'],
              "product_color": cat_pro[j]['productColor'],
              "product_size": cat_pro[j]['productSize'],
              "product_price": cat_pro[j]['price'],
              "productDes": cat_pro[j]['productDes'],
              "image": cat_pro[j]['productImage']
            });

          }

        }
        send_data.push({
          "category": catergoryData[i]['categoryName'],
          "product": product_data
        })
       
      }
      // res.status(200).send({ success: true, msg: "product Details", data: send_data });
      res.render('productPage',{data: send_data})
    } else {
      // res.status(200).send({ success: false, msg: "product Deatails", data: send_data });
      res.redirect('/',{msg:" Failed to get product page", data: send_data})
    }
  } catch (error) {
    console.log(error.message);
  }
}


// ----------------CART------------------

// #laad cart page

const load_cart = async(req,res)=>{

  try {
    
    res.render('cart')
    
  } catch (error) {
    console.log(error.message);
  }

}


// #add to cart methode
const add_to_cart = async (req, res) => {

  try {
    const product_id= req.query.id;
    const userId = req.session.user_id
    console.log(product_id);
    console.log( userId );
    const cart_data = new Cart({
      product_id: product_id,
      userId: userId 
    });
    const cartData =  await cart_data.save();
   
    res.send({success:true,msg:"product added to cart", data: cartData})

  } catch (error) {
    console.log(error.message);
  }
}
// --------------#add to whishlist-------------


//  LOADING WHISHLIST PAGE with DEATILS

const load_whishlist = async(req,res)=>{
try {


  res.render('wishlist')
  
} catch (error) {
  console.log(error.message);
}
}



// ------- add to whishlist

const add_to_whishlist = async(req,res)=>{

 try {
  const userId = req.session.user_id;
  const productId = req.query.id;

   const whishlist_data =  new Whislist({
    
      userId: userId,
      productId:  productId
    
     });

   const whishlistData = await whishlist_data.save();
   console.log((whishlistData));
   res.send({success: true,msg:"whishlist details",data:whishlistData})

  
 } catch (error) {
    console.log(error.message);
 }

}


// -------------PROFILE SETUP---------


const load_profile = async(req,res)=>{
 try {
  const userid = req.session.user_id
  
   if(userid !== undefined){
  const user =  await User.findOne({_id: userid});
    res.render('profile',{user: user});
  }else{
    res.redirect('/login');
  }
 } catch (error) {
  console.log(error.message);
 }
}
//#update address or adding multiple address and  get updated document;
const add_address = async(req,res)=>{
 try {
  const data = await Address.findOne({userid: req.body.userid});
  if(data){

    var addaddress=[];
     for(let i =0; i< data.address.length; i++){
       addaddress.push(data.address[i]);
     }
   
     addaddress.push(req.body.address);
    const updated_address = await Address.findOneAndUpdate({userid : req.body.userid },{$set: {address: addaddress}},{returnDocument:"after"})
    res.status(200).send({success:true,msg:"address added",data: updated_address});

  }else{

    const newaddress = new Address({     
        userid : req.body.userid,
        address : req.body.address
    });

    const address_data = await newaddress.save();
     res.status(200).send({success:true,msg:"address added",data: address_data});

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
  add_address
}