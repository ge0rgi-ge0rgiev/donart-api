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

// Log the error data in log file - Middleware for server.js
Functions.errorLoggerMiddleware = () => {
    const expressWinston = require('winston-express-middleware'),
        winston = require('winston');
    return expressWinston.errorLogger({
        transports: [
            new winston.transports.File({
                label: "Donart API erros",
                filename: config.api.logsDir + 'errors.json',
                level: 'debug',
                maxsize: 2000000
            })
        ]
    });
}

Functions.logError = (err, req) => {
    const winston = require('winston');

    let logger = new winston.Logger ({
        transports: [
            new winston.transports.File({
                label: "Donart API erros",
                filename: config.api.logsDir + 'errors.json',
                maxsize: 2000000,
                level: 'debug'
            })
        ]
     });
     
     logger.error(err);
}

// Move file from tmp to given destination
Functions.moveUploadedFiles = (from, to) => {
    const fs = require('fs'),
        Promise = require('promise');

    to = (Array.isArray(to)) ? to.join('') : to;
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

    
    if (Array.isArray(fieldsObject)) {
        for (var i in fieldsObject) {
            Functions.normalizeFields(fieldsObject[i]);
        }
    }

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
    let page = (req.headers['x-pagination-page']) ? req.headers['x-pagination-page'] : 1;

    // Items per page
    let itemsPerPage = (req.headers['x-pagination-items']) ? (req.headers['x-pagination-items']) : config.api.paginationItems;

    // Ignore pagination settings and return all items
    let getAll = (req.headers['x-pagination-all']) ? true : false;

    if (page != Math.abs(page)) correctParams = false;
    if (itemsPerPage != Math.abs(itemsPerPage)) correctParams = false;

    if (correctParams === false) throw new errors.InvalidParameters('Invalid pagination params.');

    return {
        all: getAll,
        start: (page > 1) ? (page * itemsPerPage) : 0,
        offset: itemsPerPage 
    }
}

// Get full domain
Functions.getDomain = (req) => {
    return [req.protocol, '://', req.get('host')].join('');
}

Functions.formatExpValErrors = (_errors) => {
    let errMessage = 'Express validator: ';
    for (var i in _errors) {
        errMessage += _errors[i].param + ': ' + _errors[i].msg + '; ';
    }
    return new errors.InvalidParameters(errMessage);
}

Functions.intToBoolFieldValues = (data, fields) => {
    // Loop data indexes
    for (let index in data) {
        // Loop index data fields
        for (let objField in data[index]) {
            // Loop the given matched fields
            for (let fieldIndex in fields) {
                if (objField == fields[fieldIndex]) {
                    data[index][objField] =  (data[index][objField] == 1) ? true : false;
                }
            }
            
            if (typeof data[index][objField] === 'object') {
                Functions.intToBoolFieldValues(data[index][objField], fields);
            } 
        }
    }

    return data;
}

Functions.applyCbToField = (data, field, callback) => {
    // Loop data indexes
    for (let index in data) {
        // Loop index data fields
        for (let objField in data[index]) {
            if (objField == field) {
                data[index][objField] = callback(data[index][objField]);
            }
            
            if (typeof data[index][objField] === 'object') {
                Functions.applyCbToField(data[index][objField], field, callback);
            } 
        }
    }

    return data;
}


module.exports = Functions;