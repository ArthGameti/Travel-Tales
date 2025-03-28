// File: src/components/StoryCard.jsx
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

// Custom arrow components for the slider
const NextArrow = ({ onClick }) => (
  <div
    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-rose-500 rounded-full p-2 cursor-pointer hover:bg-rose-600 z-10"
    onClick={onClick}
  >
    <FaArrowRight />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-rose-500 rounded-full p-2 cursor-pointer hover:bg-rose-600 z-10"
    onClick={onClick}
  >
    <FaArrowLeft />
  </div>
);

const StoryCard = ({ story, userId }) => {
  // Slider settings for displaying multiple images
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    adaptiveHeight: true,
  };

  // Handle delete operation (Delete operation: DELETE /delete-story/:id)
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/delete-story/${story._id}`);
      // Refresh the page to update the story list (same flow as before)
      window.location.reload();
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  // Handle favorite toggle (Update operation: PUT /update-is-fav/:id)
  const handleFavoriteToggle = async () => {
    try {
      await axiosInstance.put(`/update-is-fav/${story._id}`, {
        isFavorite: !story.isFavorite,
      });
      // Refresh the page to update the story list (same flow as before)
      window.location.reload();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="bg-zinc-800 text-zinc-300 rounded-lg shadow-lg p-6 mb-4">
      <h3 className="text-xl font-semibold text-rose-500">{story.title}</h3>
      <p className="text-sm text-zinc-400 mb-2">{story.visitedLocation}</p>
      <p className="text-sm text-zinc-400 mb-4">
        {new Date(story.visitedDate).toLocaleDateString()}
      </p>

      {/* Photo Slider (Updated to display imageUrls array) */}
      {story.imageUrls && story.imageUrls.length > 0 && (
        <div className="mb-4">
          <Slider {...sliderSettings}>
            {story.imageUrls.map((url, index) => (
              <div key={index}>
                <img
                  src={url}
                  alt={`Story ${index + 1}`}
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Video Player (New: Displays videoUrl) */}
      {story.videoUrl && (
        <div className="mb-4">
          <video
            src={story.videoUrl}
            controls
            className="w-full h-64 object-cover rounded-md"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <p className="text-zinc-300">{story.story}</p>

      {/* Action Buttons (Edit, Delete, Favorite) */}
      <div className="flex gap-2 mt-4">
        {/* Show Edit and Delete buttons only for the story owner (same as before) */}
        {story.userId === userId && (
          <>
            {/* Update operation: Link to /edit-story/:id */}
            <Link
              to={`/edit-story/${story._id}`}
              className="px-3 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-600"
            >
              Edit
            </Link>
            {/* Delete operation: DELETE /delete-story/:id */}
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </>
        )}
        {/* Favorite Toggle (same as before) */}
        <button
          onClick={handleFavoriteToggle}
          className={`px-3 py-1 rounded-md ${
            story.isFavorite
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
        >
          {story.isFavorite ? "Unfavorite" : "Favorite"}
        </button>
      </div>
    </div>
  );
};

export default StoryCard;