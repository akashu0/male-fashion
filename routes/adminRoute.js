const express = require("express");
const admin_route = express();
const multer = require('multer')
const session = require('express-session')
const path = require('path')
const bodyParser = require("body-parser");
// const methodOverride = require('method-override');
const adminController = require("../controllers/admincontoller");
const auth = require('../middleware/adminauth')
admin_route.set("view engine", "ejs");

admin_route.set("views", "./views/admin");


admin_route.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: false
}))

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));
// admin_route.use(express.urlencoded({ extended: true }));
// admin_route.use(methodOverride('_method'));

admin_route.use(express.static("public"));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/upload'), function (err, success) {
            if (err) {
                throw err
            }
        });
    },
    filename: function (req, file, cb) {
        const name = Date.now()+'-' +file.originalname;
        cb(null, name, function (error, success) {
            if (error) {
                throw error
            }
        });
    }
})
const upload = multer({ storage: storage });

admin_route.get("/",auth.isLogout,adminController.login_Page);
admin_route.post("/adminlogin", adminController.verify_login);

admin_route.get("/dashboard",auth.isLogin,adminController.load_dashboard);
admin_route.get("/getSalesData",auth.isLogin,adminController.get_saledata);

// User Management
admin_route.get("/user",auth.isLogin ,adminController.load_users);
// admin_route.post("/adduser",adminController.addUsers);


// admin_route.post("/adduser",adminController.addUsers);
admin_route.post("/block-user",adminController.block_user);
admin_route.post('/unblock-user',adminController.unblock_user);


// Product Management

admin_route.get('/product', adminController.load_productPage);
admin_route.get("/addproduct", adminController.load_addproduct);
admin_route.post('/addproduct', upload.array('productImage'), adminController.add_product);
admin_route.get('/edit-product', adminController.edit_product);
admin_route.post('/edit-product', upload.array('productImage'), adminController.update_product)
admin_route.get('/delete-product',adminController.delete_product)




//------ CATEGORY MANAGEMENT---------

admin_route.get('/category',adminController.category_list);
admin_route.post('/addcategory', adminController.add_category);
admin_route.post('/listandunlist',adminController.list_unlist)  

// admin_route.get('/')


// ---------------BANNER------------
admin_route.get('/banner',adminController.load_bannerpage)
admin_route.post('/addbanner',upload.single('Image'),adminController.add_banner);
admin_route.get('/deletebanner',adminController.delete_banner);


//----------------ORDER-------------
admin_route.get('/order',adminController.load_order)
admin_route.get('/orderdetails',adminController.order_details)
admin_route.post('/statusupdate',adminController.status_update)


// -------------Coupon PAGE----------
admin_route.get('/coupon',adminController.load_coupon)
admin_route.get('/addcoupon',adminController.load_addcoupon);
admin_route.post('/addcoupon',adminController.add_coupon)



module.exports = admin_route;
