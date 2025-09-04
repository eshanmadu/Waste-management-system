import React, { useState, useEffect } from "react";
import { FaLeaf, FaSpinner, FaSearch, FaFilter, FaTrophy, FaMedal } from "react-icons/fa";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterBadge, setFilterBadge] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      
      const userName = userData ? `${userData.firstName} ${userData.lastName}`.trim() : "";
      setCurrentUserName(userName);

      const response = await fetch("https://waste-management-system-88cb.onrender.com/api/leaderboard", {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      });
      
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      
      if (data.success) {
        const processedData = data.data.map(user => ({
          ...user,
          isCurrentUser: user.name === userName
        }));
        
        setLeaderboard(processedData);
      } else {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredUsers = leaderboard.filter(user => {
    const userName = user?.name || '';
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBadge = filterBadge === "all" || user?.badge === filterBadge;
    return matchesSearch && matchesBadge;
  });

  const uniqueBadges = [...new Set(leaderboard.map(user => user?.badge).filter(Boolean))];

  // Badge requirements
  const badgeRequirements = [
    { name: "Recycling Legend", points: 1000, color: "yellow-500" },
    { name: "Planet Protector", points: 500, color: "gray-400" },
    { name: "Green Guardian", points: 200, color: "amber-700" },
    { name: "Eco Explorer", points: 0, color: "blue-500" }
  ];

  //Top 3
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-yellow-400 text-xl" />;
      case 2:
        return <FaMedal className="text-gray-400 text-xl" />;
      case 3:
        return <FaMedal className="text-amber-600 text-xl" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-green-50">
        <div className="text-center space-y-4">
          <FaSpinner className="animate-spin text-5xl text-green-500 mx-auto" />
          <p className="text-gray-600 font-medium animate-pulse">Loading eco-warriors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-green-50">
        <div className="bg-red-50 p-6 rounded-xl shadow-lg">
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 pt-24 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 p-8">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl font-bold text-white drop-shadow-md">
                🌍 Eco Warriors Leaderboard
              </h1>
              <p className="text-green-50">Join our mission to make the world greener, one recycling at a time</p>
            </div>

            <div className="mt-8 max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-sm transition-all hover:shadow-md">
                    <input
                      type="text"
                      placeholder="Search eco-warriors..."
                      className="w-full px-5 py-3.5 rounded-xl focus:outline-none bg-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch className="mx-4 text-gray-400" />
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-3 px-6 py-3.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:bg-white transition-all w-full md:w-auto justify-center"
                  >
                    <FaFilter className="text-green-600" />
                    <span className="text-gray-700 font-medium">Filter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Badge Information Section */}
            <div className="mt-8 max-w-5xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-6 text-center drop-shadow-md">🏆 Achievement Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badgeRequirements.map((badge, index) => (
                  <div key={badge.name} className="group bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="flex items-center justify-center mb-3">
                      <div className={`p-3 rounded-full ${
                        badge.color === 'yellow-500' ? 'bg-yellow-100' :
                        badge.color === 'gray-400' ? 'bg-gray-100' :
                        badge.color === 'amber-700' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        <FaLeaf className={`text-xl ${
                          badge.color === 'yellow-500' ? 'text-yellow-600' :
                          badge.color === 'gray-400' ? 'text-gray-600' :
                          badge.color === 'amber-700' ? 'text-amber-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                    </div>
                    <h4 className={`text-sm font-bold text-center mb-2 ${
                      badge.color === 'yellow-500' ? 'text-yellow-700' :
                      badge.color === 'gray-400' ? 'text-gray-700' :
                      badge.color === 'amber-700' ? 'text-amber-700' :
                      'text-blue-700'
                    }`}>
                      {badge.name}
                    </h4>
                    <div className={`text-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                      badge.color === 'yellow-500' ? 'bg-yellow-100 text-yellow-700' :
                      badge.color === 'gray-400' ? 'bg-gray-100 text-gray-700' :
                      badge.color === 'amber-700' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {badge.points === 0 ? '🎯 Starting Badge' : `⭐ ${badge.points}+ Points`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="absolute right-8 top-40 w-56 bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-100 animate-fadeIn">
              <label className="block text-sm font-medium mb-2 text-gray-600">Filter by Badge:</label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={filterBadge}
                onChange={(e) => setFilterBadge(e.target.value)}
              >
                <option value="all">All Badges</option>
                {uniqueBadges.map(badge => (
                  <option key={badge} value={badge}>{badge}</option>
                ))}
              </select>
            </div>
          )}

          <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
            <table className="w-full">
              <thead>
                <tr className="bg-green-50 text-green-800">
                  <th className="sticky top-0 p-4 text-left font-semibold bg-green-50">Rank</th>
                  <th className="sticky top-0 p-4 text-left font-semibold bg-green-50">Recycler</th>
                  <th className="sticky top-0 p-4 text-left font-semibold bg-green-50">Total Recycled</th>
                  <th className="sticky top-0 p-4 text-left font-semibold bg-green-50">Achievements</th>
                  <th className="sticky top-0 p-4 text-left font-semibold bg-green-50">Eco Points</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const isCurrentUser = user.name === currentUserName;
                  
                  return (
                    <tr
                      key={`${user.userId || 'unknown'}-${user.rank || index}`}
                      className={`border-b border-gray-100 transition-colors group ${
                        isCurrentUser 
                          ? 'bg-green-100 hover:bg-green-200' 
                          : 'hover:bg-green-50/50'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(user.rank)}
                          <span className={`font-bold ${
                            isCurrentUser 
                              ? 'text-green-700' 
                              : index < 3 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            #{user.rank}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-600 font-medium">{user.totalRecycled} kg</div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                          user.badgeColor === 'yellow-500' ? 'bg-yellow-500/10' :
                          user.badgeColor === 'gray-400' ? 'bg-gray-400/10' :
                          user.badgeColor === 'amber-700' ? 'bg-amber-700/10' :
                          'bg-blue-500/10'
                        } transition-transform group-hover:scale-105`}>
                          <FaLeaf className={`mr-2 ${
                            user.badgeColor === 'yellow-500' ? 'text-yellow-500' :
                            user.badgeColor === 'gray-400' ? 'text-gray-400' :
                            user.badgeColor === 'amber-700' ? 'text-amber-700' :
                            'text-blue-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            user.badgeColor === 'yellow-500' ? 'text-yellow-500' :
                            user.badgeColor === 'gray-400' ? 'text-gray-400' :
                            user.badgeColor === 'amber-700' ? 'text-amber-700' :
                            'text-blue-500'
                          }`}>
                            {user.badge}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`font-bold ${
                          isCurrentUser ? 'text-green-700' : 'text-green-600'
                        }`}>
                          {user.points.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                  <FaSearch className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  No eco-warriors found{searchQuery ? ` matching "${searchQuery}"` : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;