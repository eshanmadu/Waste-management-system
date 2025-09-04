import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaTrash, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaSearch, FaExpand, FaDownload, FaFilePdf, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdPhotoLibrary, MdWarning, MdCheckCircle, MdHourglassEmpty } from "react-icons/md"

// Fix for Leaflet marker icons
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = icon;

// Waste type color mapping
const WASTE_TYPE_COLORS = {
  "Plastic Waste (Bottles, bags, packaging, etc.)": "bg-blue-100 text-blue-800",
  "Paper Waste (Newspapers, books, cardboard, etc.)": "bg-amber-100 text-amber-800",
  "Glass Waste (Bottles, jars, broken glass, etc.)": "bg-green-100 text-green-800",
  "Metal Waste (Cans, aluminum foil, scrap metal, etc.)": "bg-gray-100 text-gray-800",
  "Organic Waste (Food scraps, garden waste, compostable items)": "bg-brown-100 text-brown-800",
  "E-Waste (Old electronics, batteries, wires, etc.)": "bg-purple-100 text-purple-800",
  "Hazardous Waste (Chemicals, medical waste, toxic materials)": "bg-red-100 text-red-800",
  "Textile Waste (Clothes, fabric scraps, shoes, etc.)": "bg-pink-100 text-pink-800",
  "Construction Waste (Bricks, cement, wood, tiles, etc.)": "bg-orange-100 text-orange-800",
  "Mixed Waste (General household waste that cannot be sorted)": "bg-yellow-100 text-yellow-800"
};

// Status icons and colors
const STATUS_CONFIG = {
  "Pending": { icon: <MdHourglassEmpty className="text-yellow-500" />, color: "bg-yellow-100 text-yellow-800" },
  "In Progress": { icon: <MdWarning className="text-blue-500" />, color: "bg-blue-100 text-blue-800" },
  "Resolved": { icon: <MdCheckCircle className="text-green-500" />, color: "bg-green-100 text-green-800" }
};

const WasteReporting = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    wasteType: "",
    location: "",
    reporterName: "",
    reportDate: "",
    description: "",
    latitude: null,
    longitude: null,
  });

  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [mapPosition, setMapPosition] = useState([7.8731, 80.7718]); // Sri Lanka center
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (token && user) {
      setIsLoggedIn(true);
      // Get the full name from firstName and lastName
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      setFormData(prev => ({
        ...prev,
        reporterName: fullName
      }));
    }
  }, []);

  // Get valid date range (today and one year ago)
  const getValidDateRange = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    return {
      maxDate: today.toISOString().split('T')[0],
      minDate: oneYearAgo.toISOString().split('T')[0],
      today: today,
      oneYearAgo: oneYearAgo
    };
  };

  const {maxDate, minDate, today, oneYearAgo } = getValidDateRange();

  // Move map to new position
  const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 13);
    }, [center, map]);
    return null;
  };

  // Handle location search
  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5&countrycodes=LK`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Location search error:", error);
    }
  };

  // Update location from search selection
  const handleLocationSelect = (lat, lon, display_name) => {
    const newPosition = [parseFloat(lat), parseFloat(lon)];
    setMarkerPosition(newPosition);
    setMapPosition(newPosition);
    setFormData(prev => ({
      ...prev,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      location: display_name,
    }));
    setSearchResults([]);
  };

  // Handle map click to set location
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const newPosition = [e.latlng.lat, e.latlng.lng];
        setMarkerPosition(newPosition);
        setFormData(prev => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          location: `${e.latlng.lat}, ${e.latlng.lng}`,
        }));
      },
    });

    const position = markerPosition || 
      (formData.latitude && formData.longitude 
        ? [formData.latitude, formData.longitude] 
        : null);
    
    return position ? <Marker position={position} /> : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for date field
    if (name === "reportDate") {
      const selectedDate = new Date(value);
      const { today, oneYearAgo } = getValidDateRange();
      
      if (selectedDate > today) {
        setError("Report date cannot be in the future");
        return;
      }
      
      if (selectedDate < oneYearAgo) {
        setError("Report date cannot be older than one year");
        return;
      }
      
      setError("");
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit
    if (files.length + photos.length > 3) {
      setError("Maximum 3 photos allowed");
      return;
    }

    // Check file size for each file (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      setError(`The following files are too large (max 5MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // If all files are valid, add them to the photos array
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);

    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  // Function to add waste report notification
  const addWasteReportNotification = (reportData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const notification = {
      id: Date.now(),
      message: `New waste report submitted: ${reportData.wasteType.split(' (')[0]} at ${reportData.location.substring(0, 30)}...`,
      time: new Date().toLocaleTimeString(),
      read: false,
      link: '/waste/tracking',
      userId: user.userId
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!isLoggedIn) {
      setError("Please login to submit a report");
      navigate("/login");
      return;
    }

    // Date validation
    if (formData.reportDate) {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const reportDate = new Date(formData.reportDate);
      
      if (reportDate > today) {
        setError("Report date cannot be in the future");
        setIsLoading(false);
        return;
      }
      
      if (reportDate < oneYearAgo) {
        setError("Report date cannot be older than one year");
        setIsLoading(false);
        return;
      }
    };

    if (!formData.wasteType || !formData.latitude || !formData.longitude || !formData.reportDate || !formData.description) {
      setError("Please fill in all required fields and select a location on the map");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      setError("No token or userId found. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      //upload photos to Cloudinary
      const photoUrls = [];
      for (const photo of photos) {
        const formData = new FormData();
        formData.append('photo', photo);
        
        const uploadResponse = await fetch("http://localhost:5001/api/report/upload-photo", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        let data;
        const contentType = uploadResponse.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await uploadResponse.json();
          } catch (jsonError) {
            console.error("Failed to parse JSON response:", jsonError);
            throw new Error("Server returned invalid JSON");
          }
        } else {
          const text = await uploadResponse.text();
          console.error("Server returned non-JSON response:", text);
          throw new Error("Invalid type - Try to upload jpg or png");
        }

        if (!uploadResponse.ok) {
          if (data.message && data.message.includes("File size too large")) {
            setError("File size too large. Maximum size is 5MB.");
            setIsLoading(false);
            return;
          }
          throw new Error(data.message || "Failed to upload photo");
        }

        if (!data.success) {
          throw new Error(data.message || "Upload failed");
        }

        const { url, public_id } = data;
        if (!url || !public_id) {
          throw new Error("Invalid response from server");
        }

        photoUrls.push({ url, public_id });
      }

      // submit report with photo URLs
      const response = await fetch("http://localhost:5001/api/report/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          reportDate: new Date(formData.reportDate).toISOString(),
          reporterName: formData.reporterName,
          status: "Pending",
          userId: userId,
          photos: photoUrls,
        }),
      });

      let reportData;
      const reportContentType = response.headers.get('content-type');
      
      if (reportContentType && reportContentType.includes('application/json')) {
        try {
          reportData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse report JSON response:", jsonError);
          throw new Error("Server returned invalid JSON for report");
        }
      } else {
        const text = await response.text();
        console.error("Server returned non-JSON response for report:", text);
        throw new Error("Server error - please try again later");
      }

      if (!response.ok) {
        throw new Error(reportData.message || "Failed to submit report");
      }

      // Add notification for the waste report
      addWasteReportNotification(formData);

      // Show success message and reset form
      setShowPopup(true);
      
      // Reset form data
      setFormData({
        wasteType: "",
        location: "",
        reporterName: "",
        reportDate: "",
        description: "",
        latitude: null,
        longitude: null,
      });
      
      // Clear photos and previews
      setPhotos([]);
      setPreviewUrls([]);
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByName = async () => {
    if (!searchName.trim()) {
      setError("Please enter a name.");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5001/api/report/searchByName?name=${searchName}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No reports found.");
      }

      setReports(data);
      setCurrentPage(0);
      setExpandedReportId(null);
    } catch (err) {
      setError(err.message);
      setReports([]);
    } finally {
      setIsSearching(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const toggleReportExpansion = (reportId) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  const openPhotoModal = (index) => {
    setSelectedPhotoIndex(index);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setSelectedPhotoIndex(null);
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.text("Waste Reports", 20, 20);
    doc.setFontSize(12);

    reports.forEach((report, index) => {
      const yStart = 40 + (index * 60);
      
      // Add a new page for every report except the first one
      if (index > 0) {
        doc.addPage();
      }
      
      doc.text(`Report #${index + 1}`, 20, yStart);
      doc.text(`Waste Type: ${report.wasteType}`, 20, yStart + 10);
      doc.text(`Location: ${report.location}`, 20, yStart + 20);
      doc.text(`Reporter Name: ${report.reporterName || "Anonymous"}`, 20, yStart + 30);
      doc.text(`Report Date: ${new Date(report.reportDate).toLocaleDateString()}`, 20, yStart + 40);
      doc.text(`Description: ${report.description}`, 20, yStart + 50);
      
      // Add status with color
      doc.setTextColor(0, 0, 0);
      doc.text(`Status: `, 20, yStart + 60);
      if (report.status === "Pending") {
        doc.setTextColor(255, 165, 0); // Orange
      } else if (report.status === "In Progress") {
        doc.setTextColor(0, 0, 255); // Blue
      } else if (report.status === "Resolved") {
        doc.setTextColor(0, 128, 0); // Green
      }
      doc.text(report.status, 40, yStart + 60);
    });

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
    setShowPdfPreview(true);
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'Waste_Reports.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const nextPage = () => {
    if (currentPage < reports.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 py-10 pt-32">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
        <h2 className="text-4xl font-bold text-center text-green-700 mb-6">Report Waste</h2>

        {!isLoggedIn && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
            <p>Please <button onClick={() => navigate("/login")} className="text-blue-500">login</button> to submit a waste report.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Waste Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Waste Type *</label>
            <select
              name="wasteType"
              value={formData.wasteType}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            >
              <option value="">Select type</option>
              <option value="Plastic Waste (Bottles, bags, packaging, etc.)">Plastic Waste (Bottles, bags, packaging, etc.)</option>
              <option value="Paper Waste (Newspapers, books, cardboard, etc.)">Paper Waste (Newspapers, books, cardboard, etc.)</option>
              <option value="Glass Waste (Bottles, jars, broken glass, etc.)">Glass Waste (Bottles, jars, broken glass, etc.)</option>
              <option value="Metal Waste (Cans, aluminum foil, scrap metal, etc.)">Metal Waste (Cans, aluminum foil, scrap metal, etc.)</option>
              <option value="Organic Waste (Food scraps, garden waste, compostable items)">Organic Waste (Food scraps, garden waste, compostable items)</option>
              <option value="E-Waste (Old electronics, batteries, wires, etc.)">E-Waste (Old electronics, batteries, wires, etc.)</option>
              <option value="Hazardous Waste (Chemicals, medical waste, toxic materials)">Hazardous Waste (Chemicals, medical waste, toxic materials)</option>
              <option value="Textile Waste (Clothes, fabric scraps, shoes, etc.)">Textile Waste (Clothes, fabric scraps, shoes, etc.)</option>
              <option value="Construction Waste (Bricks, cement, wood, tiles, etc.)">Construction Waste (Bricks, cement, wood, tiles, etc.)</option>
              <option value="Mixed Waste (General household waste that cannot be sorted)">Mixed Waste (General household waste that cannot be sorted)</option>
            </select>
          </div>

          {/* Location Search */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-4 py-2 border rounded"
                placeholder="Search for a location in Sri Lanka"
              />
              <button 
                type="button" 
                onClick={handleLocationSearch}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Search
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="relative z-20 mb-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((place, index) => (
                    <li 
                      key={index} 
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleLocationSelect(place.lat, place.lon, place.display_name)}
                    >
                      {place.display_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Map */}
            <div className="relative z-0 mt-4">
              <MapContainer 
                center={mapPosition} 
                zoom={13} 
                style={{ height: "300px", width: "100%", zIndex: 0 }}
                className="rounded border border-gray-300"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={mapPosition} />
                <LocationMarker />
              </MapContainer>
              <p className="mt-2 text-gray-700">
                <strong>Selected Location:</strong> {formData.location || "Click on map or search above"}
              </p>
            </div>
          </div>

          {/* Reporter Name - Only show if logged in */}
          {isLoggedIn && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Reporter Name *</label>
              <input
                type="text"
                name="reporterName"
                value={formData.reporterName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              name="reportDate"
              value={formData.reportDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
              max={maxDate}
              min={minDate}
            />
            <p className="text-sm text-gray-500 mt-1">
              Select a date between {oneYearAgo.toLocaleDateString()} and {today.toLocaleDateString()}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              rows="3"
              placeholder="Describe the waste issue..."
              required
            ></textarea>
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Photos (Maximum 3, 5MB each)
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="w-full px-4 py-2 border rounded"
              disabled={photos.length >= 3}
            />
            <p className="text-sm text-gray-500 mt-1">
              {photos.length}/3 photos selected (max 5MB each)
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-auto bg-green-500 text-white py-2 rounded flex justify-center items-center"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : "Submit Report"}
            </button>
          </div>
        </form>

        {/* Search by Name Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-center mb-4">Search Reports by Reporter Name</h3>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">Search by Reporter Name</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-grow px-4 py-2 border rounded"
                placeholder="Enter first name, last name, or both"
              />
              <button
                onClick={handleSearchByName}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
              >
                {isSearching ? <FaSpinner className="animate-spin" /> : "Search"}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">You can search by first name, last name, or both</p>
          </div>

          {reports.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">
                  Found {reports.length} Report{reports.length !== 1 ? 's' : ''}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={generatePdf}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <FaFilePdf /> Generate PDF
                  </button>
                </div>
              </div>

              {/* Booklet-style report display */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                {reports.length > 0 && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className={`px-3 py-1 rounded ${currentPage === 0 ? 'bg-gray-200 text-gray-500' : 'bg-green-500 text-white hover:bg-green-600'}`}
                      >
                        <FaArrowLeft />
                      </button>
                      <span className="text-lg font-semibold">
                        Report {currentPage + 1} of {reports.length}
                      </span>
                      <button
                        onClick={nextPage}
                        disabled={currentPage === reports.length - 1}
                        className={`px-3 py-1 rounded ${currentPage === reports.length - 1 ? 'bg-gray-200 text-gray-500' : 'bg-green-500 text-white hover:bg-green-600'}`}
                      >
                        <FaArrowRight />
                      </button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${WASTE_TYPE_COLORS[reports[currentPage].wasteType] || 'bg-gray-100 text-gray-800'}`}>
                            {reports[currentPage].wasteType.split(' (')[0]}
                          </div>
                          <h3 className="mt-2 text-lg font-bold">{reports[currentPage].reporterName || "Anonymous"}</h3>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[reports[currentPage].status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {STATUS_CONFIG[reports[currentPage].status]?.icon}
                          <span className="ml-1">{reports[currentPage].status}</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {new Date(reports[currentPage].reportDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FaMapMarkerAlt className="mr-2 text-gray-400" />
                          {reports[currentPage].location.length > 30 
                            ? `${reports[currentPage].location.substring(0, 30)}...` 
                            : reports[currentPage].location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FaUser className="mr-2 text-gray-400" />
                          {reports[currentPage].reporterName || "Anonymous"}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-1">Description</h4>
                        <p className="text-gray-700 whitespace-pre-line">
                          {reports[currentPage].description}
                        </p>
                      </div>

                      {/* Map Thumbnail */}
                      {reports[currentPage].latitude && reports[currentPage].longitude && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Location</h4>
                          <div className="h-48 rounded-md overflow-hidden border border-gray-300">
                            <MapContainer 
                              center={[reports[currentPage].latitude, reports[currentPage].longitude]} 
                              zoom={15} 
                              style={{ height: "100%", width: "100%" }}
                              dragging={false}
                              touchZoom={false}
                              zoomControl={false}
                              scrollWheelZoom={false}
                              doubleClickZoom={false}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={[reports[currentPage].latitude, reports[currentPage].longitude]} />
                            </MapContainer>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Coordinates: {reports[currentPage].latitude.toFixed(4)}, {reports[currentPage].longitude.toFixed(4)}
                          </p>
                        </div>
                      )}

                      {/* Photo Gallery */}
                      {reports[currentPage].photos?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Photos ({reports[currentPage].photos.length})</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {reports[currentPage].photos.map((photo, index) => (
                              <div 
                                key={index} 
                                className="relative h-32 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => openPhotoModal(index)}
                              >
                                <img
                                  src={photo.url}
                                  alt={`Report photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <FaExpand className="text-white text-xl" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {isPhotoModalOpen && reports[currentPage]?.photos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl w-full">
            <img
              src={reports[currentPage].photos[selectedPhotoIndex].url}
              alt={`Enlarged report photo`}
              className="w-full max-h-[90vh] object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={closePhotoModal}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            {reports[currentPage].photos.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {reports[currentPage].photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`w-3 h-3 rounded-full ${index === selectedPhotoIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">PDF Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                >
                  <FaDownload /> Download
                </button>
                <button
                  onClick={() => setShowPdfPreview(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-auto">
              <iframe 
                src={pdfUrl} 
                className="w-full h-full min-h-[70vh]" 
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl min-w-md[500px] text-center">
            <h3 className="text-3xl font-bold text-green-500">Success!</h3>
            <p className="mt-2 whitespace-nowrap overflow-x-auto ">Thank you for making a difference! 🌍Your waste report has been submitted successfully.Together, we're building a cleaner, greener world!</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteReporting;