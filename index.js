const express = require("express");
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const session = require("express-session");

const exphbs = require("express-handlebars");

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
