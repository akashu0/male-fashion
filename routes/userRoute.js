const express = require("express");
const user_route = express();
const flash = require('connect-flash')
const bodyParser = require("body-parser");
const session = require('express-session')

const userController = require("../controllers/userController");
const auth = require('../middleware/userauth');


user_route.set("view engine", "ejs");
user_route.set("views", "./views/user");

user_route.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: false
}))

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.use(flash());
user_route.use(express.static("public")); 

user_route.get("/",userController.landing_Page);
user_route.get("/t-shirtpage",userController.tshirt_page)
// User logIn
user_route.get('/login',auth.isLogout,userController.loading_loginpage)
user_route.post('/login',userController.verify_login)

user_route.get('/signup',userController.load_signup);
user_route.post('/register', userController.register_user);

// opt login
user_route.get('/logwithotp',userController.otp_page)
user_route.post('/otppage',userController.opt_singIn);
user_route.get('/otpverify',userController.load_otpverifypage)
user_route.post('/otpverify',userController.otp_verify);

// product page
user_route.get('/productpage',auth.isLogin,userController.load_productpage)
user_route.get('/viewproduct',userController.load_viewproduct)
// route for CART
user_route.get('/cart',userController.load_cart);
user_route.get('/addtocart',userController.add_to_cart);
user_route.get('/decrementproduct',userController.decrement_product);
user_route.get('/incrementproduct',userController.increment_product);
user_route.get('/deletecartitem',userController.delete_cartitem)


// route for wishlist
user_route.get('/whishlist',auth.isLogin,userController.load_whishlist)
user_route.get('/addtowhishlist',userController.add_to_whishlist);
user_route.get('/deletewhishlistitem',userController.delete_wishlist);

// USER PROFILE
user_route.get('/profile',auth.isLogin,userController.load_profile);
user_route.post('/edituserdeatils',userController.edituser_Details);
user_route.post('/addaddress',userController.add_address);
user_route.get('/deleteaddress',userController.delete_address);
user_route.post('/updatepassword',userController.update_password);
user_route.get('/logout',userController.log_out)
// checkout page
user_route.get('/checkout',userController.check_out);
user_route.get('/checkvalidcoupon',userController.checkvalid_Coupon)
// order
user_route.post('/orderdeatils',userController.order_Details);
user_route.get('/cancelorderitem',userController.cancel_oder);
user_route.get('/orderhistory',userController.order_histroy);
user_route.get('/retunorder',userController.return_order);

user_route.get('/onlinepayment',userController.razorpay_method);
user_route.get('/ordersuccess',userController.ordersuccess_page);


module.exports = user_route;
