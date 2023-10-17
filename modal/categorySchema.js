const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures category names are unique
  },
 
  // You can add more fields specific to your category here
});

// Create a Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
