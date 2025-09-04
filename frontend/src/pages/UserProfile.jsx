import React, { useState, useEffect } from "react";
import { FaUserCircle, FaLeaf, FaPlus, FaCheckCircle, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaRecycle, FaTrash, FaEdit, FaLock, FaTrophy, FaMedal } from 'react-icons/fa';
import { MdVolunteerActivism } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [reports, setReports] = useState([]);
  const [wasteReports, setWasteReports] = useState([]);
  const [recyclingActivities, setRecyclingActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [showAllRecycling, setShowAllRecycling] = useState(false);
  const [showAllWasteReports, setShowAllWasteReports] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [points, setPoints] = useState(0);
  const [currentBadge, setCurrentBadge] = useState({ name: "Eco Explorer", color: "blue-500" });
  const [redeemPoints, setRedeemPoints] = useState(0);
 
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState(null);
  
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  const navigate = useNavigate();

  const fetchUserReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        setError("No token or userId found, authentication failed!");
        return;
      }

      console.log("Fetching reports for user:", userId);

      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/report/reports/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.message || 'Failed to fetch reports'}`);
      }

      const data = await response.json();
      console.log("Raw response data:", data);

      if (Array.isArray(data)) {
        // Sort by date and get the 5 most recent
        const recentReports = data
          .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
          .slice(0, 5);
        
        console.log("Processed reports:", recentReports);
        setReports(recentReports);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error in fetchUserReports:", error);
      setError(error.message || "Failed to fetch reports.");
      setReports([]); // Reset reports to empty array on error
    }
  };

  const handlePasswordSubmit = async () => {
    // Clear previous errors
    setPasswordError("");
  
    // client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
  
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
  
    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }
  
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
  
    if (!token || !userId) {
      setPasswordError("Authentication error: Please log in again.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://waste-management-system-88cb.onrender.com/api/users/${userId}/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: newPassword
          }),
        }
      );
  
      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error("Invalid server response");
      }
  
      if (!response.ok) {
        throw new Error(data.msg || "Password change failed");
      }
  
      // Clear form on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Show success message and redirect to login
      alert("Password changed successfully! Please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError(
        error.message.includes("Invalid server response")
          ? "Server error - please try again later"
          : error.message
      );
    }
  };
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
  
    if (!token || !userId) {
      setError("No token or userId found, authentication failed!");
      setLoading(false);
      return;
    }
  
    try {
      
      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Unauthorized`);
      }
  
      const data = await response.json();
      setUserData(data);
      setEditedData({...data}); // Initialize editedData with current data
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Failed to fetch user profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecyclingActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        setError("No token or userId found, authentication failed!");
        return;
      }

      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/recycle/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch recycling activities`);
      }

      const data = await response.json();
      setRecyclingActivities(data.data || []);
    } catch (error) {
      console.error("Error fetching recycling activities:", error);
      setError(error.message || "Failed to fetch recycling activities.");
    }
  };

  const fetchWasteReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        setError("No token or userId found, authentication failed!");
        return;
      }

      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/report/reports/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch waste reports`);
      }

      const data = await response.json();
      setWasteReports(data || []);
    } catch (error) {
      console.error("Error fetching waste reports:", error);
      setError(error.message || "Failed to fetch waste reports.");
    }
  };

  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        setError("No token or userId found, authentication failed!");
        return;
      }

      // First get all events
      const response = await fetch('https://waste-management-system-88cb.onrender.com/api/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch events`);
      }

      const allEvents = await response.json();
      
      // Filter events where the user is a participant
      const userEvents = allEvents.filter(event => {
        if (!event.participants || !Array.isArray(event.participants)) {
          return false;
        }
        
        return event.participants.some(participant => {
          if (!participant) return false;
          return (
            (participant.userId && participant.userId === userId) ||
            (participant.volunteerId && participant.volunteerId === userId)
          );
        });
      });

      setEvents(userEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.message || "Failed to fetch events.");
    }
  };

  const checkVolunteerStatus = async (userId) => {
    try {
      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/volunteers/user/${userId}`);
      if (response.ok) {
        const volunteerData = await response.json();
        setIsVolunteer(true);
        setVolunteerStatus(volunteerData.status);
      } else {
        setIsVolunteer(false);
        setVolunteerStatus(null);
      }
    } catch (error) {
      console.error('Error checking volunteer status:', error);
      setIsVolunteer(false);
      setVolunteerStatus(null);
    }
  };

  // Add useEffect to refresh waste reports periodically
  useEffect(() => {
    fetchWasteReports();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWasteReports, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchUserReports();
    fetchRecyclingActivities();
    fetchUserEvents();
  }, []);

  useEffect(() => {
    if (userData) {
      setPoints(userData.totalPoints || 0);
      setRedeemPoints(userData.redeemPoints || 0);
      setCurrentBadge(getBadge(userData.totalPoints || 0));
      checkVolunteerStatus(userData.userId);
    }
  }, [userData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({...userData}); // Reset to original data
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Add validation for firstName and lastName
    if (name === 'firstName' || name === 'lastName') {
      if (/[^A-Za-z\s]/.test(value)) {
        setNameError("Name can only contain letters and spaces");
        return;
      } else {
        setNameError("");
      }
    }

    // Add validation for email
    if (name === 'email') {
      if (!value.includes('@') || !value.includes('.')) {
        setEmailError("Please enter a valid email address");
        return;
      } else {
        setEmailError("");
      }
    }

    // Add validation for phone number
    if (name === 'phoneNumber') {
      if (!/^\d{0,10}$/.test(value)) {
        setPhoneError("Phone number must be exactly 10 digits");
        return;
      } else {
        setPhoneError("");
      }
    }
    
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // Validate email and phone before saving
    if (editedData.email && (!editedData.email.includes('@') || !editedData.email.includes('.'))) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (editedData.phoneNumber && !/^\d{10}$/.test(editedData.phoneNumber)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    try {
      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Update failed`);
      }

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user profile.");
    }
  };

  // Function to determine badge based on points
  const getBadge = (points) => {
    if (points >= 1000) return { name: "Recycling Legend", color: "yellow-500" };
    if (points >= 500) return { name: "Planet Protector", color: "gray-400" };
    if (points >= 200) return { name: "Green Guardian", color: "amber-700" };
    return { name: "Eco Explorer", color: "blue-500" };
  };

  // Add this helper function
  const getNextBadge = (currentPoints) => {
    if (currentPoints < 200) return { name: "Green Guardian", points: 200 };
    if (currentPoints < 500) return { name: "Planet Protector", points: 500 };
    if (currentPoints < 1000) return { name: "Recycling Legend", points: 1000 };
    return { name: "Recycling Legend", points: 1000 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          No user data available
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-green-500 to-blue-500">
            <div className="absolute -bottom-20 left-4 sm:left-8">
              <div className="w-40 h-40 rounded-full bg-white p-1 shadow-xl">
                {userData?.photo ? (
                  <img src={userData.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <FaUserCircle className="w-full h-full text-gray-300" />
                )}
              </div>
            </div>
          </div>
          <div className="pt-24 pb-8 px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="space-y-2">
                          <input
                            name="firstName"
                            value={editedData.firstName || ""}
                            onChange={handleChange}
                            placeholder="First Name"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              nameError ? 'border-red-500' : ''
                            }`}
                          />
                          <input
                            name="lastName"
                            value={editedData.lastName || ""}
                            onChange={handleChange}
                            placeholder="Last Name"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              nameError ? 'border-red-500' : ''
                            }`}
                          />
                          {nameError && (
                            <p className="text-red-500 text-sm mt-1">{nameError}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {`${userData?.firstName} ${userData?.lastName}`}
                        {isVolunteer && volunteerStatus === 'approved' && (
                          <FaCheckCircle className="text-green-500" />
                        )}
                      </div>
                    )}
                  </h1>
                  {isVolunteer && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <MdVolunteerActivism className="mr-1" />
                      {volunteerStatus === 'approved' ? 'Approved Volunteer' : 'Pending Volunteer'}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-gray-600">{userData?.email}</p>
              </div>
              <div className="flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Points</p>
                <p className="text-3xl font-bold text-gray-900">{points}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaLeaf className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Redeemable Points</p>
                <p className="text-3xl font-bold text-gray-900">{redeemPoints}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FaRecycle className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Current Badge</p>
                <div className="flex items-center gap-2">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                    currentBadge.color === 'yellow-500' ? 'bg-yellow-500/10' :
                    currentBadge.color === 'gray-400' ? 'bg-gray-400/10' :
                    currentBadge.color === 'amber-700' ? 'bg-amber-700/10' :
                    'bg-blue-500/10'
                  }`}>
                    <FaLeaf className={`mr-2 ${
                      currentBadge.color === 'yellow-500' ? 'text-yellow-500' :
                      currentBadge.color === 'gray-400' ? 'text-gray-400' :
                      currentBadge.color === 'amber-700' ? 'text-amber-700' :
                      'text-blue-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      currentBadge.color === 'yellow-500' ? 'text-yellow-500' :
                      currentBadge.color === 'gray-400' ? 'text-gray-400' :
                      currentBadge.color === 'amber-700' ? 'text-amber-700' :
                      'text-blue-500'
                    }`}>
                      {currentBadge.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                {points >= 1000 ? (
                  <FaTrophy className="text-yellow-500 text-xl" />
                ) : points >= 500 ? (
                  <FaMedal className="text-gray-400 text-xl" />
                ) : points >= 200 ? (
                  <FaMedal className="text-amber-700 text-xl" />
                ) : (
                  <FaLeaf className="text-blue-500 text-xl" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  {isEditing ? (
                    <div>
                      <input
                        name="email"
                        value={editedData.email || ""}
                        onChange={handleChange}
                        className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          emailError ? 'border-red-500' : ''
                        }`}
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1">{emailError}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">{userData?.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  {isEditing ? (
                    <div>
                      <input
                        name="phoneNumber"
                        value={editedData.phoneNumber || ""}
                        onChange={handleChange}
                        className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          phoneError ? 'border-red-500' : ''
                        }`}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">{userData?.phoneNumber || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Country</label>
                  {isEditing ? (
                    <input
                      name="country"
                      value={editedData.country || ""}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData?.country || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
              {passwordError && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {passwordError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handlePasswordSubmit}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Activities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Events Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Events</h2>
                <Link 
                  to="/events"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  View All Events
                </Link>
              </div>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {(showAllEvents ? events : events.slice(0, 3)).map((event) => (
                    <div key={event._id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <FaCalendarAlt className="text-gray-400" />
                            <span className="text-gray-600 text-sm">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <FaMapMarkerAlt className="text-gray-400 ml-2" />
                            <span className="text-gray-600 text-sm">{event.location}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600 text-sm line-clamp-2">{event.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-gray-400" />
                          <span className="text-gray-600 text-sm">
                            {event.participants?.length || 0} / {event.maxParticipants} participants
                          </span>
                        </div>
                        <Link 
                          to={`/events/${event._id}`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <button
                      onClick={() => setShowAllEvents(!showAllEvents)}
                      className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {showAllEvents ? 'Show Less' : 'View More'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by joining an event.</p>
                  <div className="mt-6">
                    <Link
                      to="/events"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Browse Events
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Recycling Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Recycling Activities</h2>
                <Link 
                  to="/recycling"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  View All Activities
                </Link>
              </div>
              {recyclingActivities.length > 0 ? (
                <div className="space-y-4">
                  {(showAllRecycling ? recyclingActivities : recyclingActivities.slice(0, 3)).map((activity) => (
                    <div key={activity._id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{activity.wasteType}</h3>
                          <p className="text-gray-600 text-sm mt-1">{activity.recyclingCenter}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">+{activity.points} points</p>
                          <p className="text-gray-600 text-sm">{activity.quantity} kg</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-gray-500 text-sm">
                          {new Date(activity.dateTime).toLocaleDateString()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recyclingActivities.length > 3 && (
                    <button
                      onClick={() => setShowAllRecycling(!showAllRecycling)}
                      className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {showAllRecycling ? 'Show Less' : 'View More'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaRecycle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recycling activities</h3>
                  <p className="mt-1 text-sm text-gray-500">Start recycling to earn points.</p>
                  <div className="mt-6">
                    <Link
                      to="/recycling-otp"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Start Recycling
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Waste Reports */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Waste Reports</h2>
                <Link 
                  to="/reports"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  View All Reports
                </Link>
              </div>
              {wasteReports.length > 0 ? (
                <div className="space-y-4">
                  {(showAllWasteReports ? wasteReports : wasteReports.slice(0, 3)).map((report) => (
                    <div key={report._id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{report.wasteType}</h3>
                          <p className="text-gray-600 text-sm mt-1">{report.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 text-sm">
                            {new Date(report.reportDate).toLocaleDateString()}
                          </p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-600 text-sm line-clamp-2">{report.description}</p>
                      {report.photos && report.photos.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto">
                          {report.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo.url}
                              alt={`Report photo ${index + 1}`}
                              className="h-16 w-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {wasteReports.length > 3 && (
                    <button
                      onClick={() => setShowAllWasteReports(!showAllWasteReports)}
                      className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {showAllWasteReports ? 'Show Less' : 'View More'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaTrash className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No waste reports</h3>
                  <p className="mt-1 text-sm text-gray-500">Report waste issues in your area.</p>
                  <div className="mt-6">
                    <Link
                      to="/waste/reporting"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Report Waste
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;