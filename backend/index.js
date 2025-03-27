require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const config = require("./config.json");
const { authenticateToken } = require("./utilities");
const upload = require("./multer");

// Models
const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Connect to MongoDB
mongoose
  .connect(config.connectionString)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Create Account
app.post("/create-account", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ error: true, message: "All fields are required" });
    }

    // Check if user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
      return res
        .status(400)
        .json({ error: true, message: "User already exists" });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    await user.save();

    // Generate JWT token for authentication
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    return res.status(201).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      accessToken,
      message: "Registration Successful",
    });
  } catch (error) {
    console.error("Error in /create-account:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token for authentication
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    return res.status(200).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      accessToken,
      message: "Login Successful",
    });
  } catch (error) {
    console.error("Error in /login:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Fetch user details by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.json({
      error: false,
      user,
      message: "User fetched successfully",
    });
  } catch (error) {
    console.error("Error in /get-user:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});

// Upload Image
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    // Check if an image was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No Image Uploaded" });
    }
    const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
    res.status(201).json({ error: false, imageUrl });
  } catch (error) {
    console.error("Error in /image-upload:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

// Delete Image
app.delete("/delete-image", async (req, res) => {
  try {
    const { imageUrl } = req.query;

    // Validate imageUrl parameter
    if (!imageUrl) {
      return res
        .status(400)
        .json({ error: true, message: "ImageUrl Parameter is required" });
    }

    // Delete the image file from the server
    const filename = path.basename(imageUrl);
    const filepath = path.join(__dirname, "uploads", filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res
        .status(200)
        .json({ error: false, message: "Image deleted successfully" });
    } else {
      res.status(404).json({ error: true, message: "Image not found" });
    }
  } catch (error) {
    console.error("Error in /delete-image:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

// Add Travel Story
app.post(
  "/add-travel-story",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, story, visitedLocation, visitedDate } = req.body;
      const { userId } = req.user;

      // Validate required fields
      if (!title || !story || !visitedLocation || !visitedDate || !req.file) {
        return res.status(400).json({
          error: true,
          message: "All fields, including image, are required",
        });
      }

      // Validate date format
      const parsedVisitedDate = new Date(visitedDate);
      if (isNaN(parsedVisitedDate.getTime())) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid date format" });
      }

      const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;

      // Create a new travel story
      const travelStory = new TravelStory({
        title,
        story,
        visitedLocation,
        userId, // Associate the story with the authenticated user
        imageUrl,
        visitedDate: parsedVisitedDate,
      });

      await travelStory.save();

      return res.status(201).json({
        error: false,
        story: travelStory,
        message: "Added Successfully",
      });
    } catch (error) {
      console.error("Error in /add-travel-story:", error);
      return res.status(500).json({ error: true, message: "Server error" });
    }
  }
);

// Get All Stories (for the authenticated user)
app.get("/get-all-stories", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Fetch all stories created by the authenticated user
    const travelStories = await TravelStory.find({ userId }).sort({
      isFavorite: -1, // Sort by favorite status (favorites first)
      createdOn: -1, // Then by creation date (newest first)
    });

    return res.status(200).json({ error: false, stories: travelStories });
  } catch (error) {
    console.error("Error in /get-all-stories:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});

// Edit Travel Story
app.put(
  "/edit-story/:id",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, story, visitedDate, visitedLocation } = req.body;
      const { userId } = req.user;

      // Validate required fields
      if (!title || !story || !visitedDate || !visitedLocation) {
        return res.status(400).json({
          error: true,
          message: "Please provide all required fields",
        });
      }

      // Validate date format
      const parsedVisitedDate = new Date(visitedDate);
      if (isNaN(parsedVisitedDate.getTime())) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid date format" });
      }

      // Prepare update data
      const updateData = {
        title,
        story,
        visitedDate: parsedVisitedDate,
        visitedLocation,
      };

      // If a new image is uploaded, delete the old image and update the URL
      if (req.file) {
        const oldStory = await TravelStory.findOne({ _id: id, userId });
        if (oldStory && oldStory.imageUrl) {
          const filename = path.basename(oldStory.imageUrl);
          const filepath = path.join(__dirname, "uploads", filename);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        }
        updateData.imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
      }

      // Update the story only if the authenticated user is the owner
      const updatedStory = await TravelStory.findOneAndUpdate(
        { _id: id, userId }, // Ensure the userId matches the authenticated user
        updateData,
        { new: true }
      );

      if (!updatedStory) {
        return res.status(404).json({
          error: true,
          message:
            "Story not found or you are not authorized to edit this story",
        });
      }

      return res.status(200).json({
        error: false,
        story: updatedStory,
        message: "Story updated successfully",
      });
    } catch (error) {
      console.error("Error in /edit-story:", error);
      return res.status(500).json({ error: true, message: "Server error" });
    }
  }
);

// Delete Travel Story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Find the story and ensure the authenticated user is the owner
    const travelStory = await TravelStory.findOne({ _id: id, userId });

    if (!travelStory) {
      return res.status(404).json({
        error: true,
        message:
          "Story not found or you are not authorized to delete this story",
      });
    }

    // Delete the story
    await TravelStory.deleteOne({ _id: id, userId });

    // Delete the associated image file
    const filename = path.basename(travelStory.imageUrl);
    const filePath = path.join(__dirname, "uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      error: false,
      message: "Travel story deleted successfully",
    });
  } catch (error) {
    console.error("Error in /delete-story:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});

// Update Favorite Status
app.put("/update-is-fav/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    // const { userId } = req.user; // Not needed for ownership check

    // Find the story (no ownership check, as any user can toggle favorite status)
    const travelStory = await TravelStory.findById(id);

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel Story not found" });
    }

    // Update the favorite status
    travelStory.isFavorite = isFavorite;
    await travelStory.save();

    return res.status(200).json({
      error: false,
      story: travelStory,
      message: "Favorite status updated successfully",
    });
  } catch (error) {
    console.error("Error in /update-is-fav:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});

// Search Travel Stories (for the authenticated user)
app.get("/search", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const { userId } = req.user;

    // Validate query parameter
    if (!query) {
      return res
        .status(400)
        .json({ error: true, message: "Query is required" });
    }

    // Search stories created by the authenticated user
    const searchResult = await TravelStory.find({
      userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLocation: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavorite: -1 });

    return res.status(200).json({ error: false, stories: searchResult });
  } catch (error) {
    console.error("Error in /search:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});

// Filter Travel Stories by Date Range (for the authenticated user)
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId } = req.user;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: true,
        message: "Both startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Filter stories created by the authenticated user within the date range
    const stories = await TravelStory.find({
      userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ visitedDate: -1 });

    return res.status(200).json({ error: false, stories });
  } catch (error) {
    console.error("Error in /travel-stories/filter:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});

// Get All Travel Stories from All Users
app.get("/get-all-user-all-story", authenticateToken, async (req, res) => {
  try {
    // Fetch all stories and populate the userId field with user details
    const travelStories = await TravelStory.find()
      .populate("userId", "fullName email") // Populate userId with fullName and email
      .sort({ createdOn: -1 });

    return res.status(200).json({ error: false, stories: travelStories });
  } catch (error) {
    console.error("Error in /get-all-user-all-story:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});

// Route to search stories across all users
app.get("/search-all-stories", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ error: true, message: "Query parameter is required" });
    }

    // Search stories by title, story, or visitedLocation (case-insensitive)
    const stories = await Story.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLocation: { $regex: query, $options: "i" } },
      ],
    }).populate("userId", "fullName email"); // Populate userId with user details

    res.status(200).json({ error: false, stories });
  } catch (error) {
    console.error("Error in /search-all-stories:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
