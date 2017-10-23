const config = require('../../config'),
    errors = require('./response-errors'),
    Promise = require('promise');

let Functions = {};

// Return Date object
Functions.getDateObject = (plusTimeInseconds) => {
    let date = new Date();
    if (plusTimeInseconds !== undefined) {
        date.setSeconds(date.getSeconds() + plusTimeInseconds);
    }
    return date;
}

// Return bool
Functions.isBeforeCurrentTime = (dateObject) => {
    return dateObject < Functions.getDateObject();
},

// Log request data to log file
Functions.requestLogger = () => {
    const expressWinston = require('winston-express-middleware'),
        winston = require('winston');
    return expressWinston.logger({
        transports: [
            new winston.transports.File({
                label: "Donart API request",
                filename: config.api.logsDir + 'request.log',
                maxsize: 2000000,
                eol: "\n\n",
            })
        ],
        meta: true, // optional: control whether you want to log the meta data about the request (default to true) 
        msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}" 
        expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true 
        colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true 
        ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response 
    });

};

// Log the error data in log file
Functions.errorLogger = () => {
    const expressWinston = require('winston-express-middleware'),
        winston = require('winston');
    return expressWinston.errorLogger({
        transports: [
            new winston.transports.File({
                label: "Donart API erros",
                filename: config.api.logsDir + 'errors.log',
                maxsize: 2000000,
                eol: "\n\n",
            })
        ]
    });
}

// Move file from tmp to given destination
Functions.moveUploadedFiles = (from, to) => {
    const fs = require('fs'),
        Promise = require('promise');

    to = (to.constructor === Array) ? to.join('') : to;
    return new Promise((resolve, reject) => {
        fs.rename(from, to, function (err) {
            if (err) return reject(err);
            resolve(to);
        });
    });
}

// CamelCase become camel_case
Functions.normalizeFields = (fieldsObject) => {
    let newObject = {};
    Object.keys(fieldsObject).map(function(key, index) {
        let newKey = key.split(/(?=[A-Z])/).join('_').toLowerCase();
        newObject[newKey] = fieldsObject[key];
    });    
    
    return newObject;
}

// Get headers for pagination params and construct pagination object
Functions.getPaginationOptions = (req) => {
    let correctParams = true;
    let pagination = {};

    // Current page
    pagination.page = (req.headers['x-pagination-page']) ? req.headers['x-pagination-page'] : 1;

    // Items per page
    pagination.itemsPerPage = (req.headers['x-pagination-items']) ? (req.headers['x-pagination-items']) : config.api.paginationItems;

    // Ignore pagination settings and return all items
    pagination.all = (req.headers['x-pagination-all']) ? true : false;

    if (pagination.page != Math.abs(pagination.page)) correctParams = false;
    if (pagination.itemsPerPage != Math.abs(pagination.itemsPerPage)) correctParams = false;

    if (correctParams === false) throw new errors.InvalidParameters('Invalid pagination params.');

    return pagination;
}


// Get full domain
Functions.getDomain = (req) => {
    return [req.protocol, '://', req.get('host')].join('');
}


module.exports = Functions;