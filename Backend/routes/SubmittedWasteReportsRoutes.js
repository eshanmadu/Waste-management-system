// SubmittedWasteReports.jsx
import React, { useEffect, useState } from 'react';

const SubmittedWasteReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/report/reports');

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="submitted-reports">
      <h2>Submitted Waste Reports</h2>
      {isLoading ? (
        <p>Loading reports...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Waste Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Reported On</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report._id}>
                  <td>{report._id}</td>
                  <td>{report.wasteType}</td>
                  <td>{report.location}</td>
                  <td>{report.status}</td>
                  <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No reports available.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubmittedWasteReports;