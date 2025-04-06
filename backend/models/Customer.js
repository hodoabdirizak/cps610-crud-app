const mongoose = require('mongoose');

// Customer schema definition
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: false,
    },
    tier: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('Customer', customerSchema);