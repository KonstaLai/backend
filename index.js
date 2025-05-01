const express = require("express");
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const session = require("express-session");

const exphbs = require("express-handlebars");



//importing routes and middlewares
const setupSession = require("./middlewares/sessions");


const app = express();

app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//session middleware
setupSession(app);


//Routes
const adminRoutes = require("./routes/admin");
const homeRoutes = require("./routes/home");



// use routes
app.use("/admin", adminRoutes);
app.use("/", homeRoutes);



const dbURI = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Cluster0`;



mongoose
  .connect(dbURI)
  .then((result) => {
    console.log("Connected to the database");
    app.listen(process.env.PORT, () => {
      console.log(`http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

//render home - direct route handlers
app.get("/", (req, res) => {
  res.render("home")
});

//render login
app.get("/login", (req, res) => {
  res.render("login")
});
//render register
app.get("/register", (req, res) => {
  res.render("register")
})
//render lost-found
app.get("/lostandfound", (req, res) => {
  res.render("lostandfound")
});












app.post('/items', async (req, res) => {
  try {
      // 1. To check if user is logged in
      if (!req.session.userId) {
          return res.status(401).send('You must be logged in to report a lost/found item.');
      }

      // 2. Extract data from the request body.  Use the correct names from your form.
      const { itemName, description, locationLost, status } = req.body;
      const userId = req.session.userId;

      // 3. Create a new Item object
      const newItem = new Item({
          name: itemName,
          description,
          location: locationLost,
          status,
          contactPerson: userId,
      });

      // 4. Save to db
      await newItem.save();

      // 5.  Redirect to a success page or send a message
      console.log('Item saved:', newItem);
      res.redirect('/lost-items'); //  Redirect to the page that displays lost items
     

  } catch (error) {
      // 6. Handle errors
      console.error('Error saving item:', error);
      res.status(500).send('An error occurred while saving the item.');
  }
});




const Item = require('./models/Item'); 
const path = require('path'); 

app.get('/lost-items', async (req, res) => {
    try {
        // 1. Fetch lost items from the database
        const lostItems = await Item.find({ status: 'lost' })
            .populate('contactPerson', 'username email') // Get reporter's username and email
            .sort({ date: -1 }); // Sort by date, newest first

        // 2. Render a Handlebars template to display the items
        res.render('lost-items', { lostItems });  //original line
        

    } catch (error) {
        // 3. Handle errors
        console.error('Error fetching lost items:', error);
        res.status(500).send('An error occurred while retrieving lost items.');
    }
});
