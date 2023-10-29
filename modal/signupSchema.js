const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming each cart item is associated with a product
    ref: 'Product', // Reference to the Product model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1, // Default quantity is 1  
  },
});

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  primary: {
    type: Boolean,
    default: false,
  },
});


const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, 
  },
});



const signupschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phonenumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    code: {
      type: String,
    }, 
    expiresAt: {
      type: Date,
    },
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  shoppingCart: {
    items: [cartItemSchema],
  },
  address:[addressSchema],
  wishlist: [wishlistItemSchema],
 
});

const signupcollection = mongoose.model('signupcollection', signupschema);

module.exports = signupcollection;
