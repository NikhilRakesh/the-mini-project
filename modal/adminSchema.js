const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,

    },
    password: {
        type: String,
        required: true
    },

});

const Admincollection = new mongoose.model('Admincollection', adminSchema);

module.exports = Admincollection;
