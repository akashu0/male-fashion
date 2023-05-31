const express = require("express");
const admin_route = express();
const multer = require('multer')
const session = require('express-session')
const path = require('path')
const bodyParser = require("body-parser");
const nocache = require('nocache');
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

admin_route.use(nocache());

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

const adminController = require("../controllers/admincontoller");


admin_route.get("/",auth.isLogout,adminController.login_Page);
admin_route.post("/adminlogin", adminController.verify_login);

// adminlogout
admin_route.get("/adminlogout",auth.isLogin,adminController.admin_logout);

// admin Dashboard
admin_route.get("/dashboard",auth.isLogin,adminController.load_dashboard);
admin_route.get("/getSalesData",auth.isLogin,adminController.get_saledata);
admin_route.get("/ExcelSalesData",auth.isLogin,adminController.excel_saledata);

// User Management
admin_route.get("/user",auth.isLogin ,adminController.load_users);


// admin_route.post("/adduser",adminController.addUsers);
admin_route.post("/block-user",auth.isLogin ,adminController.block_user);
admin_route.post('/unblock-user',auth.isLogin ,adminController.unblock_user);


// Product Management

admin_route.get('/product',auth.isLogin , adminController.load_productPage);
admin_route.get("/addproduct",auth.isLogin , adminController.load_addproduct);
admin_route.post('/addproduct',auth.isLogin , upload.array('productImage'), adminController.add_product);
admin_route.get('/edit-product',auth.isLogin , adminController.edit_product);
admin_route.post('/edit-product',auth.isLogin , upload.array('productImage'), adminController.update_product)
admin_route.get('/delete-product',auth.isLogin ,adminController.delete_product)




//------ CATEGORY MANAGEMENT---------

admin_route.get('/category',auth.isLogin ,adminController.category_list);
admin_route.post('/addcategory',auth.isLogin , adminController.add_category);
admin_route.post('/listandunlist',auth.isLogin ,adminController.list_unlist)  

// admin_route.get('/')


// ---------------BANNER------------
admin_route.get('/banner',auth.isLogin ,adminController.load_bannerpage)
admin_route.post('/addbanner',auth.isLogin ,upload.single('Image'),adminController.add_banner);
admin_route.get('/deletebanner',auth.isLogin ,adminController.delete_banner);


//----------------ORDER-------------
admin_route.get('/order',auth.isLogin ,adminController.load_order)
admin_route.get('/orderdetails',auth.isLogin ,adminController.order_details)
admin_route.post('/statusupdate',auth.isLogin ,adminController.status_update)


// -------------Coupon PAGE----------
admin_route.get('/coupon',auth.isLogin ,adminController.load_coupon)
admin_route.get('/addcoupon',auth.isLogin ,adminController.load_addcoupon);
admin_route.post('/addcoupon',auth.isLogin ,adminController.add_coupon)



module.exports = admin_route;
