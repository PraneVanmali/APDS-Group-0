const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        idNumber: {
            type: String,
            required: true, 
            unique: true
        },
        accountNumber: {
            type: String,
            required: true, 
            unique: true
        },
        username: {
            type: String, 
            required: true, 
            unique: true
        },
        passwordHash: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    }
)

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;