// check if user is logged in

const isAuthenticated = (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      return next();
    }
    res.render("dashboard"); // Redirect to login page if not authenticated
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    res.status(500).send("Internal Server Error");
  }
};

// check if user is admin
const isAdmin = (req, res, next) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
        // res.redirect("/admin/");
      return next();
    }
     // Redirect to home page if not admin
    res.status(403).send("Forbidden: Access Denied.");
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { isAuthenticated, isAdmin };
