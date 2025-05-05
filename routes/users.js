const express = require("express");
const router = express.Router();
const { isAuthenticated, isUser } = require("../middlewares/authMiddleware");
const Item = require("../models/Item");
const User = require("../models/User");
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

// GET user page/dashboard with add item form
router.get("/items/add", isAuthenticated, isUser, async (req, res) => {
  try {
    res.render("addItemUser", {
      layout: "users",
      title: "Add New Item",
      currentYear: new Date().getFullYear(),
      categories: await Item.schema.path("category").enumValues, // Get categories from the schema
      statuses: await Item.schema.path("status").enumValues, // Get statuses from the schema
    });
  } catch (err) {
    console.error("Error rendering page:", err);
    res.status(500).json({
      layout: "users",
      error: "Internal Server Error",
    });
  }
});

// User add new item
router.post("/items/add", isAuthenticated, isUser, upload.single("imageUpload"), async (req, res) => {
  try {
    const { name, description, category, location, status } = req.body;
    const imageUrl = req.body.imageUrl || req.file.path; // Use the uploaded file path if available
    let image = "";

    if (req.body.imageSource === "upload" && req.file) {
      image = `/uploads/${req.file.filename}`; 
    } else if (req.body.imageSource === "url") {
      image = imageUrl;
    }

    //find admin user
    const adminUser = await User.findOne({role: 'admin'})
    if(!adminUser){
      return res.status(500).json({
        error: 'Admin user not found'
      })
    }

    const newItem = new Item({
      name,
      description,
      category,
      location,
      status,
      image,
      contactPerson: adminUser.id
    });
    console.log('current user:', adminUser.id)
    await newItem.save();
    req.flash("success", "Item added successfully!");
    res.redirect("/users/"); // show all items after adding a new one
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});


// GET User page/dashboard with search
router.get("/search", isAuthenticated, isUser, async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim();

    // Only search if query exists
    if (!searchQuery) {
      return res.redirect("/users"); // Optional: fallback to default dashboard
    }

    const query = {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } }
      ]
    };

    const items = await Item.find(query).lean();

    res.render("Userdashboard", {
      layout: "users",
      title: "User Dashboard",
      items,
      currentYear: new Date().getFullYear(),
      searchQuery
    });
  } catch (err) {
    console.error("Error rendering page:", err);
    res.status(500).render("error", {
      layout: "users",
      error: "Internal Server Error"
    });
  }
});







module.exports = router;