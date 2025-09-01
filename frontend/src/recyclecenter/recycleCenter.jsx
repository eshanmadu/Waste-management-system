import React, { useState, useEffect } from "react";
import { 
  FaRecycle, 
  FaChartLine, 
  FaUsers, 
  FaWeightHanging,
  FaCalendarAlt,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import debounce from 'lodash.debounce';

const RecycleCenter = () => {
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [recyclingCenter, setRecyclingCenter] = useState("");
  const [dateTime, setDateTime] = useState(null);
  const [dateError, setDateError] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Add new state for statistics
  const [stats, setStats] = useState({
    totalRecycled: 0,
    totalUsers: 0,
    totalEntries: 0,
    recentActivity: []
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  //user search
  const debouncedSearch = debounce(async (searchTerm) => {
    try {
      const response = await fetch(`http://localhost:5001/api/recycle/users/search?search=${searchTerm}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  }, 300);

  useEffect(() => {
    if (userSearch.trim()) {
      debouncedSearch(userSearch);
    } else {
      setUsers([]);
    }
    return () => debouncedSearch.cancel();
  }, [userSearch]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setTableLoading(true);
      try {
        const response = await fetch("http://localhost:5001/api/recycle");
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch submissions");
        }

        if (data.success) {
          const formattedSubmissions = data.data.map(sub => ({
            ...sub,
            dateTime: sub.dateTime 
          }));
          setRecentSubmissions(formattedSubmissions);
        } else {
          throw new Error(data.message || "Failed to fetch submissions");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        alert(error.message || "Failed to fetch submissions");
      } finally {
        setTableLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  // Calculate statistics from submissions
  useEffect(() => {
    if (recentSubmissions.length > 0) {
      const totalRecycled = recentSubmissions.reduce((sum, sub) => sum + sub.quantity, 0);
      const uniqueUsers = new Set(recentSubmissions.map(sub => sub.userId)).size;
      const recentActivity = recentSubmissions.slice(0, 5);

      setStats({
        totalRecycled: totalRecycled.toFixed(2),
        totalUsers: uniqueUsers,
        totalEntries: recentSubmissions.length,
        recentActivity
      });
    }
  }, [recentSubmissions]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setName(`${user.firstName} ${user.lastName}`);
    setPhone(user.phoneNumber);
    setUsers([]);
    setUserSearch('');
  };

  // Add date validation function
  const validateDate = (date) => {
    const now = new Date();
    const selectedDate = new Date(date);
    
    // Reset error
    setDateError("");
    
    // Check if date is in the future
    if (selectedDate > now) {
      setDateError("Cannot select a future date and time");
      return false;
    }
    
    return true;
  };

  // Function to add recycling notification
  const addRecyclingNotification = (recyclingData) => {
    console.log('=== Starting Notification Creation ===');
    console.log('Selected user data:', selectedUser);
    
    const notification = {
      id: Date.now(),
      message: `New recycling entry: ${recyclingData.wasteType} (${recyclingData.quantity} kg)`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/recyclecenter',
      email: selectedUser.email // Use email instead of userId
    };
    console.log('Created notification object:', notification);

    // Get existing notifications or initialize empty array
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    console.log('Existing notifications:', existingNotifications);
    
    // Add new notification
    const updatedNotifications = [notification, ...existingNotifications];
    console.log('Updated notifications array:', updatedNotifications);
    
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    console.log('Saved notifications to localStorage');
    
    // Dispatch event to update notifications in header
    const event = new CustomEvent('notificationUpdate', {
      detail: { notifications: updatedNotifications }
    });
    console.log('Dispatching notification update event:', event);
    window.dispatchEvent(event);
    console.log('=== Notification Creation Complete ===');
  };

  // Modify the handleSubmit function to include date validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!selectedUser || !wasteType || !quantity || !recyclingCenter || !dateTime) {
        throw new Error("Please fill in all required fields");
      }

      // Validate date
      if (!validateDate(dateTime)) {
        throw new Error(dateError);
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId 
        ? `http://localhost:5001/api/recycle/${editingId}`
        : "http://localhost:5001/api/recycle";

      const submissionData = {
        userId: selectedUser._id,
        wasteType,
        quantity: parseFloat(quantity),
        recyclingCenter,
        dateTime: dateTime.toISOString(),
        status: "Completed",
        otp: {
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          verified: false
        }
      };

      console.log('Submitting recycling data:', submissionData);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Submission failed");
      }

      // Add notification for new recycling entry
      if (!editingId) {
        console.log('Adding notification for new recycling entry');
        console.log('Submission data for notification:', submissionData);
        addRecyclingNotification({
          ...submissionData,
          userId: selectedUser._id // Ensure we pass the correct userId
        });
      }

      if (editingId) {
        const updatedSubmissions = recentSubmissions.map(sub =>
          sub._id === result.data._id ? {
            ...result.data,
            userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
            userPhone: selectedUser.phoneNumber,
            dateTime: result.data.dateTime
          } : sub
        );
        setRecentSubmissions(updatedSubmissions);
        setSuccessMessage("Recycling entry updated successfully!");
      } else {
        const newSubmission = {
          ...result.data,
          userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          userPhone: selectedUser.phoneNumber,
          dateTime: result.data.dateTime
        };
        setRecentSubmissions([newSubmission, ...recentSubmissions]);
        setSuccessMessage("Recycling entry added successfully!");
      }

      // Show success modal
      setShowSuccessModal(true);

      // Reset form
      setSelectedUser(null);
      setName("");
      setPhone("");
      setWasteType("");
      setQuantity("");
      setRecyclingCenter("");
      setDateTime(null);
      setEditingId(null);
      setUserSearch('');
      setDateError("");

    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 pt-24">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Success!
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-center text-green-700 mb-6 flex items-center justify-center">
              <FaRecycle className="mr-3" /> Recycle Center Dashboard
            </h1>
            <p className="text-center text-gray-600 text-lg mb-8">
              Manage recycling operations and track waste collection
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaWeightHanging className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Total Recycled</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalRecycled} kg</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaUsers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaChartLine className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Total Entries</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Section */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaEdit className="mr-2" />
                {editingId ? "Edit Recycling Entry" : "Add New Recycling Entry"}
              </h2>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 items-center">
                  <FaSearch className="mr-2" /> Search User
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  {users.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleUserSelect(user)}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Waste Type</label>
                  <select
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Waste Type</option>
                    <option value="Plastic">Plastic</option>
                    <option value="Paper">Paper</option>
                    <option value="Glass">Glass</option>
                    <option value="Metal">Metal</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Recycling Center</label>
                  <select
                    value={recyclingCenter}
                    onChange={(e) => setRecyclingCenter(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Center</option>
                    <option value="Central Recycling Center">Central Recycling Center</option>
                    <option value="North Recycling Center">North Recycling Center</option>
                    <option value="South Recycling Center">South Recycling Center</option>
                    <option value="East Recycling Center">East Recycling Center</option>
                    <option value="West Recycling Center">West Recycling Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Date & Time</label>
                  <DatePicker
                    selected={dateTime}
                    onChange={(date) => {
                      setDateTime(date);
                      validateDate(date);
                    }}
                    showTimeSelect
                    dateFormat="Pp"
                    maxDate={new Date()}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      dateError ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {dateError && (
                    <p className="mt-1 text-sm text-red-600">{dateError}</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : (editingId ? "Update Entry" : "Add Entry")}
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2" /> Recent Activity
              </h2>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <FaCheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{activity.userName}</p>
                      <p className="text-sm text-gray-600">
                        Recycled {activity.quantity}kg of {activity.wasteType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.dateTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaRecycle className="mr-2" /> Recycling Entries
                </h2>
                <div className="text-sm text-gray-600">
                  Total: {recentSubmissions.length} entries
                </div>
              </div>

              {tableLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
              ) : recentSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No entries found</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by adding a new recycling entry.</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 text-left text-sm font-semibold text-gray-600">Name</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-600">Waste Type</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-600">Quantity</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-600">Center</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentSubmissions.map((submission) => (
                        <tr key={submission._id} className="hover:bg-gray-50">
                          <td className="p-4 text-sm text-gray-900">{submission.userName}</td>
                          <td className="p-4 text-sm text-gray-900">{submission.userPhone}</td>
                          <td className="p-4 text-sm text-gray-900">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {submission.wasteType}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-900">{submission.quantity} kg</td>
                          <td className="p-4 text-sm text-gray-900">{submission.recyclingCenter}</td>
                          <td className="p-4 text-sm text-gray-900">
                            {new Date(submission.dateTime).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingId(submission._id);
                                  setSelectedUser({
                                    _id: submission.userId,
                                    firstName: submission.userName.split(' ')[0],
                                    lastName: submission.userName.split(' ')[1],
                                    phoneNumber: submission.userPhone
                                  });
                                  setName(submission.userName);
                                  setPhone(submission.userPhone);
                                  setWasteType(submission.wasteType);
                                  setQuantity(submission.quantity);
                                  setRecyclingCenter(submission.recyclingCenter);
                                  setDateTime(new Date(submission.dateTime));
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this entry?')) {
                                    try {
                                      const response = await fetch(`http://localhost:5001/api/recycle/${submission._id}`, {
                                        method: 'DELETE'
                                      });
                                      const result = await response.json();
                                      if (result.success) {
                                        setRecentSubmissions(recentSubmissions.filter(sub => sub._id !== submission._id));
                                      } else {
                                        throw new Error(result.message || 'Failed to delete entry');
                                      }
                                    } catch (error) {
                                      console.error('Delete error:', error);
                                      alert(error.message || 'Failed to delete entry');
                                    }
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecycleCenter;
