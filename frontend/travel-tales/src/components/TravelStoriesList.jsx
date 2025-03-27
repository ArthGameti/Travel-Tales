// File: src/components/TravelStoriesList.jsx
// Displays a list of the user's travel stories with edit functionality
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import TravelStoryCard from "./TravelStoryCard";
import AddEditTravelStory from "./pages/AddEditTravelStory";
import { toast } from "react-toastify";

const TravelStoriesList = () => {
  const [stories, setStories] = useState([]);
  const [editStory, setEditStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch authenticated user's ID
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (!response.data.error) {
        setCurrentUserId(response.data.user._id);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch all travel stories for the authenticated user
  const getAllTravelStories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/get-all-stories");
      if (!response.data.error) {
        setStories(response.data.stories);
      } else {
        console.error("Error fetching stories:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load user info and stories on component mount
  useEffect(() => {
    getUserInfo();
    getAllTravelStories();
  }, []);

  // Handle toggling favorite status of a story
  const handleFavouriteClick = async (id, currentFavourite) => {
    try {
      const response = await axiosInstance.put(`/update-is-fav/${id}`, {
        isFavorite: !currentFavourite,
      });
      if (!response.data.error) {
        getAllTravelStories();
        toast.success("Favourite status updated!");
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
      toast.error("Failed to update favourite status.");
    }
  };

  // Handle edit button click to open the edit modal
  const handleEditClick = (story) => {
    setEditStory(story);
  };

  // Handle delete button click with confirmation
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Do you really want to delete this story?")) return;
    try {
      const response = await axiosInstance.delete(`/delete-story/${id}`);
      if (!response.data.error) {
        getAllTravelStories();
        toast.success("Story deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete story.");
      }
    } catch (error) {
      console.error(
        "Error deleting story:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to delete story.");
    }
  };

  return (
    <div className="bg-zinc-900 min-h-screen p-4 sm:p-6">
      {/* Stories grid with responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          <p className="text-zinc-400 text-center col-span-full">
            Loading stories...
          </p>
        ) : stories.length === 0 ? (
          <p className="text-zinc-400 text-center col-span-full">
            No stories found.
          </p>
        ) : (
          stories.map((story) => (
            <div
              key={story._id}
              className="transform hover:scale-105 transition-all duration-200"
            >
              <TravelStoryCard
                id={story._id}
                imageUrl={story.imageUrl}
                title={story.title}
                date={new Date(story.visitedDate).toLocaleDateString()}
                story={story.story}
                visitedLocation={story.visitedLocation}
                isFavourite={story.isFavorite}
                userId={story.userId} // Pass userId for ownership check
                currentUserId={currentUserId} // Pass current user ID
                onFavouriteClick={() =>
                  handleFavouriteClick(story._id, story.isFavorite)
                }
                onEditClick={() => handleEditClick(story)}
                onDeleteClick={() => handleDeleteClick(story._id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Edit story modal */}
      {editStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-lg max-w-lg w-full mx-4 sm:mx-auto">
            <AddEditTravelStory
              storyInfo={editStory}
              type="edit"
              onClose={() => setEditStory(null)}
              getAllTravelStories={getAllTravelStories}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelStoriesList;
