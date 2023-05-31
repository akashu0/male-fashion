require("dotenv").config();

// mongodb connection start
const mongoose = require("mongoose");
  mongoose.connect(process.env.dbconnect,{ useNewUrlParser: true })
      .then((response) => {
          console.log("database connected successfully......");
      })
      .catch((err) => {
          console.log(err);
      })


// db connection end 


const express = require("express");
const app = express();



const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");






app.use("/", userRoutes);
app.use("/admin", adminRoutes);

app.listen(3000, () => {  
  console.log("Server started");
});
