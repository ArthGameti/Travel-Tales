// File: backend/travel-tales/models/User.js
const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema({
  // Full name of the user
  // Used to display the user's name in the frontend (e.g., on TravelStory cards)
  fullName: {
    type: String,
    required: true,
    trim: true, // Remove leading/trailing whitespace
  },
  // Email address of the user
  // Used for authentication and uniquely identifying the user
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    trim: true, // Remove leading/trailing whitespace
    lowercase: true, // Store email in lowercase for consistency
  },
  // Password of the user (hashed in the API routes)
  // Used for authentication during login
  password: {
    type: String,
    required: true,
  },
  // Timestamp when the user account was created
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

// Export the User model
module.exports = mongoose.model("User", userSchema);
