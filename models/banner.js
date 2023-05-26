const mongoose= require('mongoose');



const bannerSchema = mongoose.Schema({


name:{
type:String,
required:true
},
Image:{
    type: String,
    required: true,
    
},
Description:{
    type:String,
    required:true
},
status:{
    type: String,
    default:true
}

})


module.exports = mongoose.model("banner",bannerSchema)