const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    image: String,
    category: {
        type: String,
        enum: ['Electronics', 'Clothing', 'Accessories', 'Books', 'Other'],
        required: true,
    },
    location: String,
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Lost', 'Found'],
        required: true,
    },
    contactPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    }, { timestamps: true});

//Automatically set contact person to an admin user
itemSchema.pre('save', async function(next) {
    if (!this.contactPerson) {
        const adminUser = await mongoose.model('User').findOne({ role: 'admin' });
        if (adminUser) {
            this.contactPerson = adminUser._id;
        }
    }
    next(); 
});

module.exports = mongoose.model('Item', itemSchema);
