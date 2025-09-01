import { useState, useEffect } from "react";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FaLeaf,
  FaAward,
  FaRecycle,
  FaTrash,
  FaChartLine,
  FaUsers,
  FaUserCheck,
  FaPhone,
  FaEnvelope,
  FaMapMarker,
  FaDollarSign,
  FaTruckMoving,
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaRobot,
  FaComments,
  FaShoppingCart,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/\D/g, "")); // Extract numeric value
  const suffix = value.replace(numericValue.toString(), ""); // Get any suffix like '+'

  useEffect(() => {
    const duration = 2000; // Animation duration in ms
    const stepTime = 100; // Update interval
    const steps = duration / stepTime;
    const increment = numericValue / steps;

    let currentCount = 0;
    const counter = setInterval(() => {
      currentCount = Math.ceil(currentCount + increment);
      if (currentCount >= numericValue) {
        clearInterval(counter);
        currentCount = numericValue;
      }
      setCount(currentCount);
    }, stepTime);

    return () => clearInterval(counter);
  }, [numericValue]);

  return <>{count}{suffix}</>;
};

const styles = `
  @keyframes bounce-subtle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  .animate-bounce-subtle {
    animation: bounce-subtle 2s infinite;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const Home = () => {
  const [topRecycler, setTopRecycler] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impactStats, setImpactStats] = useState({
    totalRecycled: 0,
    reportsResolved: 0,
    volunteers: 0,
    staff: 0
  });
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiry: '',
    message: '',
    anonymous: false
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  // Format number to tons
  const formatToTons = (kg) => {
    const tons = (kg / 1000.0).toFixed(2);
    return tons.toString() + 'T';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, reportsRes, volunteersRes, staffRes, recyclingRes] = await Promise.all([
          fetch("http://localhost:5001/api/leaderboard"),
          fetch("http://localhost:5001/api/report/reports"),
          fetch("http://localhost:5001/api/volunteers"),
          fetch("http://localhost:5001/api/staff"),
          fetch("http://localhost:5001/api/recycle")
        ]);

        if (!leaderboardRes.ok || !reportsRes.ok || !volunteersRes.ok || !staffRes.ok || !recyclingRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [leaderboardData, reportsData, volunteersData, staffData, recyclingData] = await Promise.all([
          leaderboardRes.json(),
          reportsRes.json(),
          volunteersRes.json(),
          staffRes.json(),
          recyclingRes.json()
        ]);

        // Set top recycler
        if (leaderboardData.success && leaderboardData.data.length > 0) {
          setTopRecycler(leaderboardData.data[0]);
        }

        // Calculate total recycled amount
        let totalKg = 0;
        if (Array.isArray(recyclingData.data)) {
          totalKg = recyclingData.data.reduce((sum, item) => {
            const quantity = parseFloat(item?.quantity) || 0;
            return sum + quantity;
          }, 0);
        }

        // Count resolved reports
        const resolvedReportsCount = Array.isArray(reportsData)
          ? reportsData.filter(report => report.status === 'Resolved').length
          : 0;

        // Set impact stats
        setImpactStats({
          totalRecycled: Number(totalKg),
          reportsResolved: resolvedReportsCount,
          volunteers: volunteersData.length,
          staff: staffData.length
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sliderImages = [
    { src: "/images/slider1.png", alt: "Slider 1 - Go Green Initiative" },
    { src: "/images/slider2.jpg", alt: "Slider 2 - Community Cleanup" },
    { src: "/images/slider3.jpeg", alt: "Slider 3 - Recycling Project" },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const PrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="slick-arrow slick-prev !-left-8 md:!-left-10 before:!content-none"
      aria-label="Previous"
    >
      <FaChevronLeft className="text-green-700 text-2xl hover:text-green-900" />
    </button>
  );
  
  const NextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="slick-arrow slick-next !-right-8 md:!-right-10 before:!content-none"
      aria-label="Next"
    >
      <FaChevronRight className="text-green-700 text-2xl hover:text-green-900" />
    </button>
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        inquiryType: formData.inquiry,
        message: formData.message,
        isAnonymous: formData.anonymous
      };

      // Only include personal information if not anonymous
      if (!formData.anonymous) {
        submitData.name = formData.name;
        submitData.phone = formData.phone;
        submitData.email = formData.email;
      }

      const response = await fetch('http://localhost:5001/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          inquiry: '',
          message: '',
          anonymous: false
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="flex justify-center bg-gradient-to-br from-green-50 to-blue-50 w-full">
      <div className="max-w-screen-xl w-full px-4 md:px-8 mx-auto">
        {/* Add padding-top to prevent overlap with fixed header */}
        <div className="pt-24">
          {/* Slider Section */}
          <section className="w-full">
            <Slider {...settings}>
              {sliderImages.map((img, index) => (
                <div key={index} className="w-full">
                  <div
                    className="min-h-[300px] md:min-h-[400px] bg-cover bg-center bg-no-repeat flex justify-center items-center text-center"
                    style={{ backgroundImage: `url(${img.src})` }}
                    role="img"
                    aria-label={img.alt}
                  >
                    <div className="w-full bg-black/50 p-6">
                      <h1 className="text-3xl md:text-5xl font-bold font-oswald text-white drop-shadow-md">
                        Go Green 360
                      </h1>
                      <p className="text-gray-300 mt-3 max-w-xl mx-auto">
                        Welcome to Go Green 360 – your partner in building a cleaner, greener future. Our platform empowers communities to report, track, and recycle waste efficiently while raising awareness about sustainable practices. Join us in making a positive impact on the environment, one small action at a time.
                      </p>
                      <div className="mt-5 flex space-x-4 justify-center">
                        <a
                          href="/volunteer"
                          className="px-5 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-800"
                        >
                          Want to Join with us?
                        </a>
                        <button
                          onClick={() => navigate("/events")}
                          className="px-5 py-3 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300"
                        >
                          View Events
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </section>
        </div>

        {/* Info Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 text-center">
          <div className="bg-green-700 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <FaLeaf className="text-4xl mb-3" />
            <h2 className="text-xl font-semibold">Our Vision</h2>
            <p className="mt-2">
              Creating a sustainable future through responsible waste management.
            </p>
          </div>
          <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <FaAward className="text-4xl mb-2" />
            <h2 className="text-xl font-semibold">Top Recycler</h2>
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : topRecycler ? (
              <div className="flex flex-col items-center justify-center mt-2">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <FaTrophy className="text-3xl text-white" />
                </div>
                <h3 className="text-lg font-semibold">{topRecycler.name}</h3>
                <div className="mt-1 space-y-1">
                  <p className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded-full">
                    {topRecycler.totalRecycled} kg Recycled
                  </p>
                  <p className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded-full">
                    {topRecycler.points.toLocaleString()} Points
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2">No top recycler data available</p>
            )}
          </div>
          <div className="bg-green-700 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <FaRecycle className="text-4xl mb-3" />
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <p className="mt-2">
              Stay updated with our latest initiatives, community drivers and eco-friendly campaigns. Join us in making a sustainable impact.
            </p>
            <a
              href="/events"
              className="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700"
            >
              Learn More
            </a>
          </div>
        </section>

    {/* Go Green 360 Features Section */}
<section className="my-12">
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold font-oswald text-green-800">Go Green 360 Features</h2>
    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
      On demand waste collection at your finger-tips, download and subscribe to our waste collection and recycle service.<br />
      Submit your waste according to the waste category through the app.
    </p>
  </div>

  <Slider {...{
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }}>
    {[
      { icon: FaRecycle, text: "Sustainable eco system for recyclable household waste" },
      { icon: FaMapMarker, text: "Location based user identification & collection" },
      { icon: FaDollarSign, text: "Earn rewards for waste contribution" },
      { icon: FaTruckMoving, text: "7 days waste collection & distribution" },
    ].map((feature, index) => (
      <div key={index} className="px-2">
        <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow h-full">
          <feature.icon className="text-4xl text-green-700 mx-auto mb-4" />
          <p className="text-gray-600">{feature.text}</p>
          <div className="h-1 w-16 bg-gray-200 mx-auto my-4" />
        </div>
      </div>
    ))}
  </Slider>
</section>

<hr className="my-12 border-t-2 border-gray-300" />

{/* Recycled Materials Supply Section */}
<section className="my-12">
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold font-oswald text-green-800">♻️ Recycled Materials Supply</h2>
    <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
      We provide high-quality recycled materials for businesses, manufacturers, and individuals. 
      Whether you need bulk supplies for production or smaller quantities for projects, we've got you covered.
    </p>
  </div>

  {/* Why Choose Our Recycled Materials */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
      <FaRecycle className="text-4xl text-green-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-3">Premium Quality</h3>
      <ul className="space-y-2 text-gray-600 text-sm">
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Rigorously tested materials
        </li>
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Consistent quality standards
        </li>
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Certified by environmental agencies
        </li>
      </ul>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
      <FaDollarSign className="text-4xl text-green-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-3">Cost Effective</h3>
      <ul className="space-y-2 text-gray-600 text-sm">
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Competitive market prices
        </li>
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Bulk order discounts
        </li>
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          No hidden costs
        </li>
      </ul>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
      <FaTruckMoving className="text-4xl text-green-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-3">Reliable Delivery</h3>
      <ul className="space-y-2 text-gray-600 text-sm">
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Nationwide delivery network
        </li>
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Flexible scheduling options
        </li>
        <li className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Real-time tracking
        </li>
      </ul>
    </div>
  </div>

  

  {/* Ordering Process */}
  <div className="mb-12">
    <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">How to Order Recycled Materials</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        {
          step: "1",
          title: "Browse Materials",
          description: "Explore our comprehensive catalog of recycled materials with detailed specifications and pricing"
        },
        {
          step: "2",
          title: "Select Quantity",
          description: "Choose the amount you need - from small quantities for projects to bulk orders for manufacturing"
        },
        {
          step: "3",
          title: "Place Order",
          description: "Complete your order with secure payment and provide delivery details"
        },
        {
          step: "4",
          title: "Receive Delivery",
          description: "Get your materials delivered to your location with tracking and quality assurance"
        }
      ].map((step, index) => (
        <div key={index} className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">{step.step}</span>
          </div>
          <h4 className="font-bold text-lg mb-2 text-gray-800">{step.title}</h4>
          <p className="text-gray-600 text-sm">{step.description}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Business Benefits */}
  <div className="mb-12">
    <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Benefits for Your Business</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="text-xl font-bold mb-4 text-gray-800">Environmental Impact</h4>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
            <span>Reduce your carbon footprint and meet sustainability goals</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
            <span>Support circular economy initiatives</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
            <span>Enhance your brand's environmental credentials</span>
          </li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="text-xl font-bold mb-4 text-gray-800">Economic Advantages</h4>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
            <span>Lower material costs compared to virgin materials</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
            <span>Access to government incentives for using recycled materials</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
            <span>Improved market competitiveness with eco-friendly products</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  {/* Call to Action */}
  <div className="text-center">
    <h3 className="text-2xl font-bold mb-4 text-gray-800">Ready to Get Started?</h3>
    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
      Join thousands of businesses that have already made the switch to recycled materials. 
      Start your journey towards sustainability today.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={() => navigate("/waste-distribution")}
        className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
      >
        <FaShoppingCart className="inline mr-2" />
        Browse Materials
      </button>
      <button
        onClick={() => navigate("/contact")}
        className="bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
      >
        <FaPhone className="inline mr-2" />
        Contact Sales
      </button>
    </div>
    <p className="text-gray-500 mt-4 text-sm">
      Need custom quantities or have specific requirements? Our team is here to help!
    </p>
  </div>
</section>

<hr className="my-12 border-t-2 border-gray-300" />

{/* Impact Section */}
<div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-oswald text-green-800">Our impact so far..</h2>
        </div>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 my-12 text-center">
          {[
            { 
              icon: FaTrash, 
              title: "Tons Recycled", 
              value: `${Number(impactStats.totalRecycled / 1000).toFixed(2)}T`, 
              color: "text-green-700" 
            },
            { 
              icon: FaChartLine, 
              title: "Reports Resolved", 
              value: `${impactStats.reportsResolved}`, 
              color: "text-blue-700" 
            },
            { 
              icon: FaUsers, 
              title: "Volunteers", 
              value: `${impactStats.volunteers}+`, 
              color: "text-purple-700" 
            },
            { 
              icon: FaUserCheck, 
              title: "Staff Joined", 
              value: `${impactStats.staff}+`, 
              color: "text-red-700" 
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 border rounded-md flex flex-col justify-center items-center hover:shadow-lg transition-shadow"
            >
              {React.createElement(stat.icon, { className: `text-3xl ${stat.color} mb-2` })}
              <h3 className={`text-lg font-semibold ${stat.color}`}>{stat.title}</h3>
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-2"></div>
              ) : (
                <p className="text-2xl font-bold mt-2">
                  <AnimatedCounter value={stat.value} />
                </p>
              )}
            </div>
          ))}
        </section>

        <hr className="my-12 border-t-2 border-gray-300" />

        {/* Contact Us Section */}
        <section id="contact" className="my-12">
          <h2 className="text-3xl font-bold font-oswald text-center mb-8">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side: Contact Details */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Our Details</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-green-700 text-xl" />
                  <p>+1 (123) 456-7890</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-green-700 text-xl" />
                  <p>info@gogreen360.com</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FaMapMarker className="text-green-700 text-xl" />
                  <p>123 Green Street, Eco City, Earth</p>
                </div>
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
              {submitStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  There was an error submitting your message. Please try again.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="inquiry" className="block text-sm font-medium text-gray-700">
                    Type of Inquiry
                  </label>
                  <select
                    id="inquiry"
                    name="inquiry"
                    value={formData.inquiry}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="complaint">Complaint</option>
                    <option value="feedback">Feedback</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  ></textarea>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    name="anonymous"
                    checked={formData.anonymous}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                    Report anonymously
                  </label>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-800"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
      <div
  style={{
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 50,
    cursor: 'pointer',
  }}
  onClick={() => navigate("/help")}
>
  <div style={{ position: 'relative' }}>
    {/* Bouncing Chatbot */}
    <div style={{
      width: '96px',
      height: '96px',
      animation: 'bounce 1.5s infinite ease-in-out',
      position: 'relative',
      zIndex: 2
    }}>
      <img
        src="/images/chatbot.png"
        alt="Chatbot"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>

    {/* Radial Sound Waves (spreading outward) */}
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '96px',
      height: '96px',
      borderRadius: '50%',
    }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: `2px solid rgba(59, 130, 246, ${0.3 - (i * 0.1)})`,
            borderRadius: '50%',
            animation: `ripple 2s infinite ${i * 1}s`,
            transform: 'scale(0)',
            opacity: 0
          }}
        />
      ))}
    </div>

    {/* Tooltip */}
    <div style={{
      position: 'absolute',
      right: '100px',
      bottom: '60px',
      backgroundColor: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      opacity: 0,
      transition: 'opacity 0.3s',
      fontSize: '14px',
      whiteSpace: 'nowrap'
    }}>
      How can I help you?
    </div>
  </div>

  {/* Animation Definitions */}
  <style dangerouslySetInnerHTML={{
    __html: `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 0.5;
        }
        100% {
          transform: scale(2.5);
          opacity: 0;
        }
      }
    `
  }} />
</div>
    </div>
  );
};

export default Home;
