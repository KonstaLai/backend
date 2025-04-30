const express = require('express');
const router = express.Router();
const { redirectToAdmin } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcrypt');



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


        //redirect to homepage if user is not admin
        redirectToAdmin(req, res, () => {
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ 
            message: 'Internal Server Error' 
        });
    }
});



module.exports = router;