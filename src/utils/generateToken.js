const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your_secret',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

module.exports = generateToken;
