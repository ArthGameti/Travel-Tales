require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const config = require("./config.json");
const { authenticateToken } = require("./utilities");
const { upload, uploadSingleImage } = require("./multer");

// Models
const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");

// Validate environment variables
if (!process.env.ACCESS_TOKEN_SECRET) {
  console.error(
    "Error: ACCESS_TOKEN_SECRET is not set in the environment variables."
  );
  process.exit(1);
}

// Initialize Express app
const app = express();
app.use(express.json());

// Updated CORS configuration to allow requests from http://localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from the frontend's origin
    credentials: true, // Allow credentials (e.g., Authorization header with JWT)
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Connect to MongoDB
mongoose
  .connect(config.connectionString)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ error: false, message: "Server is running" });
});

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
        .json({ error: true, message: "Email and Password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: true, message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid credentials" });
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
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Upload Image
app.post("/image-upload", uploadSingleImage, async (req, res) => {
  try {
    // Check if an image was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No Image Uploaded" });
    }
    const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
    res
      .status(201)
      .json({ error: false, imageUrl, message: "Image uploaded successfully" });
  } catch (error) {
    console.error("Error in /image-upload:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
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
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// Create: Add Travel Story
app.post("/add-travel-story", authenticateToken, upload, async (req, res) => {
  try {
    // Check for multer errors
    if (req.fileValidationError) {
      return res.status(400).json({
        error: true,
        message: req.fileValidationError.message || "Invalid file type",
      });
    }

    const { title, story, visitedLocation, visitedDate } = req.body;
    const { userId } = req.user;

    // Validate required fields
    if (!title || !story || !visitedLocation || !visitedDate) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    // Validate date format
    const parsedVisitedDate = new Date(visitedDate);
    if (isNaN(parsedVisitedDate.getTime())) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid date format" });
    }

    // Check if at least one image is uploaded
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.status(400).json({
        error: true,
        message: "At least one image is required",
      });
    }

    // Map image files to URLs
    const imageUrls = req.files.images.map(
      (file) => `http://localhost:8000/uploads/${file.filename}`
    );

    // Handle video upload (without FFmpeg validation)
    let videoUrl = null;
    if (req.files.video && req.files.video.length > 0) {
      const videoFile = req.files.video[0];
      videoUrl = `http://localhost:8000/uploads/${videoFile.filename}`;
    }

    // Create a new travel story
    const travelStory = new TravelStory({
      title,
      story,
      visitedLocation,
      userId,
      imageUrls,
      videoUrl, // Will be null if no video was uploaded
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
    // Clean up uploaded files in case of error
    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach((file) => {
          const filePath = path.join(__dirname, "uploads", file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
      if (req.files.video) {
        const videoPath = path.join(
          __dirname,
          "uploads",
          req.files.video[0].filename
        );
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      }
    }
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// Read: Get All Stories for Authenticated User
app.get("/get-all-stories", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Fetch all stories created by the authenticated user
    const travelStories = await TravelStory.find({ userId }).sort({
      isFavorite: -1,
      createdOn: -1,
    });

    return res.status(200).json({ error: false, stories: travelStories });
  } catch (error) {
    console.error("Error in /get-all-stories:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Update: Edit Travel Story
app.put("/edit-story/:id", authenticateToken, upload, async (req, res) => {
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

    // Find the existing story
    const oldStory = await TravelStory.findOne({ _id: id, userId });
    if (!oldStory) {
      return res.status(404).json({
        error: true,
        message: "Story not found or you are not authorized to edit this story",
      });
    }

    // Prepare update data
    const updateData = {
      title,
      story,
      visitedDate: parsedVisitedDate,
      visitedLocation,
    };

    // Handle new image uploads
    if (req.files && req.files.images && req.files.images.length > 0) {
      // Delete old images
      if (oldStory.imageUrls && oldStory.imageUrls.length > 0) {
        oldStory.imageUrls.forEach((url) => {
          const filename = path.basename(url);
          const filepath = path.join(__dirname, "uploads", filename);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        });
      }
      // Add new images
      updateData.imageUrls = req.files.images.map(
        (file) => `http://localhost:8000/uploads/${file.filename}`
      );
    }

    // Handle new video upload (without FFmpeg validation)
    if (req.files && req.files.video && req.files.video.length > 0) {
      // Delete old video if it exists
      if (oldStory.videoUrl) {
        const oldVideoFilename = path.basename(oldStory.videoUrl);
        const oldVideoPath = path.join(__dirname, "uploads", oldVideoFilename);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }

      const videoFile = req.files.video[0];
      updateData.videoUrl = `http://localhost:8000/uploads/${videoFile.filename}`;
    }

    // Update the story
    const updatedStory = await TravelStory.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    return res.status(200).json({
      error: false,
      story: updatedStory,
      message: "Story updated successfully",
    });
  } catch (error) {
    console.error("Error in /edit-story:", error);
    // Clean up uploaded files in case of error
    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach((file) => {
          const filePath = path.join(__dirname, "uploads", file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
      if (req.files.video) {
        const videoPath = path.join(
          __dirname,
          "uploads",
          req.files.video[0].filename
        );
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      }
    }
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// Delete: Delete Travel Story
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

    // Delete associated image files
    if (travelStory.imageUrls && travelStory.imageUrls.length > 0) {
      travelStory.imageUrls.forEach((url) => {
        const filename = path.basename(url);
        const filePath = path.join(__dirname, "uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete associated video file
    if (travelStory.videoUrl) {
      const videoFilename = path.basename(travelStory.videoUrl);
      const videoPath = path.join(__dirname, "uploads", videoFilename);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    // Delete the story
    await TravelStory.deleteOne({ _id: id, userId });

    return res.status(200).json({
      error: false,
      message: "Travel story deleted successfully",
    });
  } catch (error) {
    console.error("Error in /delete-story:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Update Favorite Status
app.put("/update-is-fav/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    const { userId } = req.user;

    // Find the story and ensure the authenticated user is the owner
    const travelStory = await TravelStory.findOne({ _id: id, userId });

    if (!travelStory) {
      return res.status(404).json({
        error: true,
        message:
          "Travel Story not found or you are not authorized to update this story",
      });
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
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Search Travel Stories for Authenticated User
app.get(
  "/travel-stories/search-stories",
  authenticateToken,
  async (req, res) => {
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

      console.log(
        `Search request received for user ${userId} with query: ${query}`
      );

      return res.status(200).json({ error: false, stories: searchResult });
    } catch (error) {
      console.error("Error in /travel-stories/search-stories:", error);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  }
);

// Filter Travel Stories by Date Range for Authenticated User
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
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Read: Get All Travel Stories from All Users
app.get("/get-all-user-all-story", authenticateToken, async (req, res) => {
  try {
    // Fetch all stories and populate the userId field with user details
    const travelStories = await TravelStory.find()
      .populate("userId", "fullName email")
      .sort({ createdOn: -1 });

    return res.status(200).json({ error: false, stories: travelStories });
  } catch (error) {
    console.error("Error in /get-all-user-all-story:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Search Stories Across All Users
app.get(
  "/travel-stories/search-all-stories",
  authenticateToken,
  async (req, res) => {
    try {
      const { query } = req.query;

      // Validate query parameter
      if (!query) {
        return res
          .status(400)
          .json({ error: true, message: "Query parameter is required" });
      }

      // Search stories by title, story, or visitedLocation
      const stories = await TravelStory.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { story: { $regex: query, $options: "i" } },
          { visitedLocation: { $regex: query, $options: "i" } },
        ],
      }).populate("userId", "fullName email");

      res.status(200).json({ error: false, stories });
    } catch (error) {
      console.error("Error in /travel-stories/search-all-stories:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  }
);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
