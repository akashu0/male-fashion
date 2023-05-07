const mongoose = require("mongoose");

const user = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image:{
      type: String,

  },
  address:{
   type: String,
   
  },
  phone: {
    type: Number,
    required: true,
  },
  is_admin: {
    type: Number,
    default:0,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  block:{
    type: Boolean,
    default:false
  }

});

module.exports = mongoose.model("User", user);
