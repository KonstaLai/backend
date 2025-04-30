// check if user is logged in

const isAuthenticated = (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      return next();
    }
    // Redirect to login page if not authenticated
    res.redirect("/login");
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    res.status(500).send("Internal Server Error in middleware");
  }
};

// check if user is admin
const isAdmin = (req, res, next) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      return next();
    }
    // Redirect to home page if not admin
    res.status(403).send("Admin access required.");
  } catch (error) {
    console.error("Admin check error:", error);
  }
};

//redirect to admin page if user is admin

const redirectToAdmin = (req, res, next) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      return res.redirect("/admin");
    }
    next();
  } catch (error) {
    console.error("Error in redirectToAdmin middleware:", error);
    res.status(500).send("Internal Server Error in middleware");
  }
};

module.exports = { isAuthenticated, isAdmin, redirectToAdmin };
