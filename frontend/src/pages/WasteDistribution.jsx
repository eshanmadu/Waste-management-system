import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRecycle, FaShoppingCart, FaSearch, FaFilter, FaStar, FaTruck, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { FiHeart, FiShare2 } from "react-icons/fi";

const WasteDistribution = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  // Sample recycled materials data
  const sampleMaterials = [
    {
      id: 1,
      name: "Recycled Plastic Pellets",
      category: "Plastic",
      description: "High-quality recycled PET pellets, perfect for manufacturing new plastic products",
      price: 25,
      unit: "per kg",
      quantity: 5000,
      location: "Central Hub",
      rating: 4.8,
      reviews: 124,
      image: "🥤",
      supplier: "GreenPlast Industries",
      minOrder: 100,
      certification: "ISO 14001",
      deliveryTime: "2-3 days"
    },
    {
      id: 2,
      name: "Recycled Paper Pulp",
      category: "Paper",
      description: "Premium recycled paper pulp for paper manufacturing and packaging",
      price: 15,
      unit: "per kg",
      quantity: 8000,
      location: "North Center",
      rating: 4.6,
      reviews: 89,
      image: "📄",
      supplier: "EcoPaper Solutions",
      minOrder: 200,
      certification: "FSC Certified",
      deliveryTime: "1-2 days"
    },
    {
      id: 3,
      name: "Recycled Glass Cullet",
      category: "Glass",
      description: "Clean recycled glass cullet for glass manufacturing and construction",
      price: 50,
      unit: "per kg",
      quantity: 3000,
      location: "South Center",
      rating: 4.9,
      reviews: 156,
      image: "🍾",
      supplier: "GlassCycle Ltd",
      minOrder: 150,
      certification: "LEED Certified",
      deliveryTime: "3-4 days"
    },
    {
      id: 4,
      name: "Recycled Metal Scrap",
      category: "Metal",
      description: "High-grade recycled metal scrap for metalworking and manufacturing",
      price: 30,
      unit: "per kg",
      quantity: 2500,
      location: "East Center",
      rating: 4.7,
      reviews: 203,
      image: "🔧",
      supplier: "MetalRecycle Corp",
      minOrder: 100,
      certification: "ISO 9001",
      deliveryTime: "2-3 days"
    },
    {
      id: 5,
      name: "Organic Compost",
      category: "Organic",
      description: "Rich organic compost made from food waste and yard trimmings",
      price: 20,
      unit: "per kg",
      quantity: 10000,
      location: "Central Hub",
      rating: 4.5,
      reviews: 67,
      image: "🍃",
      supplier: "OrganicWaste Solutions",
      minOrder: 50,
      certification: "USDA Organic",
      deliveryTime: "1-2 days"
    },
    {
      id: 6,
      name: "Recycled Textile Fibers",
      category: "Textile",
      description: "Soft recycled textile fibers for clothing and upholstery manufacturing",
      price: 40,
      unit: "per kg",
      quantity: 1500,
      location: "North Center",
      rating: 4.4,
      reviews: 45,
      image: "👕",
      supplier: "TextileRecycle Co",
      minOrder: 75,
      certification: "GOTS Certified",
      deliveryTime: "4-5 days"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMaterials(sampleMaterials);
      setLoading(false);
    }, 1000);
  }, []);

  const addToCart = (material) => {
    const existingItem = cart.find(item => item.id === material.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === material.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...material, quantity: 1 }]);
    }
  };

  const removeFromCart = (materialId) => {
    setCart(cart.filter(item => item.id !== materialId));
  };

  const updateCartQuantity = (materialId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(materialId);
    } else {
      setCart(cart.map(item => 
        item.id === materialId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "quantity":
        return b.quantity - a.quantity;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const categories = ["all", ...new Set(materials.map(m => m.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-green-50 pt-24">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 pt-24">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                🛒 Recycled Materials Marketplace
              </h1>
              <p className="text-green-100 text-lg">
                Buy high-quality recycled materials from verified suppliers
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search materials..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="quantity">Most Available</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Materials Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedMaterials.map((material) => (
                <div key={material.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{material.image}</span>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <FiHeart />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <FiShare2 />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{material.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{material.description}</p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(material.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">({material.reviews})</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-green-600">Rs. {material.price} {material.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium">{material.quantity.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Order:</span>
                        <span className="font-medium">{material.minOrder} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-medium">{material.deliveryTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-1" />
                        {material.location}
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {material.certification}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(material)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shopping Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaShoppingCart className="mr-2 text-green-600" />
                Shopping Cart
              </h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-green-600 font-bold">Rs.{item.price} {item.unit}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-green-600">Rs. {getTotalPrice().toFixed(2)}</span>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/payment', { 
                        state: { 
                          cartItems: cart, 
                          totalAmount: getTotalPrice() 
                        } 
                      })}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <FaPhone className="text-3xl text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <FaEnvelope className="text-3xl text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">sales@gogreen360.com</p>
            </div>
            <div className="text-center">
              <FaTruck className="text-3xl text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Bulk Orders</h3>
              <p className="text-gray-600">Contact for wholesale pricing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteDistribution;
