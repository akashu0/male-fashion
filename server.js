const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/E");

const express = require("express");
const app = express();



const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");






app.use("/", userRoutes);
app.use("/admin", adminRoutes);

app.listen(3000, () => {  
  console.log("Server started");
});
