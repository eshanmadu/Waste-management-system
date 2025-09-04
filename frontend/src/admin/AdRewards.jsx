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
  FiBell,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFileText,
  FiCalendar
} from "react-icons/fi";
import { FaRecycle, FaLeaf } from "react-icons/fa";

const AdRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editReward, setEditReward] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    points: '',
    description: '',
    image: ''
  });

  // Fetch rewards from backend
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch('https://waste-management-system-88cb.onrender.com/api/rewards');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched rewards:", data);
        setRewards(data); 
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };
    
    fetchRewards();
  }, []);
  

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editReward ? `https://waste-management-system-88cb.onrender.com/api/rewards/${editReward._id}` : 'https://waste-management-system-88cb.onrender.com/api/rewards';
      const method = editReward ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Operation failed');

      setShowAddForm(false);
      setEditReward(null);
      setFormData({ name: '', points: '', description: '', image: '' });
      
      // Refresh rewards list
      const updatedResponse = await fetch('https://waste-management-system-88cb.onrender.com/api/rewards');
      const updatedData = await updatedResponse.json();
      setRewards(updatedData);
    } catch (error) {
      console.error('Error saving reward:', error);
    }
  };

  const handleEdit = (reward) => {
    setEditReward(reward);
    setFormData(reward);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/rewards/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      setRewards(rewards.filter(reward => reward._id !== id));
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  // Sidebar navigation 
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
                        ${index === 7 ? 'bg-green-700' : 'hover:bg-green-600'}`}
                    >
                      {item.icon}
                      {item.name}
                      {index !== 7 && <FiChevronRight className="ml-auto h-4 w-4 opacity-50" />}
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white w-full">
                  Manage Rewards ({rewards.length})
                </h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
                >
                  <FiPlus className="mr-2" />
                  {showAddForm ? 'Cancel' : 'Add New Reward'}
                </button>
              </div>

              {showAddForm && (
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Reward Name */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Reward Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
            
                {/* Points Required */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Points Required</label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>
            
                {/* Description */}
                <div className="mb-4 col-span-2">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  />
                </div>
            
                {/* Image URL */}
                <div className="mb-4 col-span-2">
                  <label className="block text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="https://example.com/image.jpg"
                    pattern="https?://.*"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editReward ? 'Update Reward' : 'Add Reward'}
              </button>
            </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div key={reward._id} className="bg-white p-6 rounded-lg shadow-md">
                    <img src={reward.image} alt={reward.name} className="w-full h-48 object-cover mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{reward.name}</h3>
                    <p className="text-gray-600 mb-2">{reward.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-500 font-bold">{reward.points} Points</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(reward)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(reward._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdRewards;