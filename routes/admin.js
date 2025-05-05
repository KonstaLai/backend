const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");
const item = require("../models/Item");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });



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
router.post("/items/add", isAuthenticated, isAdmin, upload.single("imageUpload"), async (req, res) => {
  try {
    const { name, description, category, location, status } = req.body;
    const imageUrl = req.body.imageUrl || req.file.path; // Use the uploaded file path if available
    let image = "";

    if (req.body.imageSource === "upload" && req.file) {
      image = `/uploads/${req.file.filename}`; 
    } else if (req.body.imageSource === "url") {
      image = imageUrl;
    }
    const newItem = new item({
      name,
      description,
      category,
      location,
      status,
      image,
      contactPerson: req.user.id, // Set the contact person to the logged-in user
    });
    console.log('current user:', req.user.id)
    await newItem.save();
    req.flash("success", "Item added successfully!");
    res.redirect("/admin/"); // show all items after adding a new one
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Admin edit item form (GET)
router.get("/items/update/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const itemId = req.params.id;
    const existingItem = await item.findById(itemId).lean();

    res.render("editItemAdmin", {
      layout: "admin",
      title: "Edit Item",
      item: existingItem,
      categories: item.schema.path("category").enumValues,
      statuses: item.schema.path("status").enumValues,
      currentYear: new Date().getFullYear()
    });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).render("error", {
      layout: "admin",
      error: "Internal Server Error"
    });
  }
});


// Admin to submit form
router.post("/items/update/:id", isAuthenticated, isAdmin, upload.single("imageUpload"), async (req, res) => {
  try {
    const { name, description, category, location, status } = req.body;
    const itemId = req.params.id;
    let image = req.body.image; // Initialize with existing image from req.body

    // Handle image upload/URL selection
    if (req.body.imageSource === "upload" && req.file) {
      image = `/uploads/${req.file.filename}`; 
    } else if (req.body.imageSource === "url" && req.body.imageUrl) {
      image = req.body.imageUrl;
    }

    await item.findByIdAndUpdate(itemId, {
      name,
      description,
      category,
      location,
      status,
      image,
    });
    res.redirect("/admin");
  } catch (err) {
    console.error("Error updating item", err);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});



// Delete an item
router.post("/items/delete/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const itemId = req.params.id;
    await item.findByIdAndDelete(itemId);
    req.flash("success", "Item deleted successfully!");
    res.redirect("/admin");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

// GET admin page/dashboard with search
router.get("/search", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim();

    // Only search if query exists
    if (!searchQuery) {
      return res.redirect("/admin"); // Optional: fallback to default dashboard
    }

    const query = {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } }
      ]
    };

    const items = await item.find(query).lean();

    res.render("Admindashboard", {
      layout: "admin",
      title: "Admin Dashboard",
      items,
      currentYear: new Date().getFullYear(),
      searchQuery
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
