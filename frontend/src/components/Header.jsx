import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoNotifications } from "react-icons/io5";
import { RiUser3Line } from "react-icons/ri";
import { FaBell } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";

const Header = () => {
    const [user, setUser] = useState(null);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [greeting, setGreeting] = useState('');
    const navigate = useNavigate();

    // Function to get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return 'Good Morning';
        } else if (hour >= 12 && hour < 16) {
            return 'Good Afternoon';
        } else if (hour >= 16 && hour < 21) {
            return 'Good Evening';
        } else{
            return 'Hello';
        }
    };

    // Update greeting when component mounts
    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    // fetch user from localStorage
    const getUserFromStorage = () => {
        return JSON.parse(localStorage.getItem("user"));
    };

    // Function to update notifications for current user
    const updateNotificationsForUser = (currentUser) => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        console.log('Current user:', currentUser);
        console.log('Stored notifications:', storedNotifications);
        
        // Filter notifications for current user by both userId and email
        const userNotifications = storedNotifications
            .filter(notification => 
                (notification.userId && String(notification.userId) === String(currentUser.userId)) ||
                (notification.email && notification.email === currentUser.email)
            )
            .sort((a, b) => b.id - a.id); // Sort by most recent first
        
        console.log('Filtered notifications:', userNotifications);
        setNotifications(userNotifications);
        const unreadNotifications = userNotifications.filter(n => !n.read).length;
        setUnreadCount(unreadNotifications);
    };

    // Load user and notifications from localStorage
    useEffect(() => {
        const currentUser = getUserFromStorage();
        console.log('Loading user:', currentUser);
        setUser(currentUser);
        updateNotificationsForUser(currentUser);

        const handleUserUpdate = () => {
            const updatedUser = getUserFromStorage();
            console.log('User updated:', updatedUser);
            setUser(updatedUser);
            updateNotificationsForUser(updatedUser);
        };

        const handleNotificationUpdate = (event) => {
            console.log('Notification update event:', event.detail);
            const currentUser = getUserFromStorage();
            if (currentUser) {
                updateNotificationsForUser(currentUser);
            }
        };

        window.addEventListener("userUpdated", handleUserUpdate);
        window.addEventListener("notificationUpdate", handleNotificationUpdate);

        return () => {
            window.removeEventListener("userUpdated", handleUserUpdate);
            window.removeEventListener("notificationUpdate", handleNotificationUpdate);
        };
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setUser(null);
        setShowLogoutConfirmation(false);
        setNotifications([]);
        setUnreadCount(0);
        navigate("/login");
    };

    // Handle notification click
    const handleNotificationClick = () => {
        console.log('Notification bell clicked');
        setShowNotifications(!showNotifications);
        if (unreadCount > 0 && user) {
            console.log('Marking notifications as read');
            const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            const updatedNotifications = allNotifications.map(n => 
                (n.userId && String(n.userId) === String(user.userId)) ||
                (n.email && n.email === user.email)
                    ? { ...n, read: true }
                    : n
            );
            
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
            updateNotificationsForUser(user);
        }
    };

    // Handle notification item click
    const handleNotificationItemClick = (notification) => {
        console.log('Notification item clicked:', notification);
        if (!user) return;

        const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const updatedNotifications = allNotifications.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
        );
        
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        updateNotificationsForUser(user);
        
        if (notification.link) {
            console.log('Navigating to:', notification.link);
            navigate(notification.link);
        }
    };

    return (
        <header className="bg-[#00897b] w-full fixed top-0 left-0 z-50 shadow-md">
            <div className="max-w-screen-2xl mx-auto py-4 px-12 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <span className="text-white text-xl font-bold">Go Green 360</span>
                </div>

                {/* Navigation Links */}
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <a href="/" className="text-white hover:text-yellow-300 transition-colors">Home</a>
                        </li>

                        
                        {/* Waste Management Dropdown */}
                        <li className="relative group">
                            <a href="#" className="text-white hover:text-yellow-300 transition-colors">
                                Waste Management
                            </a>
                            <ul className="absolute left-0 mt-2 w-48 bg-green-50 shadow-lg rounded-md border border-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <li>
                                    <a href="/waste/reporting" className="block px-4 py-2 text-black hover:text-yellow-600 transition-colors">
                                        Waste Reporting
                                    </a>
                                </li>
                                <li>
                                    <a href="/waste/tracking" className="block px-4 py-2 text-black hover:text-yellow-600 transition-colors">
                                        Waste Tracking
                                    </a>
                                </li>
                                <li>
                                    <a href="/recycling-otp" className="block px-4 py-2 text-black hover:text-yellow-600 transition-colors">
                                        Waste Recycling
                                    </a>
                                </li>
                                
                            </ul>
                        </li>

                        <li>
                            <a href="/waste-distribution" className="text-white hover:text-yellow-300 transition-colors">Marketplace</a>
                        </li>

                        <li><a href="/staff" className="text-white hover:text-yellow-300 transition-colors">Our Staff</a></li>
                        <li><a href="/leaderboard" className="text-white hover:text-yellow-300 transition-colors">Leaderboard</a></li>
                        <li className="relative group">
                            <a href="#" className="text-white hover:text-yellow-300 transition-colors">Eco Arcade</a>
                            <ul className="absolute left-0 mt-2 w-48 bg-green-50 shadow-lg rounded-md border border-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <li>
                                    <a href="/quiz" className="block px-4 py-2 text-black hover:text-yellow-600 transition-colors">
                                        Quiz
                                    </a>
                                </li>
                                <li>
                                    <a href="/game" className="block px-4 py-2 text-black hover:text-yellow-600 transition-colors">
                                        Game
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li><a href="/rewards" className="text-white hover:text-yellow-300 transition-colors">Redeems</a></li>
                    </ul>
                </nav>

                {/* User Section */}
                <div className="flex space-x-4 items-center">
                    {user ? (
                        <>
                            {user.isAdmin ? (
                                <div className="flex items-center space-x-2 bg-purple-100/20 px-3 py-1.5 rounded-full">
                                    <span className="text-purple-200 font-bold text-sm tracking-wide">ADMIN</span>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-100 font-medium text-opacity-90">
                                        {greeting}, <span className="text-white font-semibold">{user.firstName}</span>
                                    </span>
                                </div>
                            )}

                            {/* User Icon with Dropdown */}
                            <div className="relative group">
                                <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
                                    <RiUser3Line className="w-6 h-6 text-white" />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => navigate(`/profile/${user.userId}`)}
                                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => setShowLogoutConfirmation(true)}
                                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={handleNotificationClick}
                                    className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
                                >
                                    <IoNotifications className="w-6 h-6 text-white" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications && notifications.length > 0 ? (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => handleNotificationItemClick(notification)}
                                                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                                            !notification.read ? 'bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        <p className="text-sm text-gray-800">{notification.message}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg 
                            hover:bg-emerald-700 transition-all duration-200 hover:shadow-lg
                            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p className="text-lg font-semibold mb-4">Do you really want to log out?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowLogoutConfirmation(false)}
                                className="px-4 py-2 bg-gray-500 text-white font-bold rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;