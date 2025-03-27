// File: src/components/StoryDetailsModal.jsx
// Displays a modal with travel story details and action buttons
import React from "react";
import {
  FaEdit,
  FaTrash,
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
} from "react-icons/fa";

const StoryDetailsModal = ({
  story,
  onClose,
  onEditClick,
  onDeleteClick,
  onFavouriteClick,
  currentUserId, // Add prop for authenticated user's ID
}) => {
  // Format visited date for display
  const formattedDate = new Date(story.visitedDate).toLocaleDateString();

  // Check if the authenticated user is the story's owner
  const isOwner = currentUserId === story.userId?._id;

  return (
    <div className="bg-zinc-900 text-zinc-300 p-4 sm:p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 sm:mx-auto">
      {/* Header with title and close button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100">
          {story.title}
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-rose-500 transition-all duration-200"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>

      {/* Story image */}
      <img
        src={story.imageUrl}
        alt={story.title}
        className="w-full h-48 sm:h-64 object-cover rounded-md mb-4"
      />

      {/* Story date */}
      <p className="text-zinc-500 text-sm mb-2">{formattedDate}</p>

      {/* Story content */}
      <p className="text-zinc-400 text-sm sm:text-base mb-4">{story.story}</p>

      {/* Visited location with map marker */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 bg-zinc-800 text-teal-500 text-sm font-medium px-3 py-1 rounded-full">
          <FaMapMarkerAlt />
          {story.visitedLocation}
        </span>
      </div>

      {/* Action buttons (favorite, edit, delete) */}
      <div className="flex justify-end gap-4">
        {/* Favorite button (visible to all users) */}
        <button
          onClick={onFavouriteClick}
          className="text-yellow-500 hover:text-yellow-600 hover:scale-110 transition-all duration-200"
          title={story.isFavorite ? "Unfavorite" : "Favorite"}
        >
          {story.isFavorite ? (
            <FaHeart className="text-xl" />
          ) : (
            <FaRegHeart className="text-xl" />
          )}
        </button>

        {/* Edit and delete buttons (visible only to the story's owner) */}
        {isOwner && (
          <>
            <button
              onClick={onEditClick}
              className="text-blue-500 hover:text-blue-400 hover:scale-110 transition-all duration-200"
              title="Edit Story"
            >
              <FaEdit className="text-xl" />
            </button>
            <button
              onClick={onDeleteClick}
              className="text-red-500 hover:text-red-600 hover:scale-110 transition-all duration-200"
              title="Delete Story"
            >
              <FaTrash className="text-xl" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StoryDetailsModal;
