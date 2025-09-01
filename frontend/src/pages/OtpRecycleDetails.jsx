import { useState } from "react";
import { FaRecycle, FaInfoCircle, FaMapMarkerAlt, FaLeaf, FaGlobe, FaHandsHelping, FaTree, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RecyclingDetails = () => {
  const [recyclingCenters] = useState([
    {
      id: 1,
      name: "Central Recycling Center",
      address: "123 Green Street, Colombo 01",
      hours: "Mon-Sun: 8:00 AM - 6:00 PM",
      contact: "011-2345678",
      facilities: ["Plastic", "Paper", "Glass", "Metal", "Electronics"],
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      id: 2,
      name: "North Recycling Center",
      address: "456 Eco Road, Jaffna",
      hours: "Mon-Sun: 8:00 AM - 6:00 PM",
      contact: "021-2345678",
      facilities: ["Plastic", "Paper", "Glass", "Metal"],
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      id: 3,
      name: "South Recycling Center",
      address: "789 Green Lane, Galle",
      hours: "Mon-Sun: 8:00 AM - 6:00 PM",
      contact: "091-2345678",
      facilities: ["Plastic", "Paper", "Glass", "Metal", "Electronics"],
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
  ]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-72 md:h-96 flex items-center justify-center bg-green-900">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80"
          alt="Recycling"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
            Recycling: A Greener Tomorrow Starts Today
          </h1>
          <p className="text-lg md:text-2xl text-green-100 font-medium drop-shadow">
            Join the movement. Make a difference for our planet and future generations.
          </p>
        </div>
      </div>

      {/* Importance of Recycling */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">The Importance of Recycling</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition">
            <FaGlobe className="text-green-600 text-5xl mb-4" />
            <h3 className="text-xl font-bold mb-2">Protects the Planet</h3>
            <p className="text-gray-600">Reduces landfill waste, conserves resources, and lowers pollution.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition">
            <FaLeaf className="text-green-600 text-5xl mb-4" />
            <h3 className="text-xl font-bold mb-2">Saves Energy</h3>
            <p className="text-gray-600">Manufacturing with recycled materials uses less energy than new resources.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition">
            <FaUsers className="text-green-600 text-5xl mb-4" />
            <h3 className="text-xl font-bold mb-2">Builds Community</h3>
            <p className="text-gray-600">Creates green jobs and fosters environmental awareness in society.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition">
            <FaTree className="text-green-600 text-5xl mb-4" />
            <h3 className="text-xl font-bold mb-2">Preserves Nature</h3>
            <p className="text-gray-600">Protects wildlife habitats and helps maintain a healthy ecosystem.</p>
          </div>
        </div>
      </div>

      {/* Why Recycling Matters */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-4">Why Recycling Matters</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Recycling is crucial for preserving our environment and creating a sustainable future. 
            By recycling, we reduce waste, conserve natural resources, and protect our planet for future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-green-600 text-4xl mb-4">
              <FaGlobe />
            </div>
            <h3 className="text-xl font-bold mb-2">Environmental Impact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Reduces landfill waste</li>
              <li>• Conserves natural resources</li>
              <li>• Lowers greenhouse gas emissions</li>
              <li>• Protects wildlife habitats</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-green-600 text-4xl mb-4">
              <FaLeaf />
            </div>
            <h3 className="text-xl font-bold mb-2">Economic Benefits</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Creates green jobs</li>
              <li>• Reduces waste management costs</li>
              <li>• Generates revenue from recycled materials</li>
              <li>• Supports local recycling industries</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-green-600 text-4xl mb-4">
              <FaRecycle />
            </div>
            <h3 className="text-xl font-bold mb-2">Community Impact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Creates cleaner neighborhoods</li>
              <li>• Promotes environmental awareness</li>
              <li>• Fosters community engagement</li>
              <li>• Improves public health</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Our Recycling Centers */}
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">Our Recycling Centers</h2>
        <div className="space-y-8">
          {recyclingCenters.map((center) => (
            <div key={center.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src={center.image} 
                    alt={center.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h3 className="text-2xl font-bold text-green-700 mb-4">{center.name}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-green-600 mt-1" />
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-gray-600">{center.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaInfoCircle className="text-green-600 mt-1" />
                      <div>
                        <p className="font-semibold">Operating Hours</p>
                        <p className="text-gray-600">{center.hours}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaRecycle className="text-green-600 mt-1" />
                      <div>
                        <p className="font-semibold">Facilities</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {center.facilities.map((facility, index) => (
                            <span 
                              key={index}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaInfoCircle className="text-green-600 mt-1" />
                      <div>
                        <p className="font-semibold">Contact</p>
                        <p className="text-gray-600">{center.contact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Recycle */}
      <div className="max-w-6xl mx-auto px-4 mt-12 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-6">How to Recycle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Before You Visit</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-600 mt-1" />
                  <span>Sort your recyclables by type</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-600 mt-1" />
                  <span>Clean and dry items before recycling</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-600 mt-1" />
                  <span>Remove any non-recyclable parts</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-600 mt-1" />
                  <span>Check the center's accepted materials</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">At the Center</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-600 mt-1" />
                  <span>Follow staff instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-600 mt-1" />
                  <span>Use designated bins for each material</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-600 mt-1" />
                  <span>Ask questions if unsure about any items</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-600 mt-1" />
                  <span>Collect your points receipt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-green-700 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-green-100 mb-6">
            Visit your nearest recycling center today and be a part of the solution. Every item you recycle helps build a cleaner, greener world!
          </p>
          <button
            onClick={() => navigate("/rewards")}
            className="bg-white text-green-700 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-green-100 transition"
          >
            Earn Rewards for Recycling
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecyclingDetails;