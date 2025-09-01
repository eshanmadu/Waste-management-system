import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCreditCard, FaLock, FaShieldAlt, FaCheckCircle, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    billingAddress: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Sri Lanka"
    }
  });

  // Get cart data from location state or use default
  const cartItems = location.state?.cartItems || [];
  const totalAmount = location.state?.totalAmount || 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'generic';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect after showing success
      setTimeout(() => {
        navigate('/waste-distribution', { 
          state: { 
            message: 'Payment successful! Your order has been placed.' 
          } 
        });
      }, 2000);
    }, 3000);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-24">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-4xl text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your order has been processed successfully. You will receive a confirmation email shortly.</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Redirecting to marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-24">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/waste-distribution')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Secure Payment</h1>
          <p className="text-gray-600">Complete your purchase with our secure payment gateway</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Payment Information</h2>
                <div className="flex items-center space-x-2 text-green-600">
                  <FaShieldAlt />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <FaCreditCard className="mr-2 text-green-600" />
                    Card Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {formData.cardNumber && (
                          <div className={`w-8 h-5 rounded ${getCardType(formData.cardNumber) === 'visa' ? 'bg-blue-600' : 'bg-red-600'} flex items-center justify-center`}>
                            <span className="text-white text-xs font-bold">
                              {getCardType(formData.cardNumber) === 'visa' ? 'VISA' : 'MC'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="cardHolderName"
                        value={formData.cardHolderName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Month *
                      </label>
                      <select
                        name="expiryMonth"
                        value={formData.expiryMonth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Year *
                      </label>
                      <select
                        name="expiryYear"
                        value={formData.expiryYear}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Billing Address</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.firstName"
                        value={formData.billingAddress.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.lastName"
                        value={formData.billingAddress.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="billingAddress.email"
                        value={formData.billingAddress.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="billingAddress.phone"
                        value={formData.billingAddress.phone}
                        onChange={handleInputChange}
                        placeholder="+94 71 234 5678"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="billingAddress.address"
                      value={formData.billingAddress.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Colombo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.city"
                        value={formData.billingAddress.city}
                        onChange={handleInputChange}
                        placeholder="Colombo"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.state"
                        value={formData.billingAddress.state}
                        onChange={handleInputChange}
                        placeholder="Western Province"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.zipCode"
                        value={formData.billingAddress.zipCode}
                        onChange={handleInputChange}
                        placeholder="10000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="billingAddress.country"
                      value={formData.billingAddress.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <MdSecurity className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Secure Payment</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FaLock className="mr-2" />
                      Pay Rs. {totalAmount.toLocaleString()}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{item.image}</span>
                      <div>
                        <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.quantity} kg</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs. {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">Rs. {(totalAmount * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">Rs. {(totalAmount * 1.15).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</h3>
                <div className="flex space-x-2">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">MC</span>
                  </div>
                  <div className="w-12 h-8 bg-blue-800 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AMEX</span>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <FaShieldAlt className="mr-2 text-green-600" />
                  SSL Encrypted
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <FaLock className="mr-2 text-green-600" />
                  Secure Payment
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <FaCheckCircle className="mr-2 text-green-600" />
                  PCI Compliant
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
