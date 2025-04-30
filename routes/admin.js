const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");
const item = require("../models/Item");



/** 
 * @description: Admin dashboard route
 * @route: GET /admin
 * @access: Private (Admin only)
 * @returns: Renders the admin dashboard page with all items
 * @throws: 500 Internal Server Error if there's an error fetching items
 * @notes: This route is protected by authentication and authorization middleware.
 *         It only allows access to users with admin privileges.
 *        The items are fetched from the database and passed to the view for rendering.
 *        The layout used for this view is "admin".
 *        The current year is also passed to the view for display purposes.
 *        The view is expected to be located in the views directory and named "Admindashboard".
 *        The view should be designed to display the items in a user-friendly manner.
 *        The items are expected to be in a format that can be easily rendered in the view.
 * 
 */

// GET admin page/dashboard
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const items = await item.find().lean().populate("contactPerson", "role"); // Fetch all items and populate contactPerson with name

    //view all items in the admin page
    res.render("Admindashboard", {
      layout: "admin",
      title: "Admin Dashboard",
      items,
      currentYear: new Date().getFullYear(),
    });
  } catch (err) {
    console.error("Error rendering page:", err);
    res.status(500).json({
      layout: "admin",
      error: "Internal Server Error:",
    });
  }
});



// GET admin page/dashboard with add item form
router.get("/items/add", isAuthenticated, isAdmin, async (req, res) => {
  try {
    res.render("addItemAdmin", {
      layout: "admin",
      title: "Add New Item",
      currentYear: new Date().getFullYear(),
      categories: await item.schema.path("category").enumValues, // Get categories from the schema
      statuses: await item.schema.path("status").enumValues, // Get statuses from the schema
    });
  } catch (err) {
    console.error("Error rendering page:", err);
    res.status(500).json({
      layout: "admin",
      error: "Internal Server Error",
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
      contactPerson: req.user.role, // Assuming the contact person is the admin user
    });
    await newItem.save();
    req.flash("success", "Item added successfully!");
    res.redirect("/"); // show all items after adding a new one
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
    res.redirect("/"); // show all items after updating
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
    res.redirect("/"); // show all items after deleting
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// GET admin page/dashboard with search
router.get("/search", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const searchQuery = req.query.search;
    let query = {};

    if (searchQuery) {
      query = {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
          { location: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const items = await item.find(query).lean();
    
    res.render("Admindashboard", {
      layout: "admin",
      title: "Admin Dashboard",
      items,
      currentYear: new Date().getFullYear(),
      searchQuery: searchQuery || '' 
    });
  } catch (err) {
    console.error("Error rendering page:", err);
    res.status(500).render("error", {
      layout: "admin",
      error: "Internal Server Error"
    });
  }
});

module.exports = router;
