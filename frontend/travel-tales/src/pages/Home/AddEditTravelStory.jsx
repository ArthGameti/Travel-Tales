// File: src/pages/AddEditTravelStory.jsx
// Form to add or edit a travel story with image upload
import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  MdAdd,
  MdClose,
  MdUpdate,
  MdDelete,
  MdFavorite,
  MdFavoriteBorder,
} from "react-icons/md";
import { toast } from "react-toastify";

const AddEditTravelStory = ({
  storyInfo,
  type,
  onClose,
  getAllTravelStories,
}) => {
  const [title, setTitle] = useState(storyInfo?.title || "");
  const [visitedLocation, setVisitedLocation] = useState(
    storyInfo?.visitedLocation || ""
  );
  const [story, setStory] = useState(storyInfo?.story || "");
  const [visitedDate, setVisitedDate] = useState(
    storyInfo?.visitedDate
      ? new Date(storyInfo.visitedDate).toISOString().split("T")[0]
      : ""
  );
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(storyInfo?.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(storyInfo?.isFavorite || false);

  // Handle file input change for image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission for adding or updating a story
  const handleSubmit = async () => {
    if (!title || !visitedLocation || !story || !visitedDate) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("visitedLocation", visitedLocation);
    formData.append("story", story);
    formData.append("visitedDate", new Date(visitedDate).toISOString());
    if (image) {
      formData.append("image", image);
    } else if (storyInfo?.imageUrl) {
      formData.append("imageUrl", storyInfo.imageUrl);
    }

    try {
      let response;
      if (type === "add") {
        response = await axiosInstance.post("/add-travel-story", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axiosInstance.put(
          `/edit-story/${storyInfo._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      if (!response.data.error) {
        getAllTravelStories();
        onClose();
        toast.success(
          type === "add"
            ? "Story added successfully!"
            : "Story updated successfully!"
        );
      } else {
        toast.error(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting story:", error);
      toast.error(error.response?.data?.message || "Failed to submit story.");
    } finally {
      setLoading(false);
    }
  };

  // Handle story deletion
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;

    try {
      const response = await axiosInstance.delete(
        `/delete-story/${storyInfo._id}`
      );
      if (!response.data.error) {
        getAllTravelStories();
        onClose();
        toast.success("Story deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete story.");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Something went wrong.");
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      const response = await axiosInstance.put(
        `/update-is-fav/${storyInfo._id}`,
        {
          isFavorite: !isFavorite,
        }
      );

      if (!response.data.error) {
        setIsFavorite(response.data.story.isFavorite);
        getAllTravelStories();
        toast.success("Favourite status updated!");
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast.error("Failed to update favorite status.");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-zinc-800 shadow-md rounded-lg text-zinc-300">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg sm:text-xl font-medium text-zinc-100">
          {type === "add" ? "Add Travel Story" : "Update Travel Story"}
        </h5>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-rose-500 transition-all duration-200"
        >
          <MdClose className="text-xl" />
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
        />
        <input
          type="text"
          placeholder="Visited Location"
          value={visitedLocation}
          onChange={(e) => setVisitedLocation(e.target.value)}
          className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
        />
        <input
          type="date"
          value={visitedDate}
          onChange={(e) => setVisitedDate(e.target.value)}
          className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
        />
        <textarea
          placeholder="Write your travel story..."
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 h-24 transition-all duration-200"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-600 file:text-zinc-300 file:hover:bg-zinc-500 file:transition-all file:duration-200"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 sm:h-40 object-cover rounded-md mt-2"
          />
        )}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button
          className="flex items-center gap-1 text-xs font-medium bg-rose-500 text-white px-3 py-2 rounded-md shadow-md hover:bg-rose-600 hover:scale-105 disabled:bg-rose-300 disabled:scale-100 transition-all duration-200"
          onClick={handleSubmit}
          disabled={loading}
        >
          {type === "add" ? (
            <MdAdd className="text-lg" />
          ) : (
            <MdUpdate className="text-lg" />
          )}
          {loading
            ? "Saving..."
            : type === "add"
            ? "Add Story"
            : "Update Story"}
        </button>
        {type === "edit" && (
          <>
            <button
              className="flex items-center gap-1 text-xs font-medium bg-red-500 text-white px-3 py-2 rounded-md shadow-md hover:bg-red-600 hover:scale-105 disabled:bg-red-300 disabled:scale-100 transition-all duration-200"
              onClick={handleDelete}
              disabled={loading}
            >
              <MdDelete className="text-lg" />
              Delete Story
            </button>
            {/* Favorite toggle button (visible only to story owner) */}
            <button
              className={`flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-md shadow-md transition-all duration-200 ${
                isFavorite
                  ? "bg-yellow-500 hover:bg-yellow-600 hover:scale-105"
                  : "bg-zinc-600 hover:bg-zinc-500 hover:scale-105"
              } disabled:opacity-50 disabled:scale-100`}
              onClick={toggleFavorite}
              disabled={loading}
            >
              {isFavorite ? (
                <MdFavorite className="text-lg" />
              ) : (
                <MdFavoriteBorder className="text-lg" />
              )}
              {isFavorite ? "Unfavorite" : "Favorite"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AddEditTravelStory;
