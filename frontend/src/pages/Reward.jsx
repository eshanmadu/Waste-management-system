import React, { useState, useEffect } from "react";
import { FaRecycle, FaInfoCircle, FaMapMarkerAlt, FaLeaf, FaGlobe, FaGift, FaShoppingBag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedeemForm, setShowRedeemForm] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [remainingPoints, setRemainingPoints] = useState(0);
  const [editingRedeem, setEditingRedeem] = useState(null);
  const [editingShippingInfo, setEditingShippingInfo] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    postalCode: "",
    city: "",
    state: ""
  });
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    postalCode: "",
    city: "",
    state: ""
  });
  const { width, height } = useWindowSize();
  const [activeTab, setActiveTab] = useState('all');
  const [userRedeems, setUserRedeems] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [redeemToCancel, setRedeemToCancel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  const fetchRewards = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/rewards");
      if (!response.ok) throw new Error("Failed to load rewards");
      const data = await response.json();
      setRewards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
  
    if (!token || !userId) {
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Unauthorized`);
      }
  
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRedeems = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      console.log('Missing token or userId');
      return;
    }

    try {
      console.log('Fetching redeems for userId:', userId);
      const response = await fetch(`http://localhost:5001/api/redeem`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch redeems`);
      }

      const data = await response.json();
      console.log('Raw redeems data:', data);
      
      // Filter redeems for the current user and ensure status is set
      const userRedeems = data
        .filter(redeem => {
          console.log('Checking redeem:', redeem);
          console.log('redeem.userId:', redeem.userId);
          console.log('current userId:', userId);
          return redeem.userId === userId;
        })
        .map(redeem => ({
          ...redeem,
          status: redeem.status || 'pending',
          rewardName: redeem.rewardName || redeem.rewardDetails?.name,
          rewardPoints: redeem.rewardPoints || redeem.rewardDetails?.points
        }));
      
      console.log('Filtered user redeems:', userRedeems);
      setUserRedeems(userRedeems);
    } catch (error) {
      console.error("Error fetching user redeems:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchRewards();
    fetchUserRedeems();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserRedeems();
    }
  }, [activeTab, user]);

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShippingInfo(prev => ({
      ...prev,
      name: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phoneNumber
    }));
    setShowRedeemForm(true);
  };

  const handleEditShippingInfo = (redeem) => {
    setEditingRedeem(redeem);
    setEditingShippingInfo(redeem.shippingInfo);
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveShippingInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`http://localhost:5001/api/redeem/${editingRedeem._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingInfo: editingShippingInfo,
          status: editingRedeem.status
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shipping information');
      }

      // Update the local state
      setUserRedeems(prevRedeems => 
        prevRedeems.map(redeem => 
          redeem._id === editingRedeem._id 
            ? { ...redeem, shippingInfo: editingShippingInfo }
            : redeem
        )
      );

      setEditingRedeem(null);
      setShowEditModal(false);
      alert('Shipping information updated successfully');
    } catch (error) {
      console.error('Error updating shipping information:', error);
      alert(error.message);
    }
  };

  const validateForm = () => {
    const errors = {};
    const lettersOnly = /^[A-Za-z\s]+$/;
    const numbersOnly = /^\d+$/;

    if (!shippingInfo.state || !lettersOnly.test(shippingInfo.state)) {
      errors.state = 'State must contain only letters';
    }

    if (!shippingInfo.postalCode || !numbersOnly.test(shippingInfo.postalCode)) {
      errors.postalCode = 'Postal code must contain only numbers';
    }

    if (!shippingInfo.city || !lettersOnly.test(shippingInfo.city)) {
      errors.city = 'City must contain only letters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      const data = {
        userId,
        rewardId: selectedReward._id,
        shippingInfo
      };

      const response = await fetch('http://localhost:5001/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to redeem reward');
      }

      const result = await response.json();
      
      // Update user's points immediately
      setUser(prev => ({
        ...prev,
        redeemPoints: result.data.remainingPoints
      }));
      
      setRemainingPoints(result.data.remainingPoints);
      setShowRedeemForm(false);
      setShowSuccessModal(true);
      
      // Refresh all necessary data
      await Promise.all([
        fetchUserData(),
        fetchRewards(),
        fetchUserRedeems()
      ]);

      // Reset shipping info and errors
      setShippingInfo({
        name: "",
        phoneNumber: "",
        address: "",
        postalCode: "",
        city: "",
        state: ""
      });
      setFormErrors({});
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert(error.message);
    }
  };

  const handleCancelRedeem = async (redeem) => {
    setRedeemToCancel(redeem);
    setShowCancelModal(true);
  };

  const confirmCancelRedeem = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`http://localhost:5001/api/redeem/${redeemToCancel._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel redeem');
      }

      const result = await response.json();
      
      // Update user's points
      setUser(prev => ({
        ...prev,
        redeemPoints: result.remainingPoints
      }));

      // Remove the cancelled redeem from the list
      setUserRedeems(prevRedeems => 
        prevRedeems.filter(redeem => redeem._id !== redeemToCancel._id)
      );

      setShowCancelModal(false);
      setRedeemToCancel(null);
      alert('Redeem cancelled successfully. Points have been returned to your account.');
    } catch (error) {
      console.error('Error cancelling redeem:', error);
      alert(error.message);
    }
  };

  const handleEditRedeem = (redeem) => {
    setEditingRedeem(redeem);
    setEditingShippingInfo(redeem.shippingInfo);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 pt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Rewards Center</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Earn points by recycling and redeem them for exciting rewards. 
            Every contribution helps create a greener future for our planet.
          </p>
        </div>

        {/* User Points Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          {user && localStorage.getItem("token") ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Welcome, {user.firstName}!
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Your Points:</span>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                    {(user.redeemPoints || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${user.userId}`)}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                View Profile
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">
                Please log in to view your points and redeem rewards
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                Login
              </button>
            </div>
          )}
        </div>

        {/* Add this section after the user points section */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Rewards
          </button>
          <button
            onClick={() => setActiveTab('toShip')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'toShip' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            To Ship ({userRedeems.filter(redeem => redeem.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('toReceive')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'toReceive' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            To Receive ({userRedeems.filter(redeem => redeem.status === 'shipped').length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'delivered' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Delivered ({userRedeems.filter(redeem => redeem.status === 'delivered').length})
          </button>
        </div>

        {/* Available Rewards */}
        <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
          {activeTab === 'all' ? 'Available Rewards' : 
           activeTab === 'toShip' ? 'To Ship' : 
           activeTab === 'toReceive' ? 'To Receive' : 'Delivered'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'all' ? (
            rewards.map((reward) => (
              <div key={reward._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={reward.image} 
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-green-700 mb-4">{reward.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                      {reward.points} Points
                    </div>
                    {user && user.redeemPoints >= reward.points ? (
                      <button
                        onClick={() => handleRedeemClick(reward)}
                        className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Redeem
                      </button>
                    ) : (
                      <span className="text-gray-500">Not enough points</span>
                    )}
                  </div>
                  <p className="text-gray-600">{reward.description}</p>
                </div>
              </div>
            ))
          ) : (
            userRedeems
              .filter(redeem => {
                if (activeTab === 'toShip') {
                  return redeem.status === 'pending';
                } else if (activeTab === 'toReceive') {
                  return redeem.status === 'shipped';
                } else if (activeTab === 'delivered') {
                  return redeem.status === 'delivered';
                }
                return false;
              })
              .map((redeem) => (
                <div key={redeem._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={redeem.rewardDetails?.image || "https://via.placeholder.com/300x200"} 
                      alt={redeem.rewardName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-green-700 mb-4">{redeem.rewardName}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                        {redeem.rewardPoints} Points
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        redeem.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : redeem.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {redeem.status.charAt(0).toUpperCase() + redeem.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-semibold">Shipping to:</span> {redeem.shippingInfo.name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Address:</span> {redeem.shippingInfo.address}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Phone:</span> {redeem.shippingInfo.phoneNumber}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">City:</span> {redeem.shippingInfo.city}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">State:</span> {redeem.shippingInfo.state}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Postal Code:</span> {redeem.shippingInfo.postalCode}
                      </p>
                    </div>
                    {redeem.status === 'pending' && (
                      <div className="mt-4 flex justify-end space-x-3">
                        <button
                          onClick={() => handleEditRedeem(redeem)}
                          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleCancelRedeem(redeem)}
                          className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Redeem
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* How to Earn Points */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-6">How to Earn Points</h2>
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Recycling Activities</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <FaRecycle className="text-green-600 mt-1" />
                  <span>Recycle 1kg of waste (50 redeem points)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Redeem Form Modal */}
        {showRedeemForm && selectedReward && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-green-700 mb-4">Redeem {selectedReward.name}</h2>
              <form onSubmit={handleRedeemSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={shippingInfo.name}
                      onChange={handleShippingInfoChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={shippingInfo.phoneNumber}
                      onChange={handleShippingInfoChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter your full address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleShippingInfoChange}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                        formErrors.postalCode ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter postal code"
                    />
                    {formErrors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingInfoChange}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                        formErrors.city ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter city"
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingInfoChange}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                        formErrors.state ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter state"
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRedeemForm(false);
                      setSelectedReward(null);
                      setShippingInfo({
                        name: "",
                        phoneNumber: "",
                        address: "",
                        postalCode: "",
                        city: "",
                        state: ""
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm Redeem
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ReactConfetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
            />
            <div
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaGift className="text-4xl text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Congratulations!</h2>
                <p className="text-gray-600 mb-4">
                  Your reward has been successfully redeemed.
                </p>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-semibold">
                    Remaining Points: {remainingPoints.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setShowRedeemForm(false);
                      setSelectedReward(null);
                      setShippingInfo({
                        name: "",
                        phoneNumber: "",
                        address: "",
                        postalCode: "",
                        city: "",
                        state: ""
                      });
                      navigate('/rewards');
                    }}
                    className="bg-[#00897b] text-white px-6 py-2 rounded-lg hover:bg-[#00796b] transition-colors flex items-center"
                  >
                    <FaShoppingBag className="mr-2" />
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && redeemToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Cancel Redeem</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this redeem? Your points ({redeemToCancel.rewardPoints}) will be returned to your account.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setRedeemToCancel(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={confirmCancelRedeem}
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel Redeem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Shipping Details Modal */}
        {showEditModal && editingRedeem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-green-700 mb-4">Edit Shipping Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editingShippingInfo.name}
                    onChange={(e) => setEditingShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editingShippingInfo.phoneNumber}
                    onChange={(e) => setEditingShippingInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editingShippingInfo.address}
                    onChange={(e) => setEditingShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={editingShippingInfo.postalCode}
                      onChange={(e) => setEditingShippingInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={editingShippingInfo.city}
                      onChange={(e) => setEditingShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    value={editingShippingInfo.state}
                    onChange={(e) => setEditingShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRedeem(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveShippingInfo}
                  className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;