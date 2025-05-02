const express = require("express");
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const helpers = require("./helpers")


const exphbs = require("express-handlebars");



//import routes and middlewares
const setupSession = require("./middlewares/sessions");


const app = express();

app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    helpers: helpers,
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
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");



// use routes
app.use("/admin", adminRoutes);
app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);



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

