const db = require("../config/db");

// Find user by email
const findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], callback);
};

// Create a new user
const createUser = (full_name, email, password_hash, role, callback) => {
  const sql = `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [full_name, email, password_hash, role], callback);
};

const getUserByEmail = (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], callback);
};

const updateResetToken = (email, token, callback) => {
    const sql = "UPDATE users SET reset_token = ? WHERE email = ?";
    db.query(sql, [token, email], callback);
};

const findUserByResetToken = (token, callback) => {
    const sql = "SELECT * FROM users WHERE reset_token = ?";
    db.query(sql, [token], callback);
};

const updatePassword = (password_hash, token, callback) => {
    const sql = `
        UPDATE users
        SET password_hash = ?, reset_token = NULL
        WHERE reset_token = ?
    `;
    db.query(sql, [password_hash, token], callback);
};

const getUserByResetToken = (token, callback) => {
    const sql = "SELECT * FROM users WHERE reset_token = ?";
    db.query(sql, [token], callback);
};
module.exports = {
    findUserByEmail,
    createUser,
    getUserByEmail,
    updateResetToken,
    findUserByResetToken,
    updatePassword,
    getUserByResetToken
};