import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Volunteer = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [formData, setFormData] = useState({
    city: '',
    preferredArea: '',
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    },
    selectedDay: null,
    hasVolunteered: '',
    pastExperience: '',
    skills: '',
    motivation: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    agreements: {
      safetyGuidelines: false,
      voluntaryPosition: false
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'success' or 'warning'
  const [showFullRules, setShowFullRules] = useState(false);

  const volunteeringAreas = [
    'Waste Collection',
    'Awareness Campaigns',
    'Sorting Facility',
    'Tech Support',
    'Event Management',
    'Education & Training',
    'Community Outreach'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening'];

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching user details for userId:', userId);
      
      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch user details: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      console.log('Received user data:', userData);
      
      // Try different possible name fields
      const userName = userData.name || userData.fullName || userData.username || userData.firstName + ' ' + userData.lastName || '';
      
      setUserInfo({
        name: userName,
        email: userData.email || '',
        phone: userData.phone || userData.phoneNumber || userData.mobile || ''
      });

      console.log('Set user info:', {
        name: userName,
        email: userData.email || '',
        phone: userData.phone || userData.phoneNumber || userData.mobile || ''
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Error loading user information: ' + error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      
      if (!payload.userId) {
        throw new Error('No userId found in token');
      }
      
      // Fetch complete user details using userId from token
      fetchUserDetails(payload.userId);
    } catch (error) {
      console.error('Error in useEffect:', error);
      setError('Error loading user information: ' + error.message);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    //validations block

    const onlyLetters = /^[A-Za-z\s]*$/;
    const onlyNumbers = /^\d+$/;
    
    if (name === 'city' && !onlyLetters.test(value)) return;
    if (name === 'emergencyContact.name' && !onlyLetters.test(value)) return;
    if (name === 'emergencyContact.relation' && !onlyLetters.test(value)) return;
    if (name === 'emergencyContact.phone' && (!onlyNumbers.test(value) || value.length > 10)) return;
  

    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else if (name.startsWith('agreements.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        agreements: {
          ...prev.agreements,
          [field]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDaySelect = (day) => {
    setFormData(prev => ({
      ...prev,
      selectedDay: prev.selectedDay === day ? null : day
    }));
  };

  const handleTimeSlotChange = (slot) => {
    if (!formData.selectedDay) return;
    
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [prev.selectedDay]: prev.availability[prev.selectedDay].includes(slot)
          ? prev.availability[prev.selectedDay].filter(time => time !== slot)
          : [...prev.availability[prev.selectedDay], slot]
      }
    }));
  };

  // Function to add volunteer application notification
  const addVolunteerNotification = (userName) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const notification = {
      id: Date.now(),
      message: `Volunteer application submitted by ${userName}. Please wait for our response.`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/volunteer',
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

    //validation block
    const { city, emergencyContact } = formData;
    const onlyLetters = /^[A-Za-z\s]+$/;
    const onlyNumbers = /^\d{10}$/;

    if (!onlyLetters.test(city) ||
        !onlyLetters.test(emergencyContact.name) ||
        !onlyLetters.test(emergencyContact.relation) ||
        !onlyNumbers.test(emergencyContact.phone)) {
      setError('Validation failed: Check city, emergency contact name, relation, and phone number.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const submissionData = {
        ...userInfo,
        ...formData,
        userId: payload.userId
      };

      const response = await fetch('https://waste-management-system-88cb.onrender.com/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.message && responseData.message.includes('already submitted')) {
          setModalMessage('You have already submitted a volunteer application. Please wait for our response.');
          setModalType('warning');
          setShowModal(true);
        } else {
          throw new Error(responseData.message || `Failed to submit volunteer application: ${response.status} ${response.statusText}`);
        }
        return;
      }

      // Add notification for successful submission
      addVolunteerNotification(userInfo.name);

      setModalMessage('Volunteer application submitted successfully! We will review your application and get back to you soon.');
      setModalType('success');
      setShowModal(true);
      setFormData({
        city: '',
        preferredArea: '',
        availability: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: []
        },
        selectedDay: null,
        hasVolunteered: '',
        pastExperience: '',
        skills: '',
        motivation: '',
        emergencyContact: {
          name: '',
          phone: '',
          relation: ''
        },
        agreements: {
          safetyGuidelines: false,
          voluntaryPosition: false
        }
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Volunteer Application</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              {success}
            </div>
          )}

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2 text-green-600" />
                  Name
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline mr-2 text-green-600" />
                  Email
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-2 text-green-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaMapMarkerAlt className="inline mr-2 text-green-600" />
                City/Town
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Volunteering Area
              </label>
              <select
                name="preferredArea"
                value={formData.preferredArea}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select an area</option>
                {volunteeringAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FaClock className="inline mr-2 text-green-600" />
                Availability Schedule
              </label>
              <div className="space-y-4">
                {/* Days Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        formData.selectedDay === day
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Time Slots (only shown when a day is selected) */}
                {formData.selectedDay && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Time Slots for {formData.selectedDay}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map(slot => (
                        <label key={slot} className="flex items-center space-x-2 bg-white p-3 rounded-md shadow-sm">
                          <input
                            type="checkbox"
                            checked={formData.availability[formData.selectedDay].includes(slot)}
                            onChange={() => handleTimeSlotChange(slot)}
                            className="rounded text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">{slot}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Availability Summary */}
                {Object.entries(formData.availability).some(([_, slots]) => slots.length > 0) && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">Selected Availability</h4>
                    <div className="space-y-2">
                      {Object.entries(formData.availability).map(([day, slots]) => (
                        slots.length > 0 && (
                          <div key={day} className="flex items-center text-sm">
                            <span className="font-medium text-gray-600 w-24">{day}:</span>
                            <span className="text-gray-700">{slots.join(', ')}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Have you volunteered before?
              </label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasVolunteered"
                    value="yes"
                    checked={formData.hasVolunteered === 'yes'}
                    onChange={handleChange}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasVolunteered"
                    value="no"
                    checked={formData.hasVolunteered === 'no'}
                    onChange={handleChange}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {formData.hasVolunteered === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Past Experience
                </label>
                <textarea
                  name="pastExperience"
                  value={formData.pastExperience}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relevant Skills
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                rows="3"
                placeholder="e.g., Public Speaking, IT, Team Leadership, Physical Labor"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Why do you want to volunteer with us?
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Emergency Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                  <input
                    type="text"
                    name="emergencyContact.relation"
                    value={formData.emergencyContact.relation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Agreement</h3>
              <div className="space-y-4">
                <ul className="list-disc list-inside ml-4">
                  <li>I understand that my participation as a volunteer is entirely voluntary, and I am not entitled to any salary, benefits, or compensation.</li>
                  <li>I agree to follow all safety instructions and guidelines provided by the organization.</li>
                </ul>
                {showFullRules && (
                  <ul className="list-disc list-inside ml-4">
                    <li>I agree to maintain the confidentiality of all information I may access during my volunteer service, including personal information about clients, staff, or other volunteers.</li>
                    <li>I understand that I may be removed from the volunteer program if I behave inappropriately or unsafely.</li>
                    <li>I will make a genuine effort to attend my scheduled volunteer shifts.</li>
                    <li>If I am unable to attend, I will notify the coordinator as early as possible.</li>
                    <li>I understand that volunteering may involve physical activities and that I undertake these at my own risk.</li>
                    <li>The organization is not liable for any injury, loss, or damage unless caused by proven negligence.</li>
                    <li>I agree to provide accurate emergency contact information in case of unforeseen events during my service.</li>
                    <li>I have read and understood the above terms.</li>
                    <li>I agree to abide by this Volunteer Agreement throughout my participation.</li>
                    <li>I understand that this agreement does not constitute an employment contract.</li>
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => setShowFullRules(!showFullRules)}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  {showFullRules ? 'See Less' : 'See More'}
                </button>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreements.safetyGuidelines"
                    checked={formData.agreements.safetyGuidelines}
                    onChange={handleChange}
                    className="mt-1 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to follow all safety guidelines and volunteer protocols.
                  </span>
                </label>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreements.voluntaryPosition"
                    checked={formData.agreements.voluntaryPosition}
                    onChange={handleChange}
                    className="mt-1 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    I understand that this is a voluntary position.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              {modalType === 'success' ? (
                <FaCheckCircle className="text-green-500 text-4xl" />
              ) : (
                <FaExclamationTriangle className="text-yellow-500 text-4xl" />
              )}
            </div>
            <p className="text-center text-gray-700 mb-6">{modalMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowModal(false);
                  if (modalType === 'success') {
                    navigate('/');
                  }
                }}
                className={`px-4 py-2 rounded-lg text-white ${
                  modalType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {modalType === 'success' ? 'Return to Home' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteer;
