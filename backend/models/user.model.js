const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true, // Remove leading/trailing whitespace
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Remove leading/trailing whitespace
    lowercase: true, // Ensure email is stored in lowercase
  },
  password: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
