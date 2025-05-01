// createAdmin.js
// Standalone script to create an initial admin user in the database.
// IMPORTANT: This script assumes it is located inside the 'models' folder.
// Run this script once using 'node models/createAdmin.js' from the 'backend' directory.

// --- Dependencies ---
require('dotenv').config({ path: '../.env' }); // Load .env from parent directory
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Ensure this matches the bcrypt library used in your main app
const User = require('./User'); // *** FIXED: Correct path to User model in the same directory ***

// --- Configuration ---
// Set the desired credentials for your initial admin account
const ADMIN_USERNAME = 'admin'; // Or choose a different admin username
const ADMIN_EMAIL = 'admin@example.com'; // Use a valid email
const ADMIN_PASSWORD = 'admin1234'; // *** CHANGE THIS TO A SECURE PASSWORD ***
// --- End Configuration ---

// --- Database Connection ---
const dbURI = process.env.MONGO_URI;

// Validate database connection string
if (!dbURI) {
    console.error('❌ Error: MONGO_URI environment variable not found in your .env file.');
    console.error('Please ensure your .env file is correctly set up in the parent directory.');
    process.exit(1); // Exit script with an error code
}

// Function to establish database connection
async function connectDB() {
    try {
        await mongoose.connect(dbURI);
        console.log('✅ MongoDB Connected successfully for seeding...');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit script if connection fails
    }
}

// --- Main Function to Create Admin User ---
async function createAdminUser() {
    try {
        // 1. Check if an admin user already exists (by unique username or email)
        const existingAdmin = await User.findOne({
            $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
        });

        if (existingAdmin) {
            console.warn(`⚠️ Admin user already exists (Username: '${existingAdmin.username}', Email: '${existingAdmin.email}'). No action taken.`);
            return; // Exit the function if admin already exists
        }

        // 2. Prepare the new admin user object
        // Note: The password is intentionally passed as plain text here.
        // The 'pre-save' hook defined in the User model (User.js)
        // is responsible for hashing it before it's saved to the database.
        const adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin' // Explicitly set the role
        });

        // 3. Save the new admin user to the database (triggers hashing)
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
        // 4. Ensure the database connection is closed gracefully
        try {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed.');
        } catch (closeErr) {
            console.error('❌ Error closing MongoDB connection:', closeErr);
        }
        process.exit(0); // Exit the script
    }
}

// --- Script Execution ---
// Connect to the database first, then attempt to create the admin user.
connectDB().then(() => {
    createAdminUser();
});
