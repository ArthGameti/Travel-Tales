// File: src/pages/Home/AddEditTravelStory.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

const AddEditTravelStory = ({
  type,
  storyInfo,
  onClose,
  getAllTravelStories,
}) => {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [visitedLocation, setVisitedLocation] = useState("");
  const [visitedDate, setVisitedDate] = useState("");
  const [images, setImages] = useState([]); // For multiple images
  const [video, setVideo] = useState(null); // For single video
  const [error, setError] = useState("");

  // Prefill form for edit mode
  useEffect(() => {
    if (type === "edit" && storyInfo) {
      setTitle(storyInfo.title || "");
      setStory(storyInfo.story || "");
      setVisitedLocation(storyInfo.visitedLocation || "");
      setVisitedDate(
        storyInfo.visitedDate
          ? new Date(storyInfo.visitedDate).toISOString().split("T")[0]
          : ""
      );
    }
  }, [type, storyInfo]);

  // Handle image selection (up to 5 images)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError("You can upload a maximum of 5 images.");
      return;
    }
    setImages(files);
    setError("");
  };

  // Handle video selection (single video)
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setError("");
    }
  };

  // Handle form submission (Create or Update operation)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!title || !story || !visitedLocation || !visitedDate) {
      setError("All fields are required.");
      return;
    }

    // For "add" mode, at least one image is required
    if (type === "add" && images.length === 0) {
      setError("At least one image is required.");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("story", story);
    formData.append("visitedLocation", visitedLocation);
    formData.append("visitedDate", visitedDate);

    // Append images (matches multer field name "images")
    images.forEach((image) => {
      formData.append("images", image);
    });

    // Append video if selected (matches multer field name "video")
    if (video) {
      formData.append("video", video);
    }

    try {
      let response;
      if (type === "add") {
        // Create operation: POST /add-travel-story
        response = await axiosInstance.post("/add-travel-story", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Update operation: PUT /edit-story/:id
        response = await axiosInstance.put(
          `/edit-story/${storyInfo._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      if (!response.data.error) {
        toast.success(
          type === "add"
            ? "Story added successfully!"
            : "Story updated successfully!",
          { position: "top-right", autoClose: 2000 }
        );
        getAllTravelStories(); // Refresh stories
        onClose(); // Close modal
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error saving story.");
    }
  };

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-100"
      >
        <IoClose size={24} />
      </button>

      <h2 className="text-xl sm:text-2xl font-semibold text-rose-500 mb-6">
        {type === "add" ? "Add New Story" : "Edit Story"}
      </h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Enter story title"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Story
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Tell your story..."
            rows="5"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Visited Location
          </label>
          <input
            type="text"
            value={visitedLocation}
            onChange={(e) => setVisitedLocation(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Enter location"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Visited Date
          </label>
          <input
            type="date"
            value={visitedDate}
            onChange={(e) => setVisitedDate(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            {type === "add"
              ? "Upload Photos (up to 5)"
              : "Upload New Photos (up to 5, optional)"}
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md"
          />
          {images.length > 0 && (
            <p className="text-sm text-zinc-400 mt-1">
              {images.length} image(s) selected
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            {type === "add"
              ? "Upload Video (max 10 seconds, optional)"
              : "Upload New Video (max 10 seconds, optional)"}
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md"
          />
          {video && (
            <p className="text-sm text-zinc-400 mt-1">{video.name} selected</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-all duration-200"
        >
          {type === "add" ? "Add Story" : "Update Story"}
        </button>
      </form>
    </div>
  );
};

export default AddEditTravelStory;
