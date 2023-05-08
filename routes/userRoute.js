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
// User logIn
user_route.get('/login',auth.isLogout,userController.loading_loginpage)
user_route.post('/login',userController.verify_login)

// user_route.get('/signup',userController.load_signup);
user_route.post('/register', userController.register_user);

// opt login
// user_route.get('/logwithotp',userController.otp_page)
user_route.post('/otppage',userController.opt_singIn);
// user_route.get('/otpverify',userController.load_otpverifypage)
user_route.post('/otpverify',userController.otp_verify);

// product page
user_route.get('/productpage',auth.isLogin,userController.load_productpage)
// route for CART
user_route.get('/cart',auth.isLogin,userController.load_cart);
user_route.get('/addtocart',auth.isLogin,userController.add_to_cart);


// route for whishlist
user_route.get('/whishlist',userController.load_whishlist)
user_route.get('/addtowhishlist',userController.add_to_whishlist);

// USER PROFILE

user_route.get('/profile',auth.isLogin,userController.load_profile);
//#address route
user_route.post('/addaddress',userController.add_address);
user_route.get('/deleteaddress',userController.delete_address);
// #update_user_password
user_route.post('/update-password',userController.update_password);



module.exports = user_route;
