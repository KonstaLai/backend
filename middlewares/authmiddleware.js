// Check if user is logged in
const isAuthenticated = (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }
    res.redirect("/login");
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    res.status(500).send("Internal Server Error in middleware");
  }
};

// Check if user is an admin
const isAdmin = (req, res, next) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      return next();
    }
    res.status(403).send("Admin access required.");
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).send("Internal Server Error in middleware");
  }
};

// Check if user is a regular user
const isUser = (req, res, next) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "user") {
      return next();
    }
    res.status(403).send("User access required.");
  } catch (error) {
    console.error("User check error:", error);
    res.status(500).send("Internal Server Error in middleware");
  }
};



module.exports = {
  isAuthenticated,
  isAdmin,
  isUser,
};