import React, { useState, useEffect } from 'react';
import { 
  FaDownload, FaFileAlt, FaFilter, FaCalendarAlt, FaSearch, FaLeaf, FaRecycle
} from 'react-icons/fa';
import { 
  FiHome, FiAlertCircle, FiUsers, FiAward, FiUser, FiLogOut, FiChevronRight,
  FiGift, FiBarChart2, FiFileText, FiCalendar
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdReports = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportType, setReportType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [redeems, setRedeems] = useState([]);
  const [wasteReports, setWasteReports] = useState([]);
  const [recyclingData, setRecyclingData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [articles, setArticles] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new state variables for individual filters
  const [userFilter, setUserFilter] = useState({
    status: 'all',
    accountType: 'all',
    verificationStatus: 'all'
  });
  
  const [redeemFilter, setRedeemFilter] = useState({
    status: 'all',
    rewardType: 'all'
  });
  
  const [wasteFilter, setWasteFilter] = useState({
    wasteType: 'all',
    status: 'all',
    location: ''
  });
  
  const [recyclingFilter, setRecyclingFilter] = useState({
    wasteType: 'all',
    center: 'all',
    status: 'all'
  });
  
  const [staffFilter, setStaffFilter] = useState({
    role: 'all',
    shift: 'all',
    region: 'all'
  });
  
  const [articleFilter, setArticleFilter] = useState({
    category: 'all',
    status: 'all'
  });
  
  const [eventFilter, setEventFilter] = useState({
    status: 'all',
    location: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRedeems();
    fetchWasteReports();
    fetchRecyclingData();
    fetchStaffData();
    fetchArticles();
    fetchEvents();
    fetchVolunteers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users data');
      }

      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to connect to the server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRedeems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/redeem');
      if (!response.ok) throw new Error('Failed to fetch redeems');
      const data = await response.json();
      console.log('Redeems data:', data); // Debug log
      setRedeems(data);
    } catch (error) {
      console.error('Error fetching redeems:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWasteReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/report/reports');
      if (!response.ok) throw new Error('Failed to fetch waste reports');
      const data = await response.json();
      setWasteReports(data);
    } catch (error) {
      console.error('Error fetching waste reports:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecyclingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/recycle');
      if (!response.ok) throw new Error('Failed to fetch recycling data');
      const data = await response.json();
      if (data.success) {
        setRecyclingData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch recycling data');
      }
    } catch (error) {
      console.error('Error fetching recycling data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/staff');
      if (!response.ok) throw new Error('Failed to fetch staff data');
      const data = await response.json();
      setStaffData(data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/volunteers');
      if (!response.ok) throw new Error('Failed to fetch volunteers');
      const data = await response.json();
      setVolunteers(data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadUsersReport = () => {
    if (loading) {
      alert('Please wait while we load the data...');
      return;
    }

    if (error) {
      alert('Cannot generate report due to an error: ' + error);
      return;
    }

    // filtered users data
    const filteredUsers = users.filter(user => {
      if (userFilter.status !== 'all' && user.isActive !== (userFilter.status === 'active')) return false;
      if (userFilter.accountType !== 'all' && user.accountType !== userFilter.accountType) return false;
      if (userFilter.verificationStatus !== 'all' && user.isVerified !== (userFilter.verificationStatus === 'verified')) return false;
      return true;
    });

    if (filteredUsers.length === 0 && volunteers.length === 0) {
      alert('No user or volunteer data available to generate report');
      return;
    }

    try {
      // Calculate statistics
      const totalUsers = filteredUsers.length;
      const activeUsers = filteredUsers.filter(user => user.isActive).length;
      const inactiveUsers = totalUsers - activeUsers;
      const totalPoints = filteredUsers.reduce((sum, user) => sum + (user.totalPoints || 0), 0);
      const totalRedeemPoints = filteredUsers.reduce((sum, user) => sum + (user.redeemPoints || 0), 0);
      const avgPointsPerUser = totalPoints / totalUsers;
      const totalVolunteers = volunteers.length;
      const approvedVolunteers = volunteers.filter(v => v.status === 'approved').length;
      const pendingVolunteers = volunteers.filter(v => v.status === 'pending').length;

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add title and subtitle
      const summaryData = [
        ['Go Green 360'],
        ['Users and Volunteers Report'],
        [''],
        ['Users Statistics'],
        ['Metric', 'Value'],
        ['Total Users', totalUsers],
        ['Active Users', activeUsers],
        ['Inactive Users', inactiveUsers],
        ['Total Points', totalPoints],
        ['Total Redeem Points', totalRedeemPoints],
        ['Average Points per User', avgPointsPerUser.toFixed(2)],
        [''],
        ['Volunteers Statistics'],
        ['Metric', 'Value'],
        ['Total Volunteers', totalVolunteers],
        ['Approved Volunteers', approvedVolunteers],
        ['Pending Volunteers', pendingVolunteers]
      ];

      // Add title and subtitle to user details sheet
      const userData = [
        ['Go Green 360'],
        ['Users Report - Detailed User Information'],
        [''],
        ['User ID', 'Name', 'Email', 'Phone', 'Status', 'Total Points', 'Redeem Points', 'Country', 'Date of Birth', 'Registration Date', 'Last Login', 'Address', 'City', 'State', 'Postal Code', 'Account Type', 'Verification Status', 'Last Activity']
      ];

      // Add filtered user data
      filteredUsers.forEach(user => {
        userData.push([
          user._id || 'N/A',
          `${user.firstName} ${user.lastName}`,
          user.email,
          user.phoneNumber,
          user.isActive ? 'Active' : 'Inactive',
          user.totalPoints || 0,
          user.redeemPoints || 0,
          user.country || 'N/A',
          user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A',
          user.address || 'N/A',
          user.city || 'N/A',
          user.state || 'N/A',
          user.postalCode || 'N/A',
          user.accountType || 'Standard',
          user.isVerified ? 'Verified' : 'Not Verified',
          user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'N/A'
        ]);
      });

      // Add volunteer details sheet
      const volunteerData = [
        ['Go Green 360'],
        ['Volunteers Report - Detailed Information'],
        [''],
        ['Name', 'Email', 'Phone', 'City', 'Preferred Area', 'Status', 'Skills', 'Motivation', 'Emergency Contact Name', 'Emergency Contact Phone', 'Emergency Contact Relation', 'Days Available', 'Time Slots', 'Past Experience']
      ];

      // Add volunteer data
      volunteers.forEach(volunteer => {
        volunteerData.push([
          volunteer.name || 'N/A',
          volunteer.email || 'N/A',
          volunteer.phone || 'N/A',
          volunteer.city || 'N/A',
          volunteer.preferredArea || 'N/A',
          volunteer.status || 'Pending',
          volunteer.skills || 'N/A',
          volunteer.motivation || 'N/A',
          volunteer.emergencyContact?.name || 'N/A',
          volunteer.emergencyContact?.phone || 'N/A',
          volunteer.emergencyContact?.relation || 'N/A',
          volunteer.daysAvailable?.join(', ') || 'N/A',
          volunteer.timeSlots?.join(', ') || 'N/A',
          volunteer.pastExperience || 'N/A'
        ]);
      });

      // Create worksheets with titles
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      const userWs = XLSX.utils.aoa_to_sheet(userData);
      const volunteerWs = XLSX.utils.aoa_to_sheet(volunteerData);

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      XLSX.utils.book_append_sheet(wb, userWs, 'User Details');
      XLSX.utils.book_append_sheet(wb, volunteerWs, 'Volunteer Details');

      // Generate Excel file with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Go_Green_360_Users_Report_${timestamp}.xlsx`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report: ' + error.message);
    }
  };

  const downloadRedeemsReport = () => {
    if (loading) {
      alert('Please wait while we load the data...');
      return;
    }

    if (error) {
      alert('Cannot generate report due to an error: ' + error);
      return;
    }

    // Get filtered redeems data
    const filteredRedeems = redeems.filter(redeem => {
      if (redeemFilter.status !== 'all' && redeem.status !== redeemFilter.status) return false;
      if (redeemFilter.rewardType !== 'all' && redeem.rewardType !== redeemFilter.rewardType) return false;
      return true;
    });

    if (filteredRedeems.length === 0) {
      alert('No redeem data available to generate report');
      return;
    }

    try {
      // Calculate statistics using filtered data
      const totalRedeems = filteredRedeems.length;
      const pendingRedeems = filteredRedeems.filter(r => r.status === 'pending').length;
      const shippedRedeems = filteredRedeems.filter(r => r.status === 'shipped').length;
      const deliveredRedeems = filteredRedeems.filter(r => r.status === 'delivered').length;
      const totalPoints = filteredRedeems.reduce((sum, redeem) => sum + (redeem.rewardPoints || 0), 0);

      // Create new PDF document
      const doc = new jsPDF();

      // Add title and subtitle
      doc.setFontSize(20);
      doc.text('Go Green 360', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Redeems Report', 105, 30, { align: 'center' });

      // Add report generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

      // Add summary section
      doc.setFontSize(12);
      doc.text('Summary', 14, 50);
      doc.setFontSize(10);
      doc.text(`Total Redeems: ${totalRedeems}`, 14, 60);
      doc.text(`Pending: ${pendingRedeems}`, 14, 65);
      doc.text(`Shipped: ${shippedRedeems}`, 14, 70);
      doc.text(`Delivered: ${deliveredRedeems}`, 14, 75);
      doc.text(`Total Points Redeemed: ${totalPoints}`, 14, 80);

      // Prepare table data
      const tableData = filteredRedeems.map(redeem => {
        console.log('Processing redeem:', redeem); // Debug log
        return [
          redeem.userName || 'N/A',
          redeem.rewardName || 'N/A',
          redeem.rewardPoints || 0,
          redeem.shippingInfo?.name || 'N/A',
          redeem.shippingInfo?.address || 'N/A',
          redeem.shippingInfo?.phoneNumber || 'N/A',
          redeem.status || 'N/A',
          redeem.redemptionDate ? new Date(redeem.redemptionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A'
        ];
      });

      // Add table using autoTable
      autoTable(doc, {
        startY: 90,
        head: [['User', 'Reward', 'Points', 'Name', 'Address', 'Phone', 'Status', 'Date']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 137, 123] },
        columnStyles: {
          7: { cellWidth: 30 } // Make the date column wider
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`Go_Green_360_Redeems_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report: ' + error.message);
    }
  };

  const downloadWasteReports = () => {
    if (loading) {
      alert('Please wait while we load the data...');
      return;
    }

    if (error) {
      alert('Cannot generate report due to an error: ' + error);
      return;
    }

    // Get filtered waste reports data
    const filteredWasteReports = wasteReports.filter(report => {
      const wasteTypeMatch = wasteFilter.wasteType === 'all' || 
        (report.wasteType && report.wasteType.toLowerCase() === wasteFilter.wasteType.toLowerCase());
      const statusMatch = wasteFilter.status === 'all' || 
        (report.status && report.status.toLowerCase() === wasteFilter.status.toLowerCase());
      const locationMatch = !wasteFilter.location || 
        (report.location && report.location.toLowerCase().includes(wasteFilter.location.toLowerCase()));

      console.log('Waste Report:', report);
      console.log('Filter matches:', { 
        wasteTypeMatch, 
        statusMatch, 
        locationMatch,
        reportWasteType: report.wasteType,
        filterWasteType: wasteFilter.wasteType
      });

      return wasteTypeMatch && statusMatch && locationMatch;
    });

    console.log('Filtered waste reports:', filteredWasteReports);

    if (filteredWasteReports.length === 0) {
      const message = `No waste reports match the current filters:
        - Waste Type: ${wasteFilter.wasteType}
        - Status: ${wasteFilter.status}
        - Location: ${wasteFilter.location || 'Any'}
        
        Available waste types: ${[...new Set(wasteReports.map(report => report.wasteType))].join(', ')}`;
      alert(message);
      return;
    }

    try {
      // Calculate statistics using filtered data
      const totalReports = filteredWasteReports.length;
      const pendingReports = filteredWasteReports.filter(r => r.status === 'Pending').length;
      const inProgressReports = filteredWasteReports.filter(r => r.status === 'In Progress').length;
      const resolvedReports = filteredWasteReports.filter(r => r.status === 'Resolved').length;

      // Group reports by waste type using filtered data
      const wasteTypeStats = filteredWasteReports.reduce((acc, report) => {
        acc[report.wasteType] = (acc[report.wasteType] || 0) + 1;
        return acc;
      }, {});

      // Create new PDF document
      const doc = new jsPDF();

      // Add title and subtitle
      doc.setFontSize(20);
      doc.text('Go Green 360', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Waste Reports', 105, 30, { align: 'center' });

      // Add report generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

      // Add summary section
      doc.setFontSize(12);
      doc.text('Summary', 14, 50);
      doc.setFontSize(10);
      doc.text(`Total Reports: ${totalReports}`, 14, 60);
      doc.text(`Pending: ${pendingReports}`, 14, 65);
      doc.text(`In Progress: ${inProgressReports}`, 14, 70);
      doc.text(`Resolved: ${resolvedReports}`, 14, 75);

      // Add waste type distribution
      doc.setFontSize(12);
      doc.text('Waste Type Distribution', 14, 85);
      doc.setFontSize(10);
      let yPos = 95;
      Object.entries(wasteTypeStats).forEach(([type, count]) => {
        doc.text(`${type}: ${count} reports`, 14, yPos);
        yPos += 5;
      });

      // Prepare table data
      const tableData = filteredWasteReports.map(report => [
        report.wasteType || 'N/A',
        report.location || 'N/A',
        report.reporterName || 'N/A',
        report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A',
        report.description || 'N/A',
        report.status || 'N/A'
      ]);

      // Add table using autoTable
      autoTable(doc, {
        startY: yPos + 10,
        head: [['Waste Type', 'Location', 'Reporter', 'Date', 'Description', 'Status']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 137, 123] },
        columnStyles: {
          3: { cellWidth: 30 }, // Date column
          4: { cellWidth: 50 }  // Description column
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`Go_Green_360_Waste_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report: ' + error.message);
    }
  };

  const downloadRecyclingReport = () => {
    if (loading) {
      alert('Please wait while we load the data...');
      return;
    }

    // Add debug logging
    console.log('Original recycling data:', recyclingData);
    console.log('Current recycling filters:', recyclingFilter);

    // Get filtered recycling data
    const filteredRecyclingData = recyclingData.filter(item => {
      // Add debug logging for each filter condition
      const wasteTypeMatch = recyclingFilter.wasteType === 'all' || 
        (item.wasteType && item.wasteType.toLowerCase() === recyclingFilter.wasteType.toLowerCase());
      const centerMatch = recyclingFilter.center === 'all' || 
        (item.recyclingCenter && item.recyclingCenter.toLowerCase() === recyclingFilter.center.toLowerCase());
      const statusMatch = recyclingFilter.status === 'all' || 
        (item.status && item.status.toLowerCase() === recyclingFilter.status.toLowerCase());

      console.log('Item:', item);
      console.log('Filter matches:', { 
        wasteTypeMatch, 
        centerMatch, 
        statusMatch,
        itemWasteType: item.wasteType,
        filterWasteType: recyclingFilter.wasteType
      });

      return wasteTypeMatch && centerMatch && statusMatch;
    });

    console.log('Filtered recycling data:', filteredRecyclingData);

    // Check if we have any data at all
    if (!recyclingData || recyclingData.length === 0) {
      alert('No recycling data available in the system');
      return;
    }

    // Check if filtering resulted in no data
    if (filteredRecyclingData.length === 0) {
      // Show more detailed message about the current filter
      const message = `No recycling data matches the current filters:
        - Waste Type: ${recyclingFilter.wasteType}
        - Center: ${recyclingFilter.center}
        - Status: ${recyclingFilter.status}
        
        Available waste types: ${[...new Set(recyclingData.map(item => item.wasteType))].join(', ')}`;
      alert(message);
      return;
    }

    try {
      // Calculate statistics using filtered data
      const totalRecycled = filteredRecyclingData.length;
      const totalQuantity = filteredRecyclingData.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
      
      // Group by waste type using filtered data
      const wasteTypeStats = filteredRecyclingData.reduce((acc, item) => {
        acc[item.wasteType] = (acc[item.wasteType] || 0) + (parseFloat(item.quantity) || 0);
        return acc;
      }, {});

      // Group by recycling center using filtered data
      const centerStats = filteredRecyclingData.reduce((acc, item) => {
        acc[item.recyclingCenter] = (acc[item.recyclingCenter] || 0) + (parseFloat(item.quantity) || 0);
        return acc;
      }, {});

      // Create new PDF document
      const doc = new jsPDF();

      // Add title and subtitle
      doc.setFontSize(20);
      doc.text('Go Green 360', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Recycling Activity Report', 105, 30, { align: 'center' });

      // Add report generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

      // Add summary section
      doc.setFontSize(12);
      doc.text('Summary', 14, 50);
      doc.setFontSize(10);
      doc.text(`Total Recycling Activities: ${totalRecycled}`, 14, 60);
      doc.text(`Total Quantity Recycled: ${totalQuantity.toFixed(2)} kg`, 14, 65);

      // Add waste type distribution
      doc.setFontSize(12);
      doc.text('Waste Type Distribution', 14, 75);
      doc.setFontSize(10);
      let yPos = 85;
      Object.entries(wasteTypeStats).forEach(([type, quantity]) => {
        doc.text(`${type}: ${quantity.toFixed(2)} kg`, 14, yPos);
        yPos += 5;
      });

      // Add recycling center distribution
      doc.setFontSize(12);
      doc.text('Recycling Center Distribution', 14, yPos + 5);
      doc.setFontSize(10);
      yPos += 15;
      Object.entries(centerStats).forEach(([center, quantity]) => {
        doc.text(`${center}: ${quantity.toFixed(2)} kg`, 14, yPos);
        yPos += 5;
      });

      // Prepare table data
      const tableData = filteredRecyclingData.map(item => [
        item.userName || 'N/A',
        item.userPhone || 'N/A',
        item.wasteType || 'N/A',
        `${parseFloat(item.quantity).toFixed(2)} kg`,
        item.recyclingCenter || 'N/A',
        item.dateTime ? new Date(item.dateTime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : 'N/A',
        item.status || 'N/A'
      ]);

      // Add table using autoTable
      autoTable(doc, {
        startY: yPos + 10,
        head: [['User Name', 'Phone', 'Waste Type', 'Quantity', 'Recycling Center', 'Date & Time', 'Status']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 137, 123] },
        columnStyles: {
          5: { cellWidth: 40 }, // Date column
          3: { cellWidth: 25 }  // Quantity column
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`Go_Green_360_Recycling_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report: ' + error.message);
    }
  };

  const downloadStaffReport = () => {
    if (loading) {
      alert('Please wait while we load the data...');
      return;
    }

    if (error) {
      alert('Cannot generate report due to an error: ' + error);
      return;
    }

    // Get filtered staff data
    const filteredStaffData = staffData.filter(staff => {
      if (staffFilter.role !== 'all' && staff.role !== staffFilter.role) return false;
      if (staffFilter.shift !== 'all' && staff.shiftAvailability !== staffFilter.shift) return false;
      if (staffFilter.region !== 'all' && staff.assignedRegion !== staffFilter.region) return false;
      return true;
    });

    if (filteredStaffData.length === 0) {
      alert('No staff data available to generate report');
      return;
    }

    try {
      // Calculate statistics using filtered data
      const totalStaff = filteredStaffData.length;
      
      // Group by role using filtered data
      const roleStats = filteredStaffData.reduce((acc, staff) => {
        acc[staff.role] = (acc[staff.role] || 0) + 1;
        return acc;
      }, {});

      // Group by shift using filtered data
      const shiftStats = filteredStaffData.reduce((acc, staff) => {
        acc[staff.shiftAvailability] = (acc[staff.shiftAvailability] || 0) + 1;
        return acc;
      }, {});

      // Group by region using filtered data
      const regionStats = filteredStaffData.reduce((acc, staff) => {
        acc[staff.assignedRegion] = (acc[staff.assignedRegion] || 0) + 1;
        return acc;
      }, {});

      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');

      // Add title and subtitle
      doc.setFontSize(20);
      doc.text('Go Green 360', 148, 20, { align: 'center' }); // Adjusted x-coordinate for landscape
      doc.setFontSize(16);
      doc.text('Staff Management Report', 148, 30, { align: 'center' });

      // Add report generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 148, 40, { align: 'center' });

      // Add summary section
      doc.setFontSize(12);
      doc.text('Summary', 14, 50);
      doc.setFontSize(10);
      doc.text(`Total Staff Members: ${totalStaff}`, 14, 60);

      // Add role distribution
      doc.setFontSize(12);
      doc.text('Role Distribution', 14, 70);
      doc.setFontSize(10);
      let yPos = 80;
      Object.entries(roleStats).forEach(([role, count]) => {
        doc.text(`${role}: ${count} staff members`, 14, yPos);
        yPos += 5;
      });

      // Add shift distribution
      doc.setFontSize(12);
      doc.text('Shift Distribution', 14, yPos + 5);
      doc.setFontSize(10);
      yPos += 15;
      Object.entries(shiftStats).forEach(([shift, count]) => {
        doc.text(`${shift}: ${count} staff members`, 14, yPos);
        yPos += 5;
      });

      // Add region distribution
      doc.setFontSize(12);
      doc.text('Region Distribution', 14, yPos + 5);
      doc.setFontSize(10);
      yPos += 15;
      Object.entries(regionStats).forEach(([region, count]) => {
        doc.text(`${region}: ${count} staff members`, 14, yPos);
        yPos += 5;
      });

      // Prepare table data
      const tableData = filteredStaffData.map(staff => [
        staff.fullName || 'N/A',
        staff.nicId || 'N/A',
        staff.role || 'N/A',
        staff.assignedRegion || 'N/A',
        staff.shiftAvailability || 'N/A',
        staff.email || 'N/A',
        staff.phoneNumber || 'N/A',
        staff.gender || 'N/A',
        staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A'
      ]);

      // Add table using autoTable with optimized column widths for landscape
      autoTable(doc, {
        startY: yPos + 10,
        head: [['Name', 'NIC/ID', 'Role', 'Region', 'Shift', 'Email', 'Phone', 'Gender', 'Date of Birth']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 137, 123] },
        columnStyles: {
          0: { cellWidth: 35 }, // Name
          1: { cellWidth: 25 }, // NIC/ID
          2: { cellWidth: 25 }, // Role
          3: { cellWidth: 30 }, // Region
          4: { cellWidth: 30 }, // Shift
          5: { cellWidth: 40 }, // Email
          6: { cellWidth: 25 }, // Phone
          7: { cellWidth: 15 }, // Gender
          8: { cellWidth: 25 }  // Date of Birth
        },
        margin: { left: 14, right: 14 } // Add margins to prevent content from being cut off
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`Go_Green_360_Staff_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report: ' + error.message);
    }
  };

  const downloadArticlesReport = () => {
    if (loading) {
      alert('Please wait while we load the data...');
      return;
    }

    if (error) {
      alert('Cannot generate report due to an error: ' + error);
      return;
    }

    // Get filtered articles data
    const filteredArticles = articles.filter(article => {
      if (articleFilter.category !== 'all' && article.category !== articleFilter.category) return false;
      if (articleFilter.status !== 'all' && article.status !== articleFilter.status) return false;
      return true;
    });

    if (filteredArticles.length === 0) {
      alert('No articles available to generate report');
      return;
    }

    try {
      // Calculate statistics using filtered data
      const totalArticles = filteredArticles.length;
      const approvedArticles = filteredArticles.filter(a => a.status === 'approved').length;
      const declinedArticles = filteredArticles.filter(a => a.status === 'declined').length;
      const pendingArticles = filteredArticles.filter(a => a.status === 'pending').length;

      // Group by category using filtered data
      const categoryStats = filteredArticles.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {});

      // Create new PDF document in landscape orientation
      const doc = new jsPDF('landscape');

      // Add title and subtitle
      doc.setFontSize(20);
      doc.text('Go Green 360', 148, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Articles Management Report', 148, 30, { align: 'center' });

      // Add report generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 148, 40, { align: 'center' });

      // Add summary section
      doc.setFontSize(12);
      doc.text('Summary', 14, 50);
      doc.setFontSize(10);
      doc.text(`Total Articles: ${totalArticles}`, 14, 60);
      doc.text(`Approved: ${approvedArticles}`, 14, 65);
      doc.text(`Declined: ${declinedArticles}`, 14, 70);
      doc.text(`Pending: ${pendingArticles}`, 14, 75);

      // Add category distribution
      doc.setFontSize(12);
      doc.text('Category Distribution', 14, 85);
      doc.setFontSize(10);
      let yPos = 95;
      Object.entries(categoryStats).forEach(([category, count]) => {
        doc.text(`${category}: ${count} articles`, 14, yPos);
        yPos += 5;
      });

      // Prepare table data
      const tableData = filteredArticles.map(article => [
        article.title || 'N/A',
        article.category || 'N/A',
        article.author || 'N/A',
        article.date ? new Date(article.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A',
        article.status || 'pending',
        article.excerpt || 'N/A'
      ]);

      // Add table using autoTable with optimized column widths for landscape
      autoTable(doc, {
        startY: yPos + 10,
        head: [['Title', 'Category', 'Author', 'Date', 'Status', 'Excerpt']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 137, 123] },
        columnStyles: {
          0: { cellWidth: 50 }, // Title
          1: { cellWidth: 30 }, // Category
          2: { cellWidth: 30 }, // Author
          3: { cellWidth: 25 }, // Date
          4: { cellWidth: 20 }, // Status
          5: { cellWidth: 60 }  // Excerpt
        },
        margin: { left: 14, right: 14 }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`Go_Green_360_Articles_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report: ' + error.message);
    }
  };

  const downloadEventsReport = () => {
    if (loading) {
      alert('Please wait while we load the data...');
      return;
    }
    if (error) {
      alert('Cannot generate report due to an error: ' + error);
      return;
    }

    // Get filtered events data
    const filteredEvents = events.filter(event => {
      if (eventFilter.status !== 'all' && event.status !== eventFilter.status) return false;
      if (eventFilter.location && !event.location.toLowerCase().includes(eventFilter.location.toLowerCase())) return false;
      return true;
    });

    if (filteredEvents.length === 0) {
      alert('No events data available to generate report');
      return;
    }

    try {
      // Calculate statistics using filtered data
      const totalEvents = filteredEvents.length;
      const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming').length;
      const ongoingEvents = filteredEvents.filter(e => e.status === 'ongoing').length;
      const completedEvents = filteredEvents.filter(e => e.status === 'completed').length;
      const cancelledEvents = filteredEvents.filter(e => e.status === 'cancelled').length;

      // Create new PDF document
      const doc = new jsPDF('landscape');
      doc.setFontSize(20);
      doc.text('Go Green 360', 148, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Events Report', 148, 30, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 148, 40, { align: 'center' });

      // Summary
      doc.setFontSize(12);
      doc.text('Summary', 14, 50);
      doc.setFontSize(10);
      doc.text(`Total Events: ${totalEvents}`, 14, 60);

      // Status distribution
      const statusStats = filteredEvents.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {});
      doc.setFontSize(12);
      doc.text('Status Distribution', 14, 70);
      doc.setFontSize(10);
      let yPos = 80;
      Object.entries(statusStats).forEach(([status, count]) => {
        doc.text(`${status}: ${count} events`, 14, yPos);
        yPos += 5;
      });

      // Table
      const tableData = filteredEvents.map(event => [
        event.title || 'N/A',
        event.date ? new Date(event.date).toLocaleDateString() : 'N/A',
        event.time || 'N/A',
        event.location || 'N/A',
        event.maxParticipants || 'N/A',
        event.status || 'N/A',
        event.description || 'N/A'
      ]);
      autoTable(doc, {
        startY: yPos + 10,
        head: [['Title', 'Date', 'Time', 'Location', 'Max Participants', 'Status', 'Description']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 137, 123] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 60 }
        },
        margin: { left: 14, right: 14 }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`Go_Green_360_Events_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      alert('Failed to generate PDF report: ' + error.message);
    }
  };

  // Placeholder data
  const reportTypes = [
    { id: 'all', name: 'All Reports' },
    { id: 'waste', name: 'Waste Reports' },
    { id: 'recycling', name: 'Recycling Activities' },
    { id: 'events', name: 'Event Reports' },
    { id: 'users', name: 'User Reports' },
  ];

  const placeholderReports = [
    {
      id: 'RPT001',
      type: 'Waste Report',
      date: '2024-03-15',
      status: 'completed',
      description: 'Monthly waste collection report for March 2024'
    },
    {
      id: 'RPT002',
      type: 'Recycling Activity',
      date: '2024-03-14',
      status: 'pending',
      description: 'Community recycling program participation report'
    },
    {
      id: 'RPT003',
      type: 'Event Report',
      date: '2024-03-13',
      status: 'completed',
      description: 'Clean-up event summary - Central Park'
    },
    {
      id: 'RPT004',
      type: 'User Report',
      date: '2024-03-12',
      status: 'completed',
      description: 'User participation and engagement metrics'
    },
    {
      id: 'RPT005',
      type: 'Waste Report',
      date: '2024-03-11',
      status: 'failed',
      description: 'Waste collection efficiency analysis'
    }
  ];

  // Navigation items
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

  // Add filter options
  const userFilterOptions = {
    status: ['all', 'active', 'inactive'],
    accountType: ['all', 'standard', 'premium'],
    verificationStatus: ['all', 'verified', 'unverified']
  };

  const redeemFilterOptions = {
    status: ['all', 'pending', 'shipped', 'delivered'],
    rewardType: ['all', 'physical', 'digital', 'points']
  };

  const wasteFilterOptions = {
    wasteType: [
      'all',
      'Plastic Waste (Bottles, bags, packaging, etc.)',
      'Paper Waste (Newspapers, books, cardboard, etc.)',
      'Glass Waste (Bottles, jars, broken glass, etc.)',
      'Metal Waste (Cans, aluminum foil, scrap metal, etc.)',
      'Organic Waste (Food scraps, garden waste, compostable items)',
      'E-Waste (Old electronics, batteries, wires, etc.)',
      'Hazardous Waste (Chemicals, medical waste, toxic materials)',
      'Textile Waste (Clothes, fabric scraps, shoes, etc.)',
      'Construction Waste (Bricks, cement, wood, tiles, etc.)',
      'Mixed Waste (General household waste that cannot be sorted)'
    ],
    status: ['all', 'Pending', 'In Progress', 'Resolved']
  };

  const recyclingFilterOptions = {
    wasteType: ['all', 'plastic', 'paper', 'glass', 'metal', 'organic', 'electronic'],
    status: ['all', 'pending', 'completed', 'cancelled']
  };

  const staffFilterOptions = {
    role: ['all', 'manager', 'supervisor', 'worker', 'driver'],
    shift: ['all', 'morning', 'afternoon', 'night'],
    region: ['all', 'north', 'south', 'east', 'west', 'central']
  };

  const articleFilterOptions = {
    category: ['all', 'news', 'tips', 'events', 'education'],
    status: ['all', 'approved', 'pending', 'declined']
  };

  const eventFilterOptions = {
    status: ['all', 'upcoming', 'ongoing', 'completed', 'cancelled']
  };

  const filterReports = () => {
    // Filter by report type
    let filteredReports = [];
    switch (reportType) {
      case 'users':
        filteredReports = [{
          id: 'USR001',
          type: 'User Report',
          date: new Date().toLocaleDateString(),
          description: 'Complete user database report including all user details and statistics',
          data: users.filter(user => {
            if (userFilter.status !== 'all' && user.isActive !== (userFilter.status === 'active')) return false;
            if (userFilter.accountType !== 'all' && user.accountType !== userFilter.accountType) return false;
            if (userFilter.verificationStatus !== 'all' && user.isVerified !== (userFilter.verificationStatus === 'verified')) return false;
            return true;
          }),
          downloadFn: downloadUsersReport
        }];
        break;
      case 'redeems':
        filteredReports = [{
          id: 'RED001',
          type: 'Redeems Report',
          date: new Date().toLocaleDateString(),
          description: 'Complete redeems report including all reward redemptions and shipping details',
          data: redeems.filter(redeem => {
            if (redeemFilter.status !== 'all' && redeem.status !== redeemFilter.status) return false;
            if (redeemFilter.rewardType !== 'all' && redeem.rewardType !== redeemFilter.rewardType) return false;
            return true;
          }),
          downloadFn: downloadRedeemsReport
        }];
        break;
      case 'waste':
        filteredReports = [{
          id: 'WST001',
          type: 'Waste Reports',
          date: new Date().toLocaleDateString(),
          description: 'Complete waste reports including all submitted waste reports and their status',
          data: wasteReports.filter(report => {
            if (wasteFilter.wasteType !== 'all' && report.wasteType !== wasteFilter.wasteType) return false;
            if (wasteFilter.status !== 'all' && report.status !== wasteFilter.status) return false;
            if (wasteFilter.location && !report.location.toLowerCase().includes(wasteFilter.location.toLowerCase())) return false;
            return true;
          }),
          downloadFn: downloadWasteReports
        }];
        break;
      case 'recycling':
        filteredReports = [{
          id: 'REC001',
          type: 'Recycling Report',
          date: new Date().toLocaleDateString(),
          description: 'Complete recycling activity report including all recycling entries and statistics',
          data: recyclingData.filter(item => {
            if (recyclingFilter.wasteType !== 'all' && item.wasteType !== recyclingFilter.wasteType) return false;
            if (recyclingFilter.center !== 'all' && item.recyclingCenter !== recyclingFilter.center) return false;
            if (recyclingFilter.status !== 'all' && item.status !== recyclingFilter.status) return false;
            return true;
          }),
          downloadFn: downloadRecyclingReport
        }];
        break;
      case 'staff':
        filteredReports = [{
          id: 'STF001',
          type: 'Staff Report',
          date: new Date().toLocaleDateString(),
          description: 'Complete staff management report including all staff details and statistics',
          data: staffData.filter(staff => {
            if (staffFilter.role !== 'all' && staff.role !== staffFilter.role) return false;
            if (staffFilter.shift !== 'all' && staff.shiftAvailability !== staffFilter.shift) return false;
            if (staffFilter.region !== 'all' && staff.assignedRegion !== staffFilter.region) return false;
            return true;
          }),
          downloadFn: downloadStaffReport
        }];
        break;
      case 'articles':
        filteredReports = [{
          id: 'ART001',
          type: 'Articles Report',
          date: new Date().toLocaleDateString(),
          description: 'Complete articles management report including all articles and their status',
          data: articles.filter(article => {
            if (articleFilter.category !== 'all' && article.category !== articleFilter.category) return false;
            if (articleFilter.status !== 'all' && article.status !== articleFilter.status) return false;
            return true;
          }),
          downloadFn: downloadArticlesReport
        }];
        break;
      case 'events':
        filteredReports = [{
          id: 'EVT001',
          type: 'Events Report',
          date: new Date().toLocaleDateString(),
          description: 'Complete events report including all event details and statistics',
          data: events.filter(event => {
            if (eventFilter.status !== 'all' && event.status !== eventFilter.status) return false;
            if (eventFilter.location && !event.location.toLowerCase().includes(eventFilter.location.toLowerCase())) return false;
            return true;
          }),
          downloadFn: downloadEventsReport
        }];
        break;
      default:
        filteredReports = [
          {
            id: 'USR001',
            type: 'User Report',
            date: new Date().toLocaleDateString(),
            description: 'Complete user database report including all user details and statistics',
            data: users,
            downloadFn: downloadUsersReport
          },
          {
            id: 'RED001',
            type: 'Redeems Report',
            date: new Date().toLocaleDateString(),
            description: 'Complete redeems report including all reward redemptions and shipping details',
            data: redeems,
            downloadFn: downloadRedeemsReport
          },
          {
            id: 'WST001',
            type: 'Waste Reports',
            date: new Date().toLocaleDateString(),
            description: 'Complete waste reports including all submitted waste reports and their status',
            data: wasteReports,
            downloadFn: downloadWasteReports
          },
          {
            id: 'REC001',
            type: 'Recycling Report',
            date: new Date().toLocaleDateString(),
            description: 'Complete recycling activity report including all recycling entries and statistics',
            data: recyclingData,
            downloadFn: downloadRecyclingReport
          },
          {
            id: 'STF001',
            type: 'Staff Report',
            date: new Date().toLocaleDateString(),
            description: 'Complete staff management report including all staff details and statistics',
            data: staffData,
            downloadFn: downloadStaffReport
          },
          {
            id: 'ART001',
            type: 'Articles Report',
            date: new Date().toLocaleDateString(),
            description: 'Complete articles management report including all articles and their status',
            data: articles,
            downloadFn: downloadArticlesReport
          },
          {
            id: 'EVT001',
            type: 'Events Report',
            date: new Date().toLocaleDateString(),
            description: 'Complete events report including all event details and statistics',
            data: events,
            downloadFn: downloadEventsReport
          }
        ];
    }

    // Filter by search query
    if (searchQuery) {
      filteredReports = filteredReports.filter(report => 
        report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      filteredReports = filteredReports.filter(report => {
        const reportDate = new Date(report.date);
        return reportDate >= startDate && reportDate <= endDate;
      });
    }

    return filteredReports;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setReportType('all');
    setStartDate(null);
    setEndDate(null);
    setUserFilter({ status: 'all', accountType: 'all', verificationStatus: 'all' });
    setRedeemFilter({ status: 'all', rewardType: 'all' });
    setWasteFilter({ wasteType: 'all', status: 'all', location: '' });
    setRecyclingFilter({ wasteType: 'all', center: 'all', status: 'all' });
    setStaffFilter({ role: 'all', shift: 'all', region: 'all' });
    setArticleFilter({ category: 'all', status: 'all' });
    setEventFilter({ status: 'all', location: '' });
  };

  // Add renderFilterSection function
  const renderFilterSection = () => {
    switch (reportType) {
      case 'users':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={userFilter.status}
                onChange={(e) => setUserFilter({ ...userFilter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {userFilterOptions.status.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select
                value={userFilter.accountType}
                onChange={(e) => setUserFilter({ ...userFilter, accountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {userFilterOptions.accountType.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
              <select
                value={userFilter.verificationStatus}
                onChange={(e) => setUserFilter({ ...userFilter, verificationStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {userFilterOptions.verificationStatus.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 'redeems':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={redeemFilter.status}
                onChange={(e) => setRedeemFilter({ ...redeemFilter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {redeemFilterOptions.status.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
              <select
                value={redeemFilter.rewardType}
                onChange={(e) => setRedeemFilter({ ...redeemFilter, rewardType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {redeemFilterOptions.rewardType.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 'waste':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
              <select
                value={wasteFilter.wasteType}
                onChange={(e) => setWasteFilter({ ...wasteFilter, wasteType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {wasteFilterOptions.wasteType.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={wasteFilter.status}
                onChange={(e) => setWasteFilter({ ...wasteFilter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {wasteFilterOptions.status.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={wasteFilter.location}
                onChange={(e) => setWasteFilter({ ...wasteFilter, location: e.target.value })}
                placeholder="Enter location"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        );
      case 'recycling':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
              <select
                value={recyclingFilter.wasteType}
                onChange={(e) => setRecyclingFilter({ ...recyclingFilter, wasteType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {recyclingFilterOptions.wasteType.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recycling Center</label>
              <select
                value={recyclingFilter.center}
                onChange={(e) => setRecyclingFilter({ ...recyclingFilter, center: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Centers</option>
                {/* Add your recycling centers here */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={recyclingFilter.status}
                onChange={(e) => setRecyclingFilter({ ...recyclingFilter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {recyclingFilterOptions.status.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 'staff':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={staffFilter.role}
                onChange={(e) => setStaffFilter({ ...staffFilter, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {staffFilterOptions.role.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select
                value={staffFilter.shift}
                onChange={(e) => setStaffFilter({ ...staffFilter, shift: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {staffFilterOptions.shift.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={staffFilter.region}
                onChange={(e) => setStaffFilter({ ...staffFilter, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {staffFilterOptions.region.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 'articles':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={articleFilter.category}
                onChange={(e) => setArticleFilter({ ...articleFilter, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {articleFilterOptions.category.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={articleFilter.status}
                onChange={(e) => setArticleFilter({ ...articleFilter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {articleFilterOptions.status.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 'events':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={eventFilter.status}
                onChange={(e) => setEventFilter({ ...eventFilter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {eventFilterOptions.status.map(option => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={eventFilter.location}
                onChange={(e) => setEventFilter({ ...eventFilter, location: e.target.value })}
                placeholder="Enter location"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
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
                        ${index === 9 ? "bg-green-700" : "hover:bg-green-600"}`}
                    >
                      {item.icon}
                      {item.name}
                      {index !== 9 && (
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
        <div className="flex-1 px-6 pt-10">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h2 className="text-xl text-center font-bold mb-4 p-3 rounded-t-lg bg-green-500 text-white w-full">
                Reports Management
              </h2>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Bar */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>

                {/* Report Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {reportTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholderText="Select end date"
                  />
                </div>
              </div>
              
              {/* Add the specific filters section */}
              {renderFilterSection()}
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filterReports().map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {report.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            loading ? 'bg-yellow-100 text-yellow-800' :
                            error ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {loading ? 'Loading...' : error ? 'Error' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={report.downloadFn}
                            disabled={loading || error}
                            className={`text-green-600 hover:text-green-900 flex items-center ${
                              (loading || error) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <FaDownload className="mr-1" />
                            {loading ? 'Loading...' : 'Download'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Empty State */}
            {!loading && !error && filterReports().length === 0 && (
              <div className="text-center py-12">
                <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or check back later.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdReports;
