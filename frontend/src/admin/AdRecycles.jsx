import React, { useState, useEffect } from "react";
import { 
  FiHome, FiAlertCircle, FiUsers, FiAward, FiUser, 
  FiLogOut, FiChevronRight, FiGift, FiBarChart2,
  FiEdit, FiTrash2, FiSave, FiSearch, FiFileText,
  FiCalendar
} from "react-icons/fi";
import { FaRecycle, FaLeaf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const AdRecycles = () => {
  const navigate = useNavigate();
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setTableLoading(true);
      try {
        const response = await fetch("https://waste-management-system-88cb.onrender.com/api/recycle");
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch submissions");
        }

        if (data.success) {
          console.log('Fetched data:', data.data);
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

  // Filter submissions based on search term
  const filteredSubmissions = recentSubmissions.filter(submission => 
    submission.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.wasteType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.recyclingCenter?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get displayed submissions
  const displayedSubmissions = filteredSubmissions.slice(0, displayCount);

  // Handle see more click
  const handleSeeMore = () => {
    setDisplayCount(prev => prev + 5);
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
                        ${index === 2 ? "bg-green-700" : "hover:bg-green-600"}`}
                    >
                      {item.icon}
                      {item.name}
                      {index !== 2 && (
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white">
                Recycling Submissions ({filteredSubmissions.length})
              </h2>
              <div className="flex justify-between items-center">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Total Entries: {filteredSubmissions.length}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mb-8">
              {tableLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-b-lg shadow">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <p className="text-center text-gray-600 p-4 bg-white rounded-b-lg shadow">
                  No submissions found
                </p>
              ) : (
                <div className="overflow-x-auto bg-white rounded-b-lg shadow max-h-[400px] overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Phone Number</th>
                        <th className="p-4 text-left">Waste Type</th>
                        <th className="p-4 text-left">Quantity</th>
                        <th className="p-4 text-left">Center</th>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSubmissions.map((submission) => (
                        <tr key={submission._id} className="hover:bg-gray-50 border-b border-gray-200">
                          <td className="p-4 font-medium text-gray-700">{submission.userName}</td>
                          <td className="p-4 font-medium text-gray-700">{submission.userPhone}</td>
                          <td className="p-4 font-medium text-gray-700">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {submission.wasteType}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-gray-700">{submission.quantity} kg</td>
                          <td className="p-4 font-medium text-gray-700">{submission.recyclingCenter}</td>
                          <td className="p-4 font-medium text-gray-700">
                            {new Date(submission.dateTime).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  alert("Edit functionality has been moved to the recycle center page");
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FiEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this entry?')) {
                                    try {
                                      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/recycle/${submission._id}`, {
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
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredSubmissions.length > displayCount && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleSeeMore}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <span>See More</span>
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdRecycles;