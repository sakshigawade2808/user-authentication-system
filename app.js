const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");

dotenv.config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Trust proxy (Required for Render)
app.set("trust proxy", 1);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
    session({
        secret: process.env.SESSION_SECRET || "sakshi_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 60 * 1000,
            secure: false
        }
    })
);

// Routes
app.use("/", authRoutes);

// Registration Page
app.get("/register", (req, res) => {
    res.render("register");
});

// Login Page
app.get("/login", (req, res) => {
    res.render("login");
});

// Forgot Password
app.get("/forgot-password", (req, res) => {
    res.render("forgotPassword");
});

// Reset Password
app.get("/reset-password/:token", (req, res) => {
    res.render("resetPassword", {
        token: req.params.token
    });
});

// Dashboard
app.get("/dashboard", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render("dashboard", {
        user: req.session.user
    });

});

// Admin Panel
app.get("/admin", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "Admin") {
        return res.status(403).send("Access Denied");
    }

    res.render("admin", {
        user: req.session.user
    });

});

// Logout
app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Error while logging out");
        }

        res.redirect("/login");

    });

});

// 404 Page
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});