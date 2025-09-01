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
  FiTruck,
  FiCheckCircle
} from "react-icons/fi";
import { FaRecycle, FaLeaf } from "react-icons/fa";

const AdRedeems = () => {
  const [redeems, setRedeems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRedeems();
  }, []);

  const fetchRedeems = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/redeem');
      if (!response.ok) throw new Error('Failed to fetch redeems');
      const data = await response.json();
      setRedeems(data);
    } catch (error) {
      console.error('Error fetching redeems:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to add redeem status notification
  const addRedeemStatusNotification = (redeem, newStatus) => {
    const notification = {
      id: Date.now(),
      message: `Redeem status updated: ${redeem.rewardName} is now ${newStatus}`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/rewards',
      userId: redeem.userId
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

  const handleStatusUpdate = async (redeemId, newStatus) => {
    try {
      // Validate status transition
      const redeem = redeems.find(r => r._id === redeemId);
      if (!redeem) {
        throw new Error('Redeem not found');
      }

      if (redeem.status === 'pending' && newStatus !== 'shipped') {
        throw new Error('Can only mark pending redeems as shipped');
      }
      if (redeem.status === 'shipped' && newStatus !== 'delivered') {
        throw new Error('Can only mark shipped redeems as delivered');
      }
      if (redeem.status === 'delivered') {
        throw new Error('Cannot update status of delivered redeems');
      }

      const response = await fetch(`http://localhost:5001/api/redeem/${redeemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedRedeem = await response.json();
      
      // Update local state
      setRedeems(redeems.map(redeem => 
        redeem._id === redeemId ? { ...redeem, status: newStatus } : redeem
      ));

      // Add notification for status change
      addRedeemStatusNotification(redeem, newStatus);

    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message);
    }
  };

  // sidebar navigation
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
        <aside className="bg-[#00897b] text-white w-64 h-auto shadow-lg transform transition-all duration-300 ease-in-out">
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
                        ${index === 3 ? 'bg-green-700' : 'hover:bg-green-600'}`}
                    >
                      {item.icon}
                      {item.name}
                      {index !== 3 && <FiChevronRight className="ml-auto h-4 w-4 opacity-50" />}
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
        <main className="flex-1 ml-0 p-6">
          <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white">
                  Redeem Requests ({redeems.length})
                </h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : redeems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No redeem requests found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Info</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {redeems.map((redeem) => (
                          <tr key={redeem._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{redeem.userName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{redeem.rewardName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{redeem.rewardPoints}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div>{redeem.shippingInfo?.name || 'N/A'}</div>
                                <div className="text-gray-500">{redeem.shippingInfo?.address || 'N/A'}</div>
                                <div className="text-gray-500">{redeem.shippingInfo?.phoneNumber || 'N/A'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${redeem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  redeem.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-green-100 text-green-800'}`}>
                                {redeem.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {redeem.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusUpdate(redeem._id, 'shipped')}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  <FiTruck className="h-5 w-5" />
                                </button>
                              )}
                              {redeem.status === 'shipped' && (
                                <button
                                  onClick={() => handleStatusUpdate(redeem._id, 'delivered')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <FiCheckCircle className="h-5 w-5" />
                                </button>
                              )}
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
        </main>
      </div>
    </div>
  );
};

export default AdRedeems;