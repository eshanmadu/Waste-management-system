const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = adminMiddleware; 