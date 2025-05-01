const { isAuthenticated, isAdmin } = require("../middlewares/authmiddleware");
const express = require("express");
const router = express.Router();
const item = require("../models/Item");

// GET admin page/dashboard
router.get("/found", async (req, res) => {
  try {
    const Item = await item.find();

    //view all items in the admin page
    res.render("dashboard", {
      title: "Admin Dashboard",
      items: Item,
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
    res.redirect("/items"); // show all items after adding a new one
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Admin update item
router.post("/items/update/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description, category, location, status, image } = req.body;
    const itemId = req.params.id;
    await item.findByIdAndUpdate(itemId, {
      name,
      description,
      category,
      location,
      status,
      image,
    });
    res.redirect("/items"); // show all items after updating
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Admin delete item
router.post("/items/delete/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const itemId = req.params.id;
    await item.findByIdAndDelete(itemId);
    res.redirect("/items"); // show all items after deleting
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
