// File: backend/travel-tales/models/TravelStory.js
const mongoose = require("mongoose");

// Define the TravelStory schema
const travelStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  story: {
    type: String,
    required: true,
    trim: true,
  },
  visitedLocation: {
    type: String,
    required: true,
    trim: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  imageUrls: {
    type: [String],
    required: true,
    validate: {
      validator: (array) => array.length > 0,
      message: "At least one image URL is required",
    },
  },
  videoUrl: {
    type: String,
    required: false,
  },
  visitedDate: {
    type: Date,
    required: true,
  },
});

// Export the TravelStory model
module.exports = mongoose.model("TravelStory", travelStorySchema);
