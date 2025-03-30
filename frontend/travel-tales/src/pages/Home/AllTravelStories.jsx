// File: src/pages/AllTravelStories.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axiosInstance from "../../utils/axiosInstance";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState({
    isShown: false,
    storyId: null,
  });

  // Fetch user info and stories on mount
  useEffect(() => {
    Modal.setAppElement("#root");

    // Test connectivity to the backend
    const checkConnectivity = async () => {
      const isConnected = await axiosInstance.testConnectivity();
      if (!isConnected) {
        setError(
          "Cannot connect to the server. Please ensure the backend is running."
        );
        setLoading(false);
        return;
      }

      // If connected, proceed with fetching data
      getUserInfo();
      getAllTravelStories();
    };

    checkConnectivity();
  }, []);

  // Handle user logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Fetch user information
  const getUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data?.user) {
        setUserInfo(response.data.user);
      } else {
        throw new Error("User data not found.");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setError("Failed to fetch user information. Please try again.");
      if (error.status === 401) handleLogout();
    }
  };

  // Fetch all travel stories from all users
  const getAllTravelStories = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = filters;
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const response = await axiosInstance.get("/get-all-user-all-story", {
        params,
      });
      if (response.data?.stories) {
        const formattedStories = response.data.stories.map((story) => ({
          ...story,
          isFavorite: story.isFavorite ?? false,
          date: moment(story.visitedDate).format("DD MMM YYYY"),
        }));
        setAllStories(formattedStories);
      } else {
        throw new Error("No stories found.");
      }
    } catch (error) {
      console.error("Error fetching travel stories:", error);
      setError(
        "Failed to load travel stories. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status of a story
  const toggleFavourite = async (id, currentFavStatus) => {
    try {
      setAllStories((prevStories) =>
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
    }
  };

  // Handle card click to open story details modal
  const handleCardClick = (id) => {
    setOpenDetailsModal({ isShown: true, storyId: id });
  };

  // Handle edit button click from story details modal
  const handleEditClick = (story) => {
    // Only the owner can edit the story, so redirect to the dashboard if it's the user's story
    if (story.userId?._id === userInfo?._id) {
      navigate("/dashboard", { state: { storyToEdit: story } });
    }
  };

  // Handle delete button click from story details modal
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Do you really want to delete this story?")) return;

    try {
      const response = await axiosInstance.delete(`/delete-story/${id}`);
      if (!response.data.error) {
        setAllStories((prevStories) =>
          prevStories.filter((story) => story._id !== id)
        );
        setOpenDetailsModal({ isShown: false, storyId: null });
        toast.success("Story deleted successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story. Please try again.");
    }
  };

  // Handle search and filter results from Navbar
  const handleSearch = (searchResults, errorMessage, filters) => {
    if (errorMessage) {
      setError(errorMessage);
      setAllStories([]);
      return;
    }

    if (searchResults.length > 0) {
      const formattedResults = searchResults.map((story) => ({
        ...story,
        isFavorite: story.isFavorite ?? false,
        date: moment(story.visitedDate).format("DD MMM YYYY"),
      }));
      setAllStories(formattedResults);
      setError(null);
    } else {
      getAllTravelStories(filters);
    }
  };

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
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => {
                  getUserInfo();
                  getAllTravelStories();
                }}
                className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {allStories.length > 0 ? (
                allStories.map((item) => (
                  <div
                    key={item._id}
                    className="transform hover:scale-105 transition-all duration-200"
                  >
                    <TravelStoryCard
                      id={item._id}
                      imageUrl={item.imageUrls}
                      title={item.title}
                      date={item.date}
                      story={item.story}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavorite}
                      userId={item.userId?._id || item.userId}
                      currentUserId={userInfo?._id}
                      onFavouriteClick={() =>
                        toggleFavourite(item._id, item.isFavorite)
                      }
                      onCardClick={handleCardClick}
                      onEditClick={() => handleEditClick(item)}
                      onDeleteClick={() => handleDeleteClick(item._id)}
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
        {selectedStory && (
          <StoryDetailsModal
            story={selectedStory}
            onClose={() =>
              setOpenDetailsModal({ isShown: false, storyId: null })
            }
            onEditClick={() => handleEditClick(selectedStory)}
            onDeleteClick={() => handleDeleteClick(selectedStory._id)}
            onFavouriteClick={() =>
              toggleFavourite(selectedStory._id, selectedStory.isFavorite)
            }
            currentUserId={userInfo?._id}
          />
        )}
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default AllTravelStories;
