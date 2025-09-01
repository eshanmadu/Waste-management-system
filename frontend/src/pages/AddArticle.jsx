import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

// Success Modal component
const SuccessModal = ({ onClose, onSubmitAnother }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thanks for sharing your insights. Your article has been successfully submitted and is now in the review queue. You'll be notified once it's approved and published.
          </p>
          <p className="text-gray-500 mb-6">
            Want to submit another? Click below.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onSubmitAnother}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Submit Another
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddArticlePage = () => {
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    excerpt: "",
    content: "",
    date: "",
    category: "",
    author: "",
  });
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (token && userData) {
        setIsAuthenticated(true);
        // Set the author field with the user's full name
        setFormData(prev => ({
          ...prev,
          author: `${userData.firstName} ${userData.lastName}`
        }));
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Handle image URL validation
    if (name === 'image') {
      setImageError("");
      setImagePreview(value);
      
      // Basic URL validation
      try {
        new URL(value);
      } catch (err) {
        setImageError("Please enter a valid image URL");
      }
    }
  };

  // Function to add article submission notification
  const addArticleSubmissionNotification = (articleTitle) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const notification = {
      id: Date.now(),
      message: `Your article "${articleTitle}" has been submitted and is pending review. We will notify you once it's approved.`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/articles',
      userId: user.userId
    };

    // Get existing notifications or initialize empty array
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Add new notification
    const updatedNotifications = [notification, ...existingNotifications];
    
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // Dispatch event to update notifications in header
    window.dispatchEvent(new CustomEvent('notificationUpdate', {
      detail: { notifications: updatedNotifications, unreadCount: 1 }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imageError) {
      return; // Don't submit if there's an image error
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch("http://localhost:5001/api/articles/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add article");
      }
  
      const data = await response.json();
      console.log("Article added:", data);
      
      // Add notification for article submission
      addArticleSubmissionNotification(formData.title);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmitAnother = () => {
    // Reset form and close modal
    setFormData(prevData => ({
      title: "",
      image: "",
      excerpt: "",
      content: "",
      date: "",
      category: "",
      author: prevData.author, // Keep only the author name
    }));
    setShowSuccessModal(false);
    
    // Reset form fields in the DOM
    const form = document.querySelector('form');
    if (form) {
      form.reset();
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/articles");
  };

  // Category options for the dropdown
  const categoryOptions = [
    "General waste management",
    "Recycling and waste diversion",
    "Waste reduction",
    "Composting and Organic waste management",
    "E-Waste management",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex justify-center w-full min-h-screen py-12 mt-12 bg-cover bg-center relative">
      {/* Overlay to improve text readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-md relative z-10">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Add New Article</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
          <div>
            <input
              type="text"
              name="image"
              placeholder="Image URL"
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${imageError ? 'border-red-500' : ''}`}
              required
            />
            {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
            {imagePreview && !imageError && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-md"
                  onError={() => setImageError("Invalid image URL or image cannot be loaded")}
                />
              </div>
            )}
          </div>
          <textarea
            name="excerpt"
            placeholder="Excerpt (Short summary)"
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          ></textarea>
          <textarea
            name="content"
            placeholder="Full Article Content"
            onChange={handleChange}
            className="w-full p-2 border rounded-md h-64"
            required
          ></textarea>
          <input
            type="date"
            name="date"
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
          {/* Category Dropdown */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categoryOptions.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            readOnly
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          onClose={handleCloseModal}
          onSubmitAnother={handleSubmitAnother}
        />
      )}
    </div>
  );
};

export default AddArticlePage;