// check if user is logged in

const isAuthenticated = (req, res, next) => {
    try {
        if(req.session && req.session.userId) {
            return next();
        }
        res.redirect('/login');
    } catch (error) {
        console.error("Error in isLoggedIn middleware:", error);
        res.status(500).send("Internal Server Error");
    }
}


// check if user is admin
const isAdmin = (req, res, next) => {
    try {
        if(req.session && req.session.user && req.session.user.role === 'admin') {
            return next();
        }
        res.status(403).send("Forbidden: Access Denied.");
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        res.status(500).send("Internal Server Error");
    }
}



module.exports = { isAuthenticated, isAdmin };