import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiHome, 
  FiAlertCircle, 
  FiUsers, 
  FiAward, 
  FiUser, 
  FiLogOut,
  FiChevronRight,
  FiBell,
  FiPieChart,
  FiRepeat,
  FiTruck,
  FiFileText,
  FiGift,
  FiBarChart2,
  FiCalendar
} from "react-icons/fi";
import { FaRecycle, FaLeaf } from "react-icons/fa";

const AdminDashboard1 = () => {
  // State variables for real data
  const [users, setUsers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [reports, setReports] = useState([]);
  const [recyclingData, setRecyclingData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all required data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [usersRes, volunteersRes, reportsRes, recyclingRes, staffRes] = await Promise.all([
          fetch('http://localhost:5001/api/users'),
          fetch('http://localhost:5001/api/volunteers'),
          fetch('http://localhost:5001/api/report/reports'),
          fetch('http://localhost:5001/api/recycle'),
          fetch('http://localhost:5001/api/staff')
        ]);

        if (!usersRes.ok || !volunteersRes.ok || !reportsRes.ok || !recyclingRes.ok || !staffRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [usersData, volunteersData, reportsData, recyclingData, staffData] = await Promise.all([
          usersRes.json(),
          volunteersRes.json(),
          reportsRes.json(),
          recyclingRes.json(),
          staffRes.json()
        ]);

        console.log('Recycling Data:', recyclingData); // Debug log

        setUsers(usersData);
        setVolunteers(volunteersData);
        setReports(reportsData);
        setRecyclingData(recyclingData.data || []); // Access the data property from the response
        setStaffData(staffData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate total recycled amount
  const totalRecycled = Array.isArray(recyclingData) 
    ? recyclingData.reduce((sum, item) => {
        const quantity = parseFloat(item?.quantity) || 0;
        console.log('Processing item:', item, 'Quantity:', quantity); // Debug log
        return sum + quantity;
      }, 0)
    : 0;

  console.log('Total Recycled:', totalRecycled); // Debug log

  // Calculate waste distribution
  const wasteDistribution = Array.isArray(recyclingData)
    ? recyclingData.reduce((acc, item) => {
        if (item?.wasteType && item?.quantity) {
          const quantity = parseFloat(item.quantity) || 0;
          acc[item.wasteType] = (acc[item.wasteType] || 0) + quantity;
        }
        return acc;
      }, {})
    : {};

  console.log('Waste Distribution:', wasteDistribution); // Debug

  // Calculate percentages for waste distribution
  const totalWaste = Object.values(wasteDistribution).reduce((sum, val) => sum + val, 0);
  const wastePercentages = Object.entries(wasteDistribution).map(([type, amount]) => ({
    type,
    percentage: totalWaste > 0 ? Math.round((amount / totalWaste) * 100) : 0
  }));

  // Sidebar navigation 
  const navItems = [
    { name: "Dashboard", icon: <FiHome className="h-5 w-5 mr-2" /> },
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

  // Stats cards 
  const stats = [
    { 
      title: "Total Reports", 
      value: reports.length.toString(),
      change: "+2.3%", 
      icon: <FiFileText className="h-6 w-6 text-green-500" /> 
    },
    { 
      title: "Total Users", 
      value: users.length.toString(),
      change: "+28%", 
      icon: <FiUsers className="h-6 w-6 text-blue-500" /> 
    },
    { 
      title: "Total Volunteers", 
      value: volunteers.length.toString(),
      change: "+10%", 
      icon: <FiUser className="h-6 w-6 text-purple-500" /> 
    },
    { 
      title: "Total Staff", 
      value: staffData.length.toString(),
      change: "+2.3%", 
      icon: <FiTruck className="h-6 w-6 text-orange-500" /> 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header  */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <FiBell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <img 
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80" 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
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
                      ${index === 0 ? 'bg-green-700' : 'hover:bg-green-600'}`}
                  >
                    {item.icon}
                    {item.name}
                    {index !== 0 && <FiChevronRight className="ml-auto h-4 w-4 opacity-50" />}
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

        {/* Main Content  */}
        <main className="flex-1 ml-0 p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-md p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold">Welcome back, Admin!</h2>
            <p className="mt-2 opacity-90">Here's what's happening with your community today.</p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
                <span className="text-green-500 text-sm mt-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Recycled Amount Section */}
            <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FiRepeat className="text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold">Recycled Amount</h3>
                </div>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View All
                </button>
              </div>
              <p className="text-3xl font-bold mt-2">{totalRecycled.toFixed(1)}kg</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full" style={{ width: "75%" }}></div>
              </div>
              <span className="text-green-500 text-sm mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +2.3% from last month
              </span>
            </div>

            {/* Waste Distribution Pie Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FiPieChart className="text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold">Waste Distribution</h3>
                </div>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="mt-4 flex justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-green-400 border-t-teal-400 border-r-blue-400 border-b-yellow-400 animate-spin-slow"></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {wastePercentages.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-green-400' :
                      index === 1 ? 'bg-teal-400' :
                      index === 2 ? 'bg-blue-400' :
                      'bg-yellow-400'
                    } mr-2`}></div>
                    <span>{item.type} ({item.percentage}%)</span>
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

export default AdminDashboard1;