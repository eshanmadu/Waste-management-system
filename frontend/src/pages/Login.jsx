import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-[100] ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      <div className="flex items-center">
        <FaCheckCircle className="mr-2" />
        <span>{message}</span>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Function to add welcome notification
  const addWelcomeNotification = async (user) => {
    const welcomeNotification = {
      id: Date.now(),
      message: `Welcome back, ${user.firstName}! We're glad to see you again.`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/',
      userId: user.userId
    };

    // Get existing notifications or initialize empty array
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Add new notification at the beginning of the array
    const updatedNotifications = [welcomeNotification, ...existingNotifications];
    
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // Dispatch event to update notifications in header
    window.dispatchEvent(new CustomEvent('notificationUpdate', {
      detail: { 
        notifications: updatedNotifications,
        unreadCount: 1
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Check for recycle center credentials
    if (email === "center@123" && password === "center") {
      setNotification({
        message: "Welcome to Recycle Center!",
        type: "success"
      });
      setTimeout(() => {
        window.location.href = "/recyclecenter";
      }, 1500);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://waste-management-system-88cb.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.isAdmin) {
        setNotification({
          message: "Welcome back, Admin!",
          type: "success"
        });
        setTimeout(() => {
          window.location.href = "/admin/admin1";
        }, 1500);
        return;
      }

      if (data.user) {
        localStorage.setItem("userId", data.user.userId);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Add welcome notification
        await addWelcomeNotification(data.user);

        setNotification({
          message: "Login successful! Welcome back!",
          type: "success"
        });

        window.dispatchEvent(new Event("userUpdated"));

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setNotification({
          message: data.msg || "Login failed. Please try again.",
          type: "error"
        });
      }
    } catch (error) {
      setNotification({
        message: "An error occurred during login. Please try again.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full px-4 md:px-12 mx-auto bg-gradient-to-br from-green-50 to-blue-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex justify-center items-center"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                "Login"
              )}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-green-600 hover:text-green-700 font-semibold hover:underline focus:outline-none transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default LoginPage;