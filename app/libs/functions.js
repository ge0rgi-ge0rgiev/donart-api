const config = require('../../config');

module.exports = {

    // Return Date object
    getDateObject: (plusTimeInseconds) => {
        let date = new Date();
        if (plusTimeInseconds !== undefined) {
            date.setSeconds(date.getSeconds() + plusTimeInseconds);
        }
        return date;
    },

    // Return bool
    isBeforeCurrentTime: (dateObject) => {
        return dateObject < this.getDateObject();
    },

    requestLogger: () => {
        const expressWinston = require('winston-express-middleware'),
            winston = require('winston');
        return expressWinston.logger({
            transports: [
                new winston.transports.File({
                    label: "Donart API request",
                    filename: config.api.appRoot + 'logs/request.log',
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

    },

    errorLogger: () => {
        const expressWinston = require('winston-express-middleware'),
            winston = require('winston');
        return expressWinston.errorLogger({
            transports: [
                new winston.transports.File({
                    label: "Donart API erros",
                    filename: config.api.appRoot + 'logs/errors.log',
                    maxsize: 2000000,
                    eol: "\n\n",
                })
            ]
        });
    }

}