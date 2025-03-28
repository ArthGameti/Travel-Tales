import React from "react";
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const TravelStoryCard = ({
  id,
  imageUrl, // Now expects imageUrls array
  videoUrl, // Add videoUrl prop
  title,
  date,
  story,
  visitedLocation,
  isFavourite,
  userId, // Story owner's ID
  currentUserId, // Authenticated user's ID
  onFavouriteClick,
  onEditClick,
  onDeleteClick,
  onCardClick,
}) => {
  // Trim story to 60 characters for preview
  const trimmedStory =
    story.length > 60 ? `${story.substring(0, 60)}...` : story;

  // Check if the authenticated user is the story's owner
  const isOwner = currentUserId === userId;

  // Use the first image from imageUrls for the card preview
  const displayImage =
    Array.isArray(imageUrl) && imageUrl.length > 0 ? imageUrl[0] : null;

  // Function to determine the MIME type based on video file extension
  const getVideoType = (url) => {
    if (!url) return "video/mp4"; // Default fallback
    const ext = url.split(".").pop().toLowerCase();
    switch (ext) {
      case "mp4":
        return "video/mp4";
      case "mov":
        return "video/quicktime";
      case "webm":
        return "video/webm";
      case "mkv":
        return "video/x-matroska";
      default:
        return "video/mp4";
    }
  };

  return (
    <div
      className="bg-zinc-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer"
      onClick={() => onCardClick(id)}
    >
      {/* Media section with action buttons */}
      <div className="relative">
        {videoUrl ? (
          // Display video if videoUrl exists
          <video
            controls
            className="w-full h-40 sm:h-52 object-cover"
            onError={(e) => console.error("Video playback error:", e)}
          >
            <source src={videoUrl} type={getVideoType(videoUrl)} />
            Your browser does not support the video tag.
          </video>
        ) : displayImage ? (
          // Fallback to image if no video
          <img
            src={displayImage}
            alt={title}
            className="w-full h-40 sm:h-52 object-cover"
          />
        ) : (
          // Fallback if neither video nor image exists
          <div className="w-full h-40 sm:h-52 bg-zinc-600 flex items-center justify-center">
            <p className="text-zinc-400">No Media</p>
          </div>
        )}
        {/* Favorite button (visible to all users) */}
        <button
          className="absolute top-3 right-3 bg-zinc-900 rounded-full p-2 shadow-md hover:bg-zinc-700 hover:scale-110 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when toggling favorite
            onFavouriteClick();
          }}
        >
          {isFavourite ? (
            <FaHeart className="text-yellow-500 text-xl" />
          ) : (
            <FaRegHeart className="text-zinc-400 text-xl" />
          )}
        </button>
        {/* Edit and delete buttons (visible only to the story's owner) */}
        {isOwner && (
          <div className="absolute top-3 left-3 flex gap-2">
            <button
              className="bg-zinc-900 rounded-full p-2 shadow-md hover:bg-zinc-700 hover:scale-110 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
            >
              <FaEdit className="text-blue-500 text-xl" />
            </button>
            <button
              className="bg-zinc-900 rounded-full p-2 shadow-md hover:bg-zinc-700 hover:scale-110 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick();
              }}
            >
              <FaTrash className="text-red-500 text-xl" />
            </button>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
          {title}
        </h3>
        <p className="text-zinc-500 text-xs sm:text-sm mb-2">{date}</p>
        <p className="text-zinc-400 text-xs sm:text-sm">{trimmedStory}</p>
        <div className="mt-3">
          <span className="inline-flex items-center gap-2 bg-zinc-700 text-teal-500 text-xs font-medium px-3 py-1 rounded-full">
            <FaMapMarkerAlt />
            {visitedLocation}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TravelStoryCard;
