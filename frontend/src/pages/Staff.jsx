import React, { useState, useEffect } from 'react';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [groupedStaff, setGroupedStaff] = useState({});

  // Define the roles in order of display
  const roles = [
    { id: 'Supervisor', label: 'Supervisors' },
    { id: 'FieldOfficer', label: 'Field Officers' },
    { id: 'Collector', label: 'Collectors' },
    { id: 'Driver', label: 'Drivers' },
    { id: 'Recycler', label: 'Recyclers' }
  ];

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await fetch('https://waste-management-system-88cb.onrender.com/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
        
        // Group staff by role with proper initialization
        const grouped = roles.reduce((acc, role) => {
          acc[role.id] = [];
          return acc;
        }, {});

        data.forEach(staff => {
          if (grouped[staff.role]) {
            grouped[staff.role].push(staff);
          }
        });
        
        setGroupedStaff(grouped);
      } else {
        console.error('Failed to fetch staff data');
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };

  const getAvatarUrl = (gender) => {
    return gender === 'male' 
      ? 'https://www.w3schools.com/howto/img_avatar.png'
      : 'https://www.w3schools.com/howto/img_avatar2.png';
  };

  const truncateEmail = (email) => {
    if (!email) return '';
    const maxLength = 20; // Maximum length before truncation
    if (email.length > maxLength) {
      const atIndex = email.indexOf('@');
      if (atIndex > 0) {
        // Keep the part before @ and show ...@domain
        return `${email.substring(0, atIndex)}...@${email.substring(atIndex + 1)}`;
      }
    }
    return email;
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0fff0',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginTop: '80px'
    },
    heading: {
      textAlign: 'center',
      color: '#006400',
      marginBottom: '30px'
    },
    roleSection: {
      marginBottom: '30px',
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    roleHeading: {
      color: '#006400',
      borderBottom: '2px solid #28a745',
      paddingBottom: '10px',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '18px'
    },
    roleIcon: {
      width: '25px',
      height: '25px',
      backgroundColor: '#28a745',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '14px'
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px',
      padding: '10px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '15px',
      transition: 'transform 0.2s',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '100%',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '10px',
      paddingBottom: '10px',
      borderBottom: '1px solid #eee'
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      objectFit: 'cover'
    },
    nameContainer: {
      flex: 1
    },
    name: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#006400',
      margin: '0'
    },
    role: {
      fontSize: '14px',
      color: '#666',
      margin: '0'
    },
    infoSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      marginBottom: '8px',
      fontSize: '14px',
      width: '100%'
    },
    label: {
      color: '#666',
      fontSize: '13px'
    },
    value: {
      color: '#333',
      margin: '0',
      wordBreak: 'break-all',
      fontSize: '13px'
    },
    emailValue: {
      color: '#333',
      margin: '0',
      wordBreak: 'break-all',
      fontSize: '13px',
      lineHeight: '1.4'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Staff Members</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Meet our dedicated team members who work tirelessly to ensure efficient waste management and recycling operations.
          </p>
        </div>

        {roles.map(({ id, label }) => (
          <div key={id} className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                {label[0]}
              </span>
              {label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedStaff[id]?.map((staff) => (
                <div key={staff._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                    <img 
                      src={getAvatarUrl(staff.gender)} 
                      alt={staff.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-green-700">{staff.fullName}</h3>
                      <p className="text-gray-600">{staff.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-700 break-all">{staff.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-700">{staff.phoneNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Region</p>
                      <p className="text-gray-700">{staff.assignedRegion}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Shift</p>
                      <p className="text-gray-700">{staff.shiftAvailability}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staff;