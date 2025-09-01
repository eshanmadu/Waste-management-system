import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FiCalendar
} from "react-icons/fi";
import { FaLeaf, FaRecycle } from "react-icons/fa";

// Confirmation Modal 
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, reportId }) => {
  return isOpen ? (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this report? This action cannot be undone.
        </p>
        <div className="flex justify-between">
          <button
            onClick={() => onConfirm(reportId)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Yes, Delete
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

const SubmittedReports = () => {
  const [reports, setReports] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", icon: <FiHome className="h-5 w-5 mr-2" />, path: "/admin/admin1" },
    { name: "Waste Reports", icon: <FiAlertCircle className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/waste-reports" },
    { name: "Waste Recycles", icon: <FaRecycle className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/adrecycles" },
    { name: "Redeems", icon: <FiAward className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/redeems" },
    { name: "Users & Volunteers", icon: <FiUsers className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/users" },
    { name: "Staff Management", icon: <FiUser className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/staff" },
    { name: "Articles", icon: <FiFileText className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/articles" },
    { name: "Redeem Items", icon: <FiGift className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/add-rewards" },
    { name: "Events", icon: <FiCalendar className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/events" },
    { name: "Reports", icon: <FiBarChart2 className="h-5 w-5 mr-2 opacity-70" />, path: "/admin/reports" }
  ];

  const fetchReports = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("http://localhost:5001/api/report/reports");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Sort reports(newest first)
        const sortedReports = data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setReports(sortedReports);
        // Initialize status updates for all reports
        const initialStatuses = {};
        sortedReports.forEach((report) => {
          initialStatuses[report._id] = report.status;
        });
        setStatusUpdates(initialStatuses);
      } else {
        console.error("Response data is not an array:", data);
        setReports([]);
      }
    } catch (error) {
      console.error("Error in fetchReports:", error);
      alert("Error loading reports. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchReports();
  }, []);

  // manual refresh button
  const handleRefresh = () => {
    fetchReports();
  };

  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/report/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setReports(prevReports => prevReports.filter(report => report._id !== reportId));
        setIsModalOpen(false);
        alert("Report deleted successfully!");
        fetchReports();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete report. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("An error occurred while deleting the report. Please try again.");
    }
  };

  const handleDeleteClick = (reportId) => {
    setReportToDelete(reportId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setReportToDelete(null);
  };

  // Function to add status change notification
  const addStatusChangeNotification = (report) => {
    const notification = {
      id: Date.now(),
      message: `Report status updated: ${report.wasteType.split(' (')[0]} is now ${report.status}`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/waste/tracking',
      userId: report.userId
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

  const updateStatus = async (reportId) => {
    const newStatus = statusUpdates[reportId];
    console.log("Attempting to update status for report:", reportId);
    console.log("New status:", newStatus);

    try {
      // Map numeric status to string values
      const statusMap = {
        1: "Pending",
        2: "In Progress",
        3: "Resolved"
      };

      const statusString = statusMap[newStatus] || newStatus;

      if (!statusString || !["Pending", "In Progress", "Resolved"].includes(statusString)) {
        console.error("Invalid status value:", newStatus);
        alert("Invalid status value. Must be one of: Pending, In Progress, Resolved");
        return;
      }

      console.log("Making request to update status...");
      const response = await fetch(`http://localhost:5001/api/report/reports/${reportId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: statusString
        }),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        // Update local state
        const updatedReport = {
          ...reports.find(report => report._id === reportId),
          status: statusString
        };
        
        setReports((prevReports) =>
          prevReports.map((report) =>
            report._id === reportId ? { ...report, status: statusString } : report
          )
        );
        
        // Add notification for status change
        addStatusChangeNotification(updatedReport);
        
        // Show success message
        alert("Status updated successfully!");
        
        // Refresh the reports list
        fetchReports();
      } else {
        console.error("Error response:", responseData);
        alert(responseData.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    }
  };

  const handleStatusChange = (reportId, newStatus) => {
    setStatusUpdates((prevStatusUpdates) => ({
      ...prevStatusUpdates,
      [reportId]: newStatus,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "In Progress":
        return "bg-blue-500";
      case "Resolved":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  // Filter reports by status
  const pendingReports = reports.filter(report => report.status === "Pending");
  const inProgressReports = reports.filter(report => report.status === "In Progress");
  const resolvedReports = reports.filter(report => report.status === "Resolved");

  const renderTable = (status, reportsList) => {
    return (
      <div className="mb-8">
        <h2 className={`text-xl text-center font-bold mb-4 p-3 rounded-t-lg ${getStatusColor(status)} text-white`}>
          {status} Reports ({reportsList.length})
        </h2>
        {reportsList.length === 0 ? (
          <p className="text-center text-gray-600 p-4 bg-white rounded-b-lg shadow">
            No {status.toLowerCase()} reports found
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-b-lg shadow max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left">Waste Type</th>
                  <th className="p-4 text-left">Location</th>
                  <th className="p-4 text-left">Reporter</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {reportsList.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="p-4 font-medium text-gray-700">{report.wasteType}</td>
                    <td className="p-4 font-medium text-gray-700">{report.location}</td>
                    <td className="p-4 font-medium text-gray-700">{report.reporterName}</td>
                    <td className="p-4 font-medium text-gray-700">{new Date(report.reportDate).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-gray-700 max-w-xs truncate">{report.description}</td>
                    <td className="p-4">
                      <select
                        value={statusUpdates[report._id] || report.status}
                        onChange={(e) => handleStatusChange(report._id, e.target.value)}
                        className={`border border-gray-300 p-2 rounded-md w-suto ${getStatusColor(statusUpdates[report._id] || report.status)} text-white`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <button
                        onClick={() => updateStatus(report._id)}
                        className="mt-2 w-28 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Update
                      </button>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDeleteClick(report._id)} 
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header (fixed at top) */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Waste Reports - Admin</h1>
          <button 
            onClick={handleRefresh}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Refresh Reports
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="bg-[#00897b] text-white w-64 h-auto shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <FaLeaf className="mr-2" /> Go Green 360
            </h2>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <li 
                    key={item.name} 
                    onClick={() => item.path && navigate(item.path)}
                    className={`px-3 py-2 rounded-lg flex items-center cursor-pointer transition-colors 
                      ${item.name === "Waste Reports" ? 'bg-green-700' : 'hover:bg-green-600'}`}
                  >
                    {item.icon}
                    {item.name}
                    {index !== 1 && <FiChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 border-t border-white pt-4">
              <div 
                className="flex items-center px-3 py-2 hover:bg-green-700 rounded-lg cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <FiLogOut className="h-5 w-5 mr-2" />
                Logout
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl w-auto bg-gradient-to-r from-green-700 to-green-500 rounded-3xl shadow-xl p-6 mb-6 mx-auto">
              <h2 className="text-4xl font-bold text-center text-white">Submitted Reports</h2>
            </div>

            <div className="max-w-6xl w-full space-y-8">
              {isFetching ? (
                <p className="text-center text-gray-600">Loading reports...</p>
              ) : (
                <>
                  {renderTable("Pending", pendingReports)}
                  {renderTable("In Progress", inProgressReports)}
                  {renderTable("Resolved", resolvedReports)}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen} 
        onConfirm={deleteReport} 
        onCancel={closeModal} 
        reportId={reportToDelete} 
      />
    </div>
  );
};

export default SubmittedReports;