const { isAuthenticated, isAdmin } = require("../middlewares/authmiddleware");
const express = require("express");
const router = express.Router();
const item = require("../models/item");

// GET admin page/dashboard
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const items = item.find();

    //view all items in the admin page
    res.render("admindashboard", {
      items: items,
    });
  } catch (err) {
    console.error("Error rendering page:", err);
    res.status(500).json({
      error: "Internal Server Error:",
    });
  }
});

// Admin add new item
router.post("/items/add", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description, category, location, status, image } = req.body;
    const newItem = new item({
      name,
      description,
      category,
      location,
      status,
      image,
      contactPerson: req.user._id,
    });
    await newItem.save();
    res.redirect("/items");
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});





module.exports = router;