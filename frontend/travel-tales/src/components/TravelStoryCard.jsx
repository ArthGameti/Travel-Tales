// File: src/components/TravelStoryCard.jsx
import React from "react";
import { FaHeart, FaRegHeart, FaMapMarkerAlt } from "react-icons/fa";

// Component to display a travel story card with dark theme and responsive design
const TravelStoryCard = ({
  id,
  imageUrl,
  title,
  date,
  story,
  visitedLocation,
  isFavourite,
  onFavouriteClick,
  onCardClick, // Prop for expanding the card
}) => {
  // Trim story to 60 characters for preview
  const trimmedStory =
    story.length > 60 ? `${story.substring(0, 60)}...` : story;

  return (
    // Card container with dark background and hover effect
    <div
      className="bg-zinc-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer"
      onClick={() => onCardClick(id)} // Trigger expanded view
    >
      {/* Image section with favorite button */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-40 sm:h-52 object-cover"
        />
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
      </div>

      {/* Card content */}
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
          {title}
        </h3>

        {/* Date */}
        <p className="text-zinc-500 text-xs sm:text-sm mb-2">{date}</p>

        {/* Story preview */}
        <p className="text-zinc-400 text-xs sm:text-sm">{trimmedStory}</p>

        {/* Visited location with map marker */}
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
