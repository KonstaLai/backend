const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');



// GET registration page
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).render('register', { 
                message: 'Please fill in all fields',
                username,
                email 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render('register', { 
                message: 'Passwords do not match',
                username,
                email 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render('register', { 
                message: 'Email already exists',
                username
            });
        }


        // Create new user
        const newUser = new User({
            username,
            email,
            password
        });
        await newUser.save();
        // Redirect to login page after successful registration
        res.redirect('/login');
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).render('register', { 
            message: 'Internal Server Error' 
        });
    }
});











/**
 * 
 * * @description: Login page route
 * * @route: GET /login
 * * @access: Public
 * * @returns: Renders the login page
 * * @throws: 500 Internal Server Error if there's an error rendering the page
 * * * @notes: This route is public and can be accessed by anyone.
 * * * The login page is rendered with a layout of "login".
 */

// POST login page
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email' 
            });
        };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid password' 
            });
        };

        // user session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,    
        };

        req.session.save();

        if (user.role === 'admin') {
            res.redirect('/admin');
        }
        else if (user.role === 'user') {
            res.redirect('/users');
        } else {
            return res.status(403).json({ 
                message: 'You do not have permission to access this page' 
            });
        };
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ 
            message: 'Internal Server Error' 
        });
    }
});



module.exports = router;