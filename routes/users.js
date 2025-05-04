const express = require("express");
const router = express.Router();
const { isAuthenticated, isUser } = require("../middlewares/authMiddleware");
const Item = require("../models/Item");
const User = require("../models/User");



// GET user page/dashboard
router.get("/", isAuthenticated, isUser, async (req, res) => {
  try {
    const items = await Item.find().lean().populate("contactPerson", "role"); // Fetch all items and populate contactPerson with name

    //view all items in the user page
    res.render("Userdashboard", {
      layout: "users",
      title: "User Dashboard",
      user: req.session.user.username,
      items,
      currentYear: new Date().getFullYear(),
    });
  } catch (err) {
    console.error("Error rendering page:", err);
    res.status(500).json({
      layout: "user",
      error: "Internal Server Error:",
    });
  }
});







module.exports = router;