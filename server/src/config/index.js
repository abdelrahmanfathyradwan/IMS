require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ims',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  appName: process.env.APP_NAME || 'IMS'
};
