const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (req.user.role === 'SUPER_ADMIN') {
      return next(); // Super admin has all permissions
    }

    const hasPermission = req.user.permissions && req.user.permissions[module] && req.user.permissions[module].includes(action);
    if (!hasPermission) {
      return res.status(403).json({ message: `Not authorized to perform ${action} on ${module}` });
    }
    next();
  };
};

module.exports = { protect, authorize, checkPermission };
