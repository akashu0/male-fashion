require("dotenv").config();

// mongodb connection start
const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URL)
      .then((response) => {
          console.log("database connected successfully......");
      })
      .catch((err) => {
          console.log(err);
      })


// db connection end 


const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000

app.use(express.static("public")); 


app.set("view engine", "ejs");
app.set("views", "./views/user");


const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");






app.use("/", userRoutes);
app.use("/admin", adminRoutes);

app.get('*',(req,res)=>{
      res.render('error',{error})
  })

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => {  
  console.log("Server started");
});
