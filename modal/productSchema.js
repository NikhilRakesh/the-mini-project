const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, 
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  imageUrl:[{
    type: String,
    required: true,
  }] ,
  rating: {
    type: Number, 
    min: 0, 
    max: 5, 
    default: 0, 
  },
  list: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    min: 0,
  }
 
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
