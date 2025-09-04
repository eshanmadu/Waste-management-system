import React, { useState, useEffect } from 'react';
import { FaSpinner, FaLeaf, FaRecycle, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { 
  FiHome, FiAlertCircle, FiUsers, FiAward, FiUser, 
  FiLogOut, FiChevronRight, FiGift, FiBarChart2,
  FiFileText, FiCalendar
} from "react-icons/fi";
import { DefaultContext } from 'react-icons/lib';
import { Link } from "react-router-dom";

// Popup Modal Component
const PopupModal = ({ message, type, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          {type === 'success' ? (
            <FaCheckCircle className="text-green-500 text-4xl" />
          ) : (
            <FaTimesCircle className="text-red-500 text-4xl" />
          )}
        </div>
        <p className="text-center text-gray-700 mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg text-white ${
              type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AdStaff = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    nicId: '',
    dateOfBirth: '',
    gender: '',
    
    // Contact Information
    email: '',
    phoneNumber: '',
    address: '',
    
    // Staff Role Details
    role: '',
    assignedRegion: '',
    shiftAvailability: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [popup, setPopup] = useState(null);


  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const res = await fetch('https://waste-management-system-88cb.onrender.com/api/staff');
      if (!res.ok) {
        throw new Error('Failed to fetch staff data');
      }
      const data = await res.json();
      setStaffList(data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      alert('Failed to load staff data');
    }
  };

  // sidebar navigation items
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation part

      if (name === 'fullName' && !/^[A-Za-z\s]*$/.test(value)) return;
      if (name === 'nicId' && !/^\d{0,12}$/.test(value)) return;
      if (name === 'phoneNumber' && !/^\d{0,10}$/.test(value)) return;

      setFormData(prev => ({ ...prev, [name]: value }));
    };

    //end validation

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, nicId, phoneNumber } = formData;

    //validation part

    if (!/^[A-Za-z\s]+$/.test(fullName)) return alert("Full Name should contain only letters and spaces.");
    if (!/^\d{12}$/.test(nicId)) return alert("NIC should contain exactly 12 digits.");
    if (!/^\d{10}$/.test(phoneNumber)) return alert("Phone number should contain exactly 10 digits.");

    //end Validation

    setIsLoading(true);
    try {
      const url = isEditing 
        ? `https://waste-management-system-88cb.onrender.com/api/staff/${editingId}`
        : 'https://waste-management-system-88cb.onrender.com/api/staff';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save staff member');
      }

      const data = await response.json();
      console.log("Staff member saved successfully:", data);
      
      // Show success popup
      setPopup({
        message: `Staff member ${isEditing ? 'updated' : 'added'} successfully!`,
        type: 'success'
      });
      
      resetForm();
      fetchStaffData();
    } catch (error) {
      console.error("Error saving staff member:", error.message);
      setPopup({
        message: error.message || 'Error saving staff member. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleEdit = (staff) => {
  
    const formattedDate = staff.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : '';
    
    setFormData({
      fullName: staff.fullName,
      nicId: staff.nicId,
      dateOfBirth: formattedDate,
      gender: staff.gender,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      address: staff.address,
      role: staff.role,
      assignedRegion: staff.assignedRegion,
      shiftAvailability: staff.shiftAvailability,
    });
    setIsEditing(true);
    setEditingId(staff._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const response = await fetch(`https://waste-management-system-88cb.onrender.com/api/staff/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete staff member');
      }

      // Show success popup
      setPopup({
        message: 'Staff member deleted successfully',
        type: 'success'
      });
      
      fetchStaffData();
    } catch (error) {
      console.error('Error deleting staff member:', error);
      setPopup({
        message: 'Failed to delete staff member',
        type: 'error'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      nicId: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      phoneNumber: '',
      address: '',
      role: '',
      assignedRegion: '',
      shiftAvailability: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

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
                        ${index === 5 ? "bg-green-700" : "hover:bg-green-600"}`}
                    >
                      {item.icon}
                      {item.name}
                      {index !== 5 && (
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
        <div className="flex-1 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            

            {/* Staff Table Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white">
                Staff Members ({staffList.length})
              </h2>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    if (showForm) resetForm();
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {showForm ? 'Cancel' : 'Add New Staff'}
                </button>
              </div>

              {/*Edit Form */}
              {showForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h3>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">NIC Number</label>
                      <input
                        type="text"
                        name="nicId"
                        value={formData.nicId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter NIC number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1" 
                             title = "Only past dates are allowed">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        max= "2007-12-31" // restricts future dates
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows="2"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option value="">Select Role</option>
                        <option value="Collector">Collector</option>
                        <option value="Driver">Driver</option>
                        <option value="FieldOfficer">Field Officer</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Recycler">Recycler</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Assigned Region/Zone</label>
                      <input
                        type="text"
                        name="assignedRegion"
                        value={formData.assignedRegion}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter assigned region/zone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Shift/Availability</label>
                      <select
                        name="shiftAvailability"
                        value={formData.shiftAvailability}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option value="">Select Shift</option>
                        <option value="Morning">Morning (8AM - 4PM)</option>
                        <option value="Evening">Evening (4PM - 12AM)</option>
                        <option value="Night">Night (12AM - 8AM)</option>
                      
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        {isLoading && <FaSpinner className="animate-spin" />}
                        {isLoading ? "Saving Staff Member..." : "Save Staff Member"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Staff Table */}
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffList.map((staff) => (
                      <tr key={staff._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{staff.fullName}</div>
                          <div className="text-sm text-gray-500">{staff.nicId}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{staff.role}</div>
                          <div className="text-sm text-gray-500">{staff.shiftAvailability}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{staff.assignedRegion}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{staff.email}</div>
                          <div className="text-sm text-gray-500">{staff.phoneNumber}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(staff)}
                              className="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
                            >
                              <FaEdit className="inline-block mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(staff._id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                            >
                              <FaTrash className="inline-block mr-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {popup && (
        <PopupModal
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
};

export default AdStaff; 