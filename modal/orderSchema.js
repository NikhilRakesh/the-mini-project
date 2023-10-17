const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'signupcollection', 
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    products: [
        {
            productName: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            imageUrl:[{
                type: String,
                required: true,
              }] ,
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    status: {
        type:String,
        default:'pending'
    }
    // You can add more fields specific to orders here
});

module.exports = mongoose.model('Order', orderSchema);
