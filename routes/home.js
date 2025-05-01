
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');    
const { isAuthenticated } = require('../middlewares/authmiddleware'); 




router.get('/', (req, res) => {
    
    if (req.session.userId) {
        // Redirect based on role stored in session, or to a generic dashboard
        if (req.session.user && req.session.user.role === 'admin') {
             // admins go directly to their dashboard
             return res.redirect('/dashboard'); 
        } else {
             // regular users go to lostitems page
             return res.redirect('/lost-items'); 
        }
    }
    // this gives logged ou users a home page
    res.render('login');
});

// GET /login (Login Page)
router.get('/login', (req, res) => {
    // If user is already logged in, redirect them away from login page
    if (req.session.userId) {
        // Redirect logic similar to GET /
        if (req.session.user && req.session.user.role === 'admin') {
             return res.redirect('/dashboard'); // admin direct
        } else {
             return res.redirect('/lost-items'); //user page direct
        }
    }
    // Render login page for logged-out users
    res.render('login', { errors: null, emailOrUsername: '' }); // Pass null/empty values
});

// GET /register (Registration Page)
router.get('/register', (req, res) => {
    // if log in direct away
   if (req.session.userId) {
        
        if (req.session.user && req.session.user.role === 'admin') {
             return res.redirect('/dashboard'); // admin direct
        } else {
             return res.redirect('/lost-items'); // user page direct
        }
    }
   // rRender login page for logged out
   res.render('/login', { errors: null, username: '', email: '' });
});

// POST /register 
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    let errors = [];

    // --- Validation ---
    if (!username || !email || !password || !confirmPassword) {
        errors.push({ msg: 'Please fill in all fields.' });
    }
    if (password !== confirmPassword) {
        errors.push({ msg: 'Passwords do not match.' });
    }
    if (password && password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters.' });
    }
    

    if (errors.length > 0) {
        return res.status(400).render('register', { errors, username, email });
    }

    // --- logic for registration
    try {
        const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            errors.push({ msg: 'Email or Username already registered.' });
            return res.status(400).render('register', { errors, username, email });
        }

        // creates a new user and defaults role to user
        const newUser = new User({ username, email, password });
        await newUser.save(); // hook for hashing

        console.log('User registered successfully:', newUser.username);
        res.redirect('/login'); // redicrects user to login

    } catch (err) {
        console.error("Registration Database Error:", err);
        errors.push({ msg: 'Something went wrong during registration.' });
        res.status(500).render('register', { errors, username, email });
    }
});

// POST /login Login 
router.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;
    let errors = [];

    if (!emailOrUsername || !password) {
        errors.push({ msg: 'Please enter both email/username and password.' });
        return res.status(400).render('login', { errors, emailOrUsername });
    }

    try {
        // 1. Find user
        const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

        // 2. Check if user exists
        if (!user) {
            console.log('Login failed: User not found for', emailOrUsername);
            errors.push({ msg: 'Invalid Credentials' });
            return res.status(400).render('login', { errors, emailOrUsername });
        }
        console.log('Login attempt: User found:', user.username);

        // 3. Compare password hash
        const isMatch = await bcrypt.compare(password, user.password);

        // 4. Check if passwords match
        if (!isMatch) {
            console.log('Login failed: Password mismatch for user', user.username);
            errors.push({ msg: 'Invalid Credentials' });
            return res.status(400).render('login', { errors, emailOrUsername });
        }

        // --- Login Success ---
        console.log(`Login successful for user: ${user.username}, Role: ${user.role}`);

        // 5. Create session
        req.session.userId = user._id;
        req.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role // Store role 
        };
        console.log('Session created:', req.session);

        // 6. Save session & Redirect BASED ON ROLE
        req.session.save(err => {
            if (err) {
                console.error("Session save error:", err);
                errors.push({ msg: 'Server error during login.' });
                return res.status(500).render('login', { errors, emailOrUsername });
            }

            // === REDIRECT LOGIC ===
            if (user.role === 'admin') {
                console.log(`Redirecting admin user ${user.username} to /admin/found`);
                // Redirect admins to their dashboard 
                res.redirect('/dashboard');
            } else {
                 // Redirect normal users to the lost items page
                console.log(`Redirecting user ${user.username} to /lost-items`);
                res.redirect('/lost-items'); 
            }
            
        });

    } catch (err) {
        console.error("Login Server Error:", err);
        errors.push({ msg: 'An internal server error occurred.' });
        res.status(500).render('login', { errors, emailOrUsername });
    }
});

// GET /lost-items 

router.get('/lost-items', isAuthenticated, async (req, res) => {
    try {
        // Example: Fetch items relevant to the user or all items
        // const items = await Item.find({ status: 'lost' }); // Assuming Item model exists
        res.render('lost-items', {  }); 
    } catch(err) {
        console.error("Error fetching lost items:", err);
        res.status(500).send("Error loading page.");
    }
});

// GET /dashboard 
// different dashboard for user or? this might not be needed if goes straight to lost items page
router.get('/dashboard', isAuthenticated, (req, res) => {
    // Render a generic user dashboard if one exists
    res.render('dashboard', { username: req.session.user.username });
});


// GET /logout (Handle Logout)
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout Error:", err);
            return next(err); // Pass error to Express error handler
        }
        res.clearCookie('connect.sid'); // Optional: Clear the session cookie
        console.log('User logged out, redirecting to login.');
        res.redirect('/login'); // Redirect to login page after logout
    });
});



module.exports = router;
