import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
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
  FiCheck,
  FiX,
  FiBell,
  FiTrash2,
  FiEye,
  FiCalendar
} from "react-icons/fi";
import { FaRecycle, FaLeaf } from "react-icons/fa";

// Notification 
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <FiCheck className="mr-2" />
        ) : (
          <FiX className="mr-2" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

// Preview Modal
const PreviewModal = ({ article, onClose, onApprove, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
        <div className="mb-4">
          <span className="text-sm text-gray-500">Author: {article.author}</span>
          <span className="mx-2">•</span>
          <span className="text-sm text-gray-500">Category: {article.category}</span>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Excerpt:</h3>
          <p className="text-gray-700">{article.excerpt}</p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onDecline}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Decline
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AdArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [previewArticle, setPreviewArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/articles');
      const data = await response.json();
      setArticles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  };

  // Function to add article approval notification
  const addArticleApprovalNotification = (article) => {
    const notification = {
      id: Date.now(),
      message: `Your article "${article.title}" has been approved and published!`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/articles',
      userId: article.userId
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

  const handleArticleStatus = async (articleId, status) => {
    try {
      const response = await fetch(`http://localhost:5001/api/articles/${articleId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedArticle = articles.find(article => article._id === articleId);
        
        // Add notification for article approval
        if (updatedArticle && status === 'approved') {
          addArticleApprovalNotification(updatedArticle);
        }

        setArticles(articles.map(article => 
          article._id === articleId ? {
            ...article,
            status: status
          } : article
        ));
        setPreviewArticle(null);
        setNotification({
          message: `Article ${status === 'approved' ? 'approved' : 'declined'} successfully`,
          type: 'success'
        });
      } else {
        setNotification({
          message: 'Failed to update article status',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating article status:', error);
      setNotification({
        message: 'Error updating article status',
        type: 'error'
      });
    }
  };

  const handleDelete = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/articles/${articleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setArticles(articles.filter(article => article._id !== articleId));
          setNotification({
            message: 'Article deleted successfully',
            type: 'success'
          });
        } else {
          setNotification({
            message: 'Failed to delete article',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        setNotification({
          message: 'Error deleting article',
          type: 'error'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
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
        <aside className="bg-[#00897b] text-white w-64 flex-shrink-0 h-auto shadow-lg">
          <div className="p-4 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <FaLeaf className="mr-2" /> Go Green 360
            </h2>
            <nav className="flex-1">
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center text-white
                        ${index === 6 ? 'bg-green-700' : 'hover:bg-green-600'}`}
                    >
                      {item.icon}
                      {item.name}
                      {index !== 6 && <FiChevronRight className="ml-auto h-4 w-4 opacity-50" />}
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
        <div className="flex-1 px-6 overflow-x-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white w-full">
              Manage Articles ({articles.length})
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article._id} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm truncate">
                          {article.title}
                        </td>
                        <td className="px-2 py-2 text-sm truncate">
                          {article.category}
                        </td>
                        <td className="px-2 py-2 text-sm truncate">
                          {article.author}
                        </td>
                        <td className="px-2 py-2 text-sm truncate">
                          {formatDate(article.date)}
                        </td>
                        <td className="px-2 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                            ${article.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              article.status === 'declined' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {article.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-sm">
                          <div className="flex space-x-1">
                            {article.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => setPreviewArticle(article)}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                  title="Preview"
                                >
                                  <FiEye className="h-4 w-4" />
                                </button>
                              </>
                            ) : article.status === 'approved' && (
                              <button
                                onClick={() => handleDelete(article._id)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                                title="Delete"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewArticle && (
        <PreviewModal
          article={previewArticle}
          onClose={() => setPreviewArticle(null)}
          onApprove={() => handleArticleStatus(previewArticle._id, 'approved')}
          onDecline={() => handleArticleStatus(previewArticle._id, 'declined')}
        />
      )}

      {/* Notification Popup */}
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

export default AdArticles;