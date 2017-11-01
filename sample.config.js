const path = require('path'),
    config = {};

// API settings
config.api = {
    sessionDuration: 3600, // in seconds,
    salt: '$2a$10$ZzU7rZOTPSagDgR9ltdeHO', // salt generated by bcrypt,
    appRoot: path.resolve(__dirname) + '/',
    avatarRoute: '/avatar/',
    paginationItems: 10 // Default value for requested items
};

// Logs directory
config.api.logsDir = path.join(config.api.appRoot, 'logs/');

// File upload paths
config.api.uploadDir = {};
config.api.uploadDir.main = path.join(config.api.appRoot, 'uploads/');
config.api.uploadDir.avatars = path.join(config.api.uploadDir.main, 'avatars/');
config.api.uploadDir.defaultAvatar = path.join(config.api.uploadDir.avatars, 'default.png');

// Server configuration
config.server = {
    host: '',
    port: 3000
};

// Database configuration
config.database = {
    host: '',
    user: '',
    password: '',
    database: ''
};

// Authentication protected endpoints
config.protectedEndpoints = [
    '/users/save',
    '/users/toggleActiveState',
    '/services/saveCategory',
    '/services/deleteCategory',
    '/services/saveService',
    '/services/deleteService',
    '/services/getAll',
    '/clients/save',
    '/clients/addAddress',
    '/clients/deleteAddress',
    '/clients/filter',
];

module.exports = config;