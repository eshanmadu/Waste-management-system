import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { 
  FiHome, 
  FiAlertCircle, 
  FiUsers, 
  FiAward, 
  FiUser, 
  FiLogOut,
  FiChevronRight,
  FiGift,
  FiBarChart2,
  FiFileText,
  FiCalendar,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter
} from "react-icons/fi";
import { FaRecycle, FaLeaf } from "react-icons/fa";

const AdUsers = () => {
  const [users, setUsers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, users, volunteers
  const [showVolunteerDetails, setShowVolunteerDetails] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [displayedUsers, setDisplayedUsers] = useState(5); // Number of users to display
  const [displayedVolunteers, setDisplayedVolunteers] = useState(5); // Number of volunteers to display

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, volunteersResponse] = await Promise.all([
        fetch('https://waste-management-system-88cb.onrender.com/api/users'),
        fetch('https://waste-management-system-88cb.onrender.com/api/volunteers')
      ]);

      if (!usersResponse.ok || !volunteersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const usersData = await usersResponse.json();
      const volunteersData = await volunteersResponse.json();

      setUsers(usersData);
      setVolunteers(volunteersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to add volunteer status notification
  const addVolunteerStatusNotification = (volunteer, status) => {
    console.log('Creating notification for volunteer:', volunteer);
    const notification = {
      id: Date.now(),
      message: `Your volunteer application has been ${status}. ${status === 'approved' ? 'Welcome to the team!' : 'Please try again later.'}`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/volunteer',
      userId: String(volunteer.userId) // Ensure userId is a string
    };

    // Get existing notifications or initialize empty array
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    console.log('Existing notifications:', existingNotifications);
    
    // Add new notification
    const updatedNotifications = [notification, ...existingNotifications];
    console.log('Updated notifications:', updatedNotifications);
    
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // Dispatch event to update notifications in header
    const event = new CustomEvent('notificationUpdate', {
      detail: { notifications: updatedNotifications }
    });
    console.log('Dispatching notification update event:', event);
    window.dispatchEvent(event);
  };

  const handleApproveVolunteer = async (volunteerId) => {
    try {
      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/volunteers/${volunteerId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve volunteer');
      }

      // Find the volunteer to get their details
      const volunteer = volunteers.find(vol => vol._id === volunteerId);
      
      // Update local state
      setVolunteers(volunteers.map(vol => 
        vol._id === volunteerId ? { ...vol, status: 'approved' } : vol
      ));

      // Add notification for approval
      if (volunteer) {
        addVolunteerStatusNotification(volunteer, 'approved');
      }

    } catch (error) {
      console.error('Error approving volunteer:', error);
      setError(error.message);
    }
  };

  const handleRejectVolunteer = async (volunteerId) => {
    try {
      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/volunteers/${volunteerId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject volunteer');
      }

      // Find the volunteer to get their details
      const volunteer = volunteers.find(vol => vol._id === volunteerId);
      
      // Update local state
      setVolunteers(volunteers.map(vol => 
        vol._id === volunteerId ? { ...vol, status: 'rejected' } : vol
      ));

      // Add notification for rejection
      if (volunteer) {
        addVolunteerStatusNotification(volunteer, 'rejected');
      }

    } catch (error) {
      console.error('Error rejecting volunteer:', error);
      setError(error.message);
    }
  };

  const handleShowMoreUsers = () => {
    setDisplayedUsers(prev => prev + 5);
  };

  const handleShowMoreVolunteers = () => {
    setDisplayedVolunteers(prev => prev + 5);
  };

  const handleShowLessUsers = () => {
    setDisplayedUsers(5);
  };

  const handleShowLessVolunteers = () => {
    setDisplayedVolunteers(5);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/users/${userId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        // Update local state 
        setUsers(users.filter(user => user.userId !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.message);
      }
    }
  };

  const filteredData = () => {
    let filteredUsers = users;
    let filteredVolunteers = volunteers;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredUsers = users.filter(user => 
        (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phoneNumber.toLowerCase().includes(searchLower)
      );
      filteredVolunteers = volunteers.filter(volunteer =>
        volunteer.name.toLowerCase().includes(searchLower) ||
        volunteer.email.toLowerCase().includes(searchLower) ||
        volunteer.phone.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filter === 'users') {
      return { users: filteredUsers, volunteers: [] };
    } else if (filter === 'volunteers') {
      return { users: [], volunteers: filteredVolunteers };
    }

    return { users: filteredUsers, volunteers: filteredVolunteers };
  };

  // Sort users by most recent
  const sortedUsers = [...filteredData().users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const displayedUsersList = sortedUsers.slice(0, displayedUsers);
  
  // Sort volunteers by most recent
  const sortedVolunteers = [...filteredData().volunteers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const displayedVolunteersList = sortedVolunteers.slice(0, displayedVolunteers);

  const navItems = [
    { name: "Dashboard", path: "/admin/admin1", icon: <FiHome className="h-5 w-5 mr-2" /> },
    { name: "Waste Reports", path: "/admin/waste-reports", icon: <FiAlertCircle className="h-5 w-5 mr-2 opacity-70" /> },
    { name: "Waste Recycles", path: "/admin/adrecycles", icon: <FaRecycle className="h-5 w-5 mr-2 opacity-70" />},
    { name: "Redeems", path: "/admin/redeems", icon: <FiAward className="h-5 w-5 mr-2 opacity-70" /> },
    { name: "Users & Volunteers", path: "/admin/users", icon: <FiUsers className="h-5 w-5 mr-2 opacity-70" /> },
    { name: "Staff Management", path: "/admin/staff", icon: <FiUser className="h-5 w-5 mr-2 opacity-70" /> },
    { name: "Articles", path: "/admin/articles", icon: <FiFileText className="h-5 w-5 mr-2 opacity-70" /> },
    { name: "Redeem Items", path: "/admin/add-rewards", icon: <FiGift className="h-5 w-5 mr-2 opacity-70" /> },
    { name: "Events", path: "/admin/events", icon: <FiCalendar className="h-5 w-5 mr-2 opacity-70" /> },
    { name: "Reports", path: "/admin/reports", icon: <FiBarChart2 className="h-5 w-5 mr-2 opacity-70" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="bg-[#00897b] text-white w-64 h-auto shadow-lg transform transition-all duration-300 ease-in-out flex-shrink-0">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <FaLeaf className="mr-2" /> Go Green 360
            </h2>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center text-white
                        ${index === 4 ? "bg-green-700" : "hover:bg-green-600"}`}
                    >
                      {item.icon}
                      {item.name}
                      {index !== 4 && (
                        <FiChevronRight className="ml-auto h-4 w-4 opacity-50" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 border-t border-white pt-4">
              <div className="flex items-center px-3 py-2 hover:bg-green-700 rounded-lg transition-colors cursor-pointer text-red-100 hover:text-white">
                <FiLogOut className="h-5 w-5 mr-2" />
                Logout
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white w-full">
                  Users & Volunteers Management
                </h2>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All</option>
                    <option value="users">Users</option>
                    <option value="volunteers">Volunteers</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Users Table */}
                  {filter !== 'volunteers' && (
                    <div>
                      <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white">
                        Users ({displayedUsersList.length})
                      </h2>
                      <div className="overflow-x-auto">
                        <div className="max-h-[400px] overflow-y-auto">
                          <table className="w-full table-fixed">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="w-1/5 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="w-1/5 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="w-1/5 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="w-1/5 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="w-1/5 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {displayedUsersList.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                  <td className="px-2 py-2 text-sm truncate">
                                    {user.firstName} {user.lastName}
                                  </td>
                                  <td className="px-2 py-2 text-sm truncate">
                                    {user.email}
                                  </td>
                                  <td className="px-2 py-2 text-sm truncate">
                                    {user.phoneNumber}
                                  </td>
                                  <td className="px-2 py-2 text-sm">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                      ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 text-sm">
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => setShowUserDetails(user)}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => handleDeleteUser(user.userId)}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {sortedUsers.length > 5 && (
                          <div className="mt-4 flex justify-center">
                            {sortedUsers.length > displayedUsers ? (
                              <button
                                onClick={handleShowMoreUsers}
                                className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                              >
                                See More
                              </button>
                            ) : (
                              <button
                                onClick={handleShowLessUsers}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                              >
                                Show Less
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Volunteers Table */}
                  {filter !== 'users' && (
                    <div>
                      <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white">
                        Volunteers ({displayedVolunteersList.length})
                      </h2>
                      <div className="overflow-x-auto">
                        <div className="max-h-[400px] overflow-y-auto">
                          <table className="w-full table-fixed">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                                <th className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="w-1/4 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                                <th className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {displayedVolunteersList.map((volunteer) => (
                                <tr key={volunteer._id} className="hover:bg-gray-50">
                                  <td className="px-2 py-2 text-sm truncate">
                                    {volunteer.name}
                                  </td>
                                  <td className="px-2 py-2 text-sm truncate">
                                    {volunteer.email}
                                  </td>
                                  <td className="px-2 py-2 text-sm truncate">
                                    {volunteer.phone}
                                  </td>
                                  <td className="px-2 py-2 text-sm truncate">
                                    {volunteer.preferredArea}
                                  </td>
                                  <td className="px-2 py-2 text-sm">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                      ${volunteer.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                        volunteer.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'}`}>
                                      {volunteer.status || 'pending'}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 text-sm">
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                      {volunteer.events && volunteer.events.length > 0 ? (
                                        volunteer.events.map((event) => (
                                          <div key={event._id} className="flex flex-col">
                                            <div className="flex items-center">
                                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {event.title}
                                              </span>
                                              <span className="ml-2 text-xs text-gray-500">
                                                ({new Date(event.date).toLocaleDateString()})
                                              </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {event.location} • {event.status}
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-xs text-gray-500">No events joined</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 text-sm">
                                    <div className="flex space-x-1">
                                      {volunteer.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => handleApproveVolunteer(volunteer._id)}
                                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                                          >
                                            <FiCheck className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => handleRejectVolunteer(volunteer._id)}
                                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                                          >
                                            <FiX className="h-4 w-4" />
                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={() => setShowVolunteerDetails(volunteer)}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                      >
                                        View
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {sortedVolunteers.length > 5 && (
                          <div className="mt-4 flex justify-center">
                            {sortedVolunteers.length > displayedVolunteers ? (
                              <button
                                onClick={handleShowMoreVolunteers}
                                className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                              >
                                See More
                              </button>
                            ) : (
                              <button
                                onClick={handleShowLessVolunteers}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                              >
                                Show Less
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">User Details</h3>
              <button
                onClick={() => setShowUserDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{showUserDetails.firstName} {showUserDetails.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{showUserDetails.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{showUserDetails.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <p className="mt-1 text-sm text-gray-900">{showUserDetails.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(showUserDetails.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm text-gray-900">{showUserDetails.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Points</label>
                  <p className="mt-1 text-sm text-gray-900">{showUserDetails.totalPoints}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Redeem Points</label>
                  <p className="mt-1 text-sm text-gray-900">{showUserDetails.redeemPoints}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferences</label>
                <div className="mt-1 text-sm text-gray-900">
                  <p>Notifications: {showUserDetails.preferences?.notifications ? 'Enabled' : 'Disabled'}</p>
                  <p>Language: {showUserDetails.preferences?.language || 'en'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Details Modal */}
      {showVolunteerDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Volunteer Details</h3>
              <button
                onClick={() => setShowVolunteerDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{showVolunteerDetails.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{showVolunteerDetails.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{showVolunteerDetails.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <p className="mt-1 text-sm text-gray-900">{showVolunteerDetails.city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Area</label>
                  <p className="mt-1 text-sm text-gray-900">{showVolunteerDetails.preferredArea}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm text-gray-900">{showVolunteerDetails.status}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <p className="mt-1 text-sm text-gray-900">{showVolunteerDetails.skills}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Motivation</label>
                <p className="mt-1 text-sm text-gray-900">{showVolunteerDetails.motivation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                <div className="mt-1 text-sm text-gray-900">
                  <p>Name: {showVolunteerDetails.emergencyContact?.name}</p>
                  <p>Phone: {showVolunteerDetails.emergencyContact?.phone}</p>
                  <p>Relation: {showVolunteerDetails.emergencyContact?.relation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdUsers;
