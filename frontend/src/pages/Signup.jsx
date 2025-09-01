import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuidv4 } from "uuid";
import { signup } from "../api/auth";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    dob: null,
    email: "",
    phoneNumber: "",
    country: "",
    password: "",
    confirmPassword: ""
  });

  const [countries, setCountries] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCountriesLoading, setIsCountriesLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setFormData((prevData) => ({ ...prevData, userId: uuidv4() }));
    
    // Fetch countries from REST Countries API
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        
        // Sort countries alphabetically by name
        const sortedCountries = data
          .map(country => ({
            name: country.name.common,
            code: country.cca2
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback to some default countries if API fails
        setCountries([
          { name: "United States", code: "US" },
          { name: "Canada", code: "CA" },
          { name: "Australia", code: "AU" },
          { name: "India", code: "IN" },
          { name: "Sri Lanka", code: "LK" }
        ]);
      } finally {
        setIsCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, dob, email, phoneNumber, country, password, confirmPassword } = formData;
    if (!firstName || !lastName || !dob || !email || !phoneNumber || !country || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    // Email validation
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    // Phone number validation (must be 10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    // Password length validation
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await signup(formData);

      if (data.userId) {
        alert("Signup successful!");
        navigate("/login");
      } else {
        alert(data.msg || "Signup failed.");
      }
    } catch (error) {
      alert("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-600 text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="userId"
            value={formData.userId}
            readOnly
            className="w-full px-4 py-2 border rounded bg-gray-200 cursor-not-allowed"
          />
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="w-full px-4 py-2 border rounded"
          />
          <DatePicker
            selected={formData.dob}
            onChange={(date) => setFormData({ ...formData, dob: date })}
            placeholderText="Date of Birth"
            className="w-full px-4 py-2 border rounded"
            dateFormat="dd/MM/yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="w-full px-4 py-2 border rounded"
          />
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
            disabled={isCountriesLoading}
          >
            <option value="">{isCountriesLoading ? "Loading countries..." : "Select Country"}</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-2 border rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="w-full px-4 py-2 border rounded"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-2 rounded flex justify-center items-center"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : "Sign Up"}
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <button onClick={() => navigate("/login")} className="text-blue-500">Login</button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;