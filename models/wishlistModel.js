const mongoose = require('mongoose');

const whistlistSchema = mongoose.Schema({

  userId: {
    type: String,
    required: true
    
  },
  productId: {
    type: String,
    required: true

  }

});

module.exports = mongoose.model("whislist", whistlistSchema);