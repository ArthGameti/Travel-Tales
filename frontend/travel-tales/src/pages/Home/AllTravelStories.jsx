// File: src/pages/Home/AllTravelStories.jsx
// Displays travel stories from all users with search and filter
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar";
import TravelStoryCard from "../../components/TravelStoryCard";
import StoryDetailsModal from "../../components/StoryDetailsModal";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

const AllTravelStories = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState({
    isShown: false,
    storyId: null,
  });

  // Fetch user info and stories on mount
  useEffect(() => {
    Modal.setAppElement("#root");
    getUserInfo();
    getAllUserStories();
  }, []);

  // Fetch user information
  const getUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data?.user) setUserInfo(response.data.user);
    } catch (error) {
      console.error("Error fetching user info:", error);
      if (error.status === 401) handleLogout();
    }
  };

  // Fetch all stories from all users
  const getAllUserStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/get-all-user-all-story");
      if (response.data?.stories) {
        const formattedStories = response.data.stories.map((story) => ({
          ...story,
          isFavorite: story.isFavorite ?? false,
          date: moment(story.visitedDate).format("DD MMM YYYY"),
        }));
        setAllStories(formattedStories);
        setFilteredStories(formattedStories);
      }
    } catch (error) {
      console.error("Error fetching all user stories:", error);
      setError(
        error.message || "Failed to load travel stories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Toggle favorite status of a story
  const toggleFavourite = async (id, currentFavStatus) => {
    try {
      setAllStories((prevStories) =>
        prevStories.map((story) =>
          story._id === id ? { ...story, isFavorite: !currentFavStatus } : story
        )
      );
      setFilteredStories((prevStories) =>
        prevStories.map((story) =>
          story._id === id ? { ...story, isFavorite: !currentFavStatus } : story
        )
      );

      const response = await axiosInstance.put(`/update-is-fav/${id}`, {
        isFavorite: !currentFavStatus,
      });

      if (!response.data.story) throw new Error("Update failed");

      toast[currentFavStatus ? "info" : "success"](
        currentFavStatus
          ? "Removed from Favorites. ❌"
          : "Added to Favorites! ❤️",
        { position: "top-right", autoClose: 2000 }
      );
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Failed to update favorite. Please try again.");
      setAllStories((prevStories) =>
        prevStories.map((story) =>
          story._id === id ? { ...story, isFavorite: currentFavStatus } : story
        )
      );
      setFilteredStories((prevStories) =>
        prevStories.map((story) =>
          story._id === id ? { ...story, isFavorite: currentFavStatus } : story
        )
      );
    }
  };

  // Handle card click to open story details modal
  const handleCardClick = (id) => {
    setOpenDetailsModal({ isShown: true, storyId: id });
  };

  // Handle search/filter results from Navbar
  const handleSearch = (searchResults, errorMessage) => {
    if (errorMessage) {
      setError(errorMessage);
      setFilteredStories(allStories); // Reset to all stories on error
      return;
    }

    if (searchResults.length === 0) {
      setFilteredStories(allStories);
      setError(null);
    } else {
      try {
        const formattedResults = searchResults.map((story) => ({
          ...story,
          isFavorite: story.isFavorite ?? false,
          date: moment(story.visitedDate).format("DD MMM YYYY"),
        }));
        setFilteredStories(formattedResults);
        setError(null);
      } catch (error) {
        console.error("Error formatting search/filter results:", error);
        setError("Failed to apply search/filter. Please try again.");
      }
    }
  };

  // Find selected story from allStories to avoid issues with filtered results
  const selectedStory = allStories.find(
    (story) => story._id === openDetailsModal.storyId
  );

  return (
    <div className="bg-zinc-900 min-h-screen">
      <ToastContainer />
      <Navbar
        userInfo={userInfo}
        onLogOut={handleLogout}
        onSearch={handleSearch}
      />
      <div className="container mx-auto py-8 sm:py-10 px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-5xl">
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 text-center mb-6">
            All Travel Stories
          </h1>
          {loading ? (
            <p className="text-zinc-400 text-center">Loading stories...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {filteredStories.length > 0 ? (
                filteredStories.map((item) => (
                  <div
                    key={item._id}
                    className="transform hover:scale-105 transition-all duration-200"
                  >
                    <TravelStoryCard
                      id={item._id}
                      imageUrl={item.imageUrl}
                      title={item.title}
                      date={item.date}
                      story={item.story}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavorite}
                      userId={item.userId?._id}
                      currentUserId={userInfo?._id}
                      onFavouriteClick={() =>
                        toggleFavourite(item._id, item.isFavorite)
                      }
                      onCardClick={handleCardClick}
                    />
                  </div>
                ))
              ) : (
                <p className="text-zinc-400 text-center col-span-full">
                  No stories available.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Story Details Modal */}
      <Modal
        isOpen={openDetailsModal.isShown}
        onRequestClose={() =>
          setOpenDetailsModal({ isShown: false, storyId: null })
        }
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1000 },
        }}
        className="w-[90vw] md:w-[50%] h-[85vh] bg-zinc-800 rounded-lg mx-auto mt-8 sm:mt-10 p-4 sm:p-6 overflow-y-auto"
      >
        {selectedStory ? (
          <StoryDetailsModal
            story={selectedStory}
            onClose={() =>
              setOpenDetailsModal({ isShown: false, storyId: null })
            }
            onFavouriteClick={() =>
              toggleFavourite(selectedStory._id, selectedStory.isFavorite)
            }
            currentUserId={userInfo?._id}
          />
        ) : (
          <p className="text-zinc-400 text-center">Story not found.</p>
        )}
      </Modal>
    </div>
  );
};

export default AllTravelStories;
