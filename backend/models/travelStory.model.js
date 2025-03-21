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
  imageUrl: {
    type: String,
    required: true,
  },
  visitedDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("TravelStory", travelStorySchema);
