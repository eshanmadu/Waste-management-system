import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom Icons
const pendingIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const inProgressIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const resolvedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const defaultIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const WasteTracking = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('https://waste-management-system-88cb.onrender.com/api/report/locations');
      const data = await response.json();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    let filtered = reports;
    if (statusFilter !== "All") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }
    setFilteredReports(filtered);
  }, [statusFilter, reports]);

  // Function to select icon based on status
  const getIconByStatus = (status) => {
    if (status === "Pending") return pendingIcon;
    if (status === "In Progress") return inProgressIcon;
    if (status === "Resolved") return resolvedIcon;
    return defaultIcon;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b px-6 py-12 mt-16">
      <h2 className="text-4xl font-bold text-center text-green-700 mb-8">
        Waste Tracking - GoGreen360
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <select
          className="p-2 border rounded-md shadow-md focus:outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Map */}
      <div className="mb-6 relative overflow-hidden rounded-lg shadow-lg" style={{ height: "500px" }}>
        <MapContainer
          center={[7.8731, 80.7718]}
          zoom={7}
          style={{ width: "100%", height: "100%", zIndex: 0 }}
          maxBounds={[
            [5.5, 79],
            [10.5, 82],
          ]}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {filteredReports.map((report) => (
            <Marker
              key={report._id + report.status + report.wasteType}
              position={[report.latitude, report.longitude]}
              icon={getIconByStatus(report.status)}
              eventHandlers={{
                popupopen: (e) => {
                  const marker = e.target;
                  marker._map.panTo(marker.getLatLng(), { animate: true });
                },
              }}
            >
              <Popup>
  <div className="space-y-2">
    <h4 className="font-semibold text-lg text-green-800">{report.location || "Unknown Location"}</h4>
    <p className="text-gray-700">Waste Type: {report.wasteType || "Unknown"}</p>
    <p className="text-gray-700">Status: {report.status || "Unknown"}</p>

    <button
      onClick={() => {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`,
          "_blank"
        );
      }}
      className="flex items-center justify-center gap-2 mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded shadow transition duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.752 11.168l-9.193 3.715a.75.75 0 00.168 1.45h.001l2.77-.557a.75.75 0 01.882.664l.007.102v3.3a.75.75 0 001.352.43l6.097-8.264a.75.75 0 00-.887-1.14z"
        />
      </svg>
      Get Directions
    </button>
  </div>
</Popup>

            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default WasteTracking;
