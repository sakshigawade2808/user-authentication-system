const express = require("express");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
const session = require("express-session");


const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "sakshi_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000
    }
  })
);

// Routes
app.use("/", authRoutes);
// Home Route
app.get("/", (req, res) => {
  res.send("User Authentication Project Started");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/forgot-password", (req, res) => {
    res.render("forgotPassword");
});

app.get("/reset-password/:token", (req, res) => {

    const token = req.params.token;

    res.render("resetPassword", {
        token
    });

});
app.get("/dashboard", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render("dashboard", {
        user: req.session.user
    });

});

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Error while logging out");
        }

        res.redirect("/login");

    });

});

app.get("/admin", (req, res) => {

    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // Check if user is Admin
    if (req.session.user.role !== "Admin") {
        return res.send("Access Denied");
    }

    // Show Admin page
    res.render("admin", {
        user: req.session.user
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});