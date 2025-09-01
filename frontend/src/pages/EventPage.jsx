import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaInfoCircle, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaArrowRight, FaLeaf, FaRecycle, FaClock, FaCheckCircle, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const EventPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      
      // Format dates to ensure consistent comparison
      const formattedEvents = data.map(event => {
        // Parse the date string and adjust for timezone
        const eventDate = new Date(event.date);
        const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000);
        
        return {
          ...event,
          date: localDate,
          formattedDate: localDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
      });
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    return calendarDays;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const localClickedDate = new Date(clickedDate.getTime() - clickedDate.getTimezoneOffset() * 60000);
    
    if (selectedDate && selectedDate.getTime() === localClickedDate.getTime()) {
      setSelectedEvent(null);
      setSelectedDate(null);
    } else {
      const event = events.find(
        (event) => {
          const eventDate = new Date(event.date);
          return eventDate.getDate() === localClickedDate.getDate() &&
                 eventDate.getMonth() === localClickedDate.getMonth() &&
                 eventDate.getFullYear() === localClickedDate.getFullYear();
        }
      );
      setSelectedEvent(event || null);
      setSelectedDate(localClickedDate);
    }
  };

  const handleJoinEvent = async (event) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user info from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;

      // Check if user is a volunteer
      const volunteerResponse = await fetch(`http://localhost:5001/api/volunteers/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!volunteerResponse.ok) {
        if (volunteerResponse.status === 404) {
          setErrorMessage('You need to be a registered volunteer to join events. Please complete your volunteer registration first.');
          setShowErrorModal(true);
          return;
        }
        throw new Error('Failed to verify volunteer status');
      }

      const volunteerData = await volunteerResponse.json();
      
      // Check if volunteer is approved
      if (volunteerData.status !== 'approved') {
        setErrorMessage('Your volunteer application is still pending approval. Please wait for admin approval before joining events.');
        setShowErrorModal(true);
        return;
      }

      // If user is an approved volunteer, proceed with join confirmation
      setSelectedEvent(event);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error checking volunteer status:', error);
      setErrorMessage('An error occurred while checking your volunteer status. Please try again later.');
      setShowErrorModal(true);
    }
  };

  const confirmJoinEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user info from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      console.log('User ID from token:', userId, typeof userId);

      // First check if user is a volunteer
      const volunteerResponse = await fetch(`http://localhost:5001/api/volunteers/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const volunteerData = await volunteerResponse.json();
      console.log('Volunteer data:', volunteerData);
      console.log('Volunteer ID:', volunteerData._id, typeof volunteerData._id);

      if (!volunteerResponse.ok) {
        if (volunteerResponse.status === 404) {
          setError('You need to be a registered volunteer to join events. Please complete your volunteer registration first.');
        } else {
          throw new Error(volunteerData.message || 'Failed to verify volunteer status');
        }
        setShowConfirmModal(false);
        return;
      }

      // Check if volunteer is approved
      if (volunteerData.status !== 'approved') {
        setError('Your volunteer application is still pending approval. Please wait for admin approval before joining events.');
        setShowConfirmModal(false);
        return;
      }

      // Validate that we have valid IDs
      if (!userId || !volunteerData._id) {
        setError('Invalid user or volunteer data');
        setShowConfirmModal(false);
        return;
      }

      const requestBody = {
        userId: userId.toString(),
        volunteerId: volunteerData._id.toString()
      };
      console.log('Request body:', requestBody);

      // Now join the event with both userId and volunteerId
      const response = await fetch(`http://localhost:5001/api/events/${selectedEvent._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (data.message && data.message.includes('already joined')) {
          setError('You have already joined this event.');
        } else {
          throw new Error(data.message || 'Failed to join event');
        }
        return;
      }

      // Update the events list to reflect the new participant
      setEvents(events.map(event => 
        event._id === selectedEvent._id 
          ? { 
              ...event, 
              participants: [...(event.participants || []), {
                userId: userId.toString(),
                volunteerId: volunteerData._id.toString(),
                joinedAt: new Date()
              }]
            }
          : event
      ));

      // Show success message
      setSuccess('Successfully joined the event!');
      setShowConfirmModal(false);
      setSelectedEvent(null);

      // Refresh the events list
      fetchEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      setError(error.message);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthName = months[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {success && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" />
            {success}
            <button
              onClick={() => setSuccess(null)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <FaInfoCircle className="mr-2 text-red-500" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-green-800 mb-6">Community Events</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community events and make a difference in waste management and environmental conservation.
            Together, we can create a cleaner and greener future.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
            <div className="text-green-600 text-5xl mb-6">
              <FaCalendarAlt />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-green-800">Regular Events</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Monthly clean-up drives
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Weekly recycling workshops
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Community awareness programs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Environmental education sessions
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
            <div className="text-green-600 text-5xl mb-6">
              <FaUsers />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-green-800">Volunteer Benefits</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Earn reward points
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Gain practical experience
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Network with professionals
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Make a positive impact
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
            <div className="text-green-600 text-5xl mb-6">
              <FaInfoCircle />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-green-800">Event Features</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Expert-led workshops
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Hands-on activities
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Networking opportunities
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Community engagement
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Events List */}
          <div className="w-full lg:w-2/3">
            <h2 className="text-3xl font-bold text-green-800 mb-8">Upcoming Events</h2>
            <div className="space-y-8">
              {events
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((event) => (
                  <div key={event._id} className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                    <div className="md:flex">
                      <div className="md:w-1/3 h-64 bg-green-50 flex items-center justify-center relative">
                        {event.title.toLowerCase().includes('clean') ? (
                          <FaRecycle className="text-green-600 text-6xl" />
                        ) : event.title.toLowerCase().includes('workshop') ? (
                          <FaLeaf className="text-green-600 text-6xl" />
                        ) : event.title.toLowerCase().includes('awareness') ? (
                          <FaInfoCircle className="text-green-600 text-6xl" />
                        ) : (
                          <FaCalendarAlt className="text-green-600 text-6xl" />
                        )}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold
                            ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                              event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                              event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 md:w-2/3">
                        <h3 className="text-2xl font-bold text-green-800 mb-4">{event.title}</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <FaCalendarAlt className="text-green-600 mt-1 text-xl" />
                            <div>
                              <p className="font-semibold text-gray-700">Event Date</p>
                              <p className="text-gray-600">{event.formattedDate}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className="text-green-600 mt-1 text-xl" />
                            <div>
                              <p className="font-semibold text-gray-700">Location</p>
                              <p className="text-gray-600">{event.location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <FaUsers className="text-green-600 mt-1 text-xl" />
                            <div>
                              <p className="font-semibold text-gray-700">Expected Participants</p>
                              <p className="text-gray-600">{event.participants?.length || 0} / {event.maxParticipants} participants</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <FaInfoCircle className="text-green-600 mt-1 text-xl" />
                            <div>
                              <p className="font-semibold text-gray-700">Description</p>
                              <p className="text-gray-600">{event.description}</p>
                            </div>
                          </div>
                          <div className="pt-4">
                            <button
                              onClick={() => handleJoinEvent(event)}
                              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
                            >
                              Join Now
                              <FaArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-green-800 mb-6">Event Calendar</h2>
                <div className="flex justify-between items-center mb-6">
                  <button 
                    onClick={previousMonth} 
                    className="text-green-600 hover:text-green-700 text-xl p-2 rounded-full hover:bg-green-50 transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  <p className="text-gray-700 text-lg font-semibold">{`${currentMonthName} ${currentYear}`}</p>
                  <button 
                    onClick={nextMonth} 
                    className="text-green-600 hover:text-green-700 text-xl p-2 rounded-full hover:bg-green-50 transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-gray-700 text-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="font-semibold py-2 text-center text-gray-500">{day}</div>
                  ))}
                  {generateCalendarDays().map((day, index) => {
                    const currentDate = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                    const hasEvent = day && events.some(event => {
                      const eventDate = new Date(event.date);
                      return eventDate.getDate() === currentDate.getDate() &&
                             eventDate.getMonth() === currentDate.getMonth() &&
                             eventDate.getFullYear() === currentDate.getFullYear();
                    });

                    return (
                      <div
                        key={index}
                        onClick={day ? () => handleDateClick(day) : null}
                        className={`py-2 text-center cursor-pointer rounded-full relative ${
                          day ? "text-gray-600 hover:bg-green-50" : "text-transparent"
                        } ${
                          hasEvent ? "bg-green-100 font-semibold" : ""
                        } ${
                          selectedDate && selectedDate.getDate() === day ? "bg-green-200 ring-2 ring-green-500" : ""
                        }`}
                      >
                        {day || ""}
                        {hasEvent && (
                          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">Join Our Events</h3>
                <p className="mb-6 opacity-90">
                  Be part of our community events and make a difference in waste management and environmental conservation.
                </p>
                <Link 
                  to="/volunteer"
                  className="w-full bg-white text-green-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-50 transition-colors inline-block"
                >
                  Register as a Volunteer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <FaInfoCircle className="text-green-600 text-5xl" />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Confirm Event Registration
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to join "{selectedEvent.title}" on {new Date(selectedEvent.date).toLocaleDateString()}?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedEvent(null);
                }}
                className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                onClick={confirmJoinEvent}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <FaCheckCircle className="mr-2" />
                Confirm Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <FaInfoCircle className="text-red-500 text-5xl" />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Registration Required
            </h3>
            <p className="text-center text-gray-600 mb-6">
              {errorMessage}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              {errorMessage.includes('need to be a registered volunteer') && (
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    navigate('/volunteer');
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Register as Volunteer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage; 