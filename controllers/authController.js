const bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../utils/mailer");
const {
  findUserByEmail,
  createUser,
  getUserByEmail,
  updateResetToken,
  getUserByResetToken,
  updatePassword
} = require("../models/userModel");
const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Check if all fields are filled
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    // Check if email already exists
    findUserByEmail(email, async (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database Error"
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "Email already exists"
        });
      }

      // Hash the password
      const password_hash = await bcrypt.hash(password, 10);

      // Save user
      createUser(
        full_name,
        email,
        password_hash,
        role,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "Registration Failed"
            });
          }

          return res.status(201).json({
            message: "Registration Successful"
          });
        }
      );
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server Error"
    });
  }
};



const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please enter email and password"
    });
  }

  getUserByEmail(email, async (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database Error"
      });
    }

    if (result.length === 0) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

   // Save user data in session
req.session.user = {
    id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role
};

// Redirect to Dashboard
return res.redirect("/dashboard");
  });
};

const forgotPassword = (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).send("Please enter your email.");
    }

    findUserByEmail(email, (err, result) => {

        if (err) {
            return res.status(500).send("Database Error");
        }

        if (result.length === 0) {
            return res.status(400).send("Email not found");
        }

        const token = crypto.randomBytes(32).toString("hex");

        updateResetToken(email, token, (err) => {

            if (err) {
                return res.status(500).send("Error saving token");
            }

            const resetLink =
                `http://localhost:3000/reset-password/${token}`;

            transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: email,

                subject: "Reset Your Password",

                html: `
                    <h2>Password Reset</h2>

                    <p>Click the link below to reset your password:</p>

                    <a href="${resetLink}">
                        Reset Password
                    </a>
                `

            }, (err, info) => {

                if (err) {
                    console.log(err);
                    return res.send("Email could not be sent.");
                }

                res.send("Password reset email sent successfully.");
            });

        });

    });

};

const resetPassword = async (req, res) => {

    const token = req.params.token;
    const { password } = req.body;

    if (!password) {
        return res.send("Please enter a new password.");
    }

    getUserByResetToken(token, async (err, result) => {

        if (err) {
            return res.send("Database Error");
        }

        if (result.length === 0) {
            return res.send("Invalid or Expired Reset Link");
        }

        const password_hash = await bcrypt.hash(password, 10);

        updatePassword(password_hash, token, (err) => {

            if (err) {
                return res.send("Password Reset Failed");
            }

            res.send("Password reset successful. Please login.");

        });

    });

};
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};
