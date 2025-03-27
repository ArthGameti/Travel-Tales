// File: backend/travel-tales/models/TravelStory.js
const mongoose = require("mongoose");

// Define the TravelStory schema
const travelStorySchema = new mongoose.Schema({
  // Title of the travel story
  title: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends
  },
  // Main content of the travel story
  story: {
    type: String,
    required: true,
    trim: true,
  },
  // Location visited in the travel story
  visitedLocation: {
    type: String,
    required: true,
    trim: true,
  },
  // Indicates if the story is marked as a favorite by the user
  // This field allows any user to toggle the favorite status
  isFavorite: {
    type: Boolean,
    default: false,
  },
  // Reference to the user who created the story
  // This field is used to determine ownership for edit/delete permissions
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model
    required: true,
  },
  // Timestamp when the story was created
  createdOn: {
    type: Date,
    default: Date.now,
  },
  // URL of the image associated with the story
  imageUrl: {
    type: String,
    required: true,
  },
  // Date when the user visited the location
  visitedDate: {
    type: Date,
    required: true,
  },
});

// Export the TravelStory model
module.exports = mongoose.model("TravelStory", travelStorySchema);
