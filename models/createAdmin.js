// This is a standalone script to create an admin user in the database if needed
// 



require('dotenv').config({ path: '../.env' }); // Load .env 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const User = require('./User'); 

//config for admin credentials
const ADMIN_USERNAME = 'admin'; 
const ADMIN_EMAIL = 'admin@example.com'; 
const ADMIN_PASSWORD = 'admin1234'; 


// db conn
const dbURI = process.env.MONGO_URI;

// this is to validate connection
if (!dbURI) {
    console.error('❌ Error: MONGO_URI environment variable not found in your .env file.');
    console.error('Please ensure your .env file is correctly set up in the parent directory.');
    process.exit(1); // will exit with error code
}

// establishing connection and inform the script user
async function connectDB() {
    try {
        await mongoose.connect(dbURI);
        console.log('✅ MongoDB Connected successfully for seeding...');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit script if connection fails
    }
}

// this is the main fucntion to create the admin user
async function createAdminUser() {
    try {
        // 1. checkinf if already exists
        const existingAdmin = await User.findOne({
            $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
        });

        if (existingAdmin) {
            console.warn(`⚠️ Admin user already exists (Username: '${existingAdmin.username}', Email: '${existingAdmin.email}'). No action taken.`);
            return; // will exit if exists
        }

        
        // 2. Prepares the admin user object, pw is intentionally as plain text because the user.js should be responsible in hashing
        const adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin' // this force sets the role
        });

        // 3. this will save the user to db
        await adminUser.save();
        console.log('------------------------------------------');
        console.log('✅ Admin user created successfully!');
        console.log(`   Username: ${ADMIN_USERNAME}`);
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Role:     admin`);
        console.log('------------------------------------------');
        console.log('🚀 You can now log in with these credentials.');

    } catch (error) {
        console.error('❌ Error occurred while creating admin user:', error);
    } finally {
        // 4. will confirm that connection is closed
        try {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed.');
        } catch (closeErr) {
            console.error('❌ Error closing MongoDB connection:', closeErr);
        }
        process.exit(0); // exits
    }
}


connectDB().then(() => {
    createAdminUser();
});
