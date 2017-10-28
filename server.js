const express = require('express'),
    timeout = require('connect-timeout'),
    winston = require('winston'),
    config = require('./config'), // App configuration
    middlewares = require('./app/libs/middlewares'), // Middleware functions
    bodyParser = require('body-parser'),
    router = require('./app/routes'), // The endpoint router
    functions = require('./app/libs/functions'),
    expressValidator = require('express-validator'),
    app = express();

// Set response timeout to X seconds
app.use( timeout('20s') );

// Parse "x-www-form-urlencoded" and "application/json" header request bodies
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( bodyParser.json() );

// Read error log route
require('winston-logs-display')(app, 
    new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                json: false,
                filename: 'logs/errors.json'
            })
        ]
    })
);

// Use express-validator
app.use( expressValidator() );

// API Token Authentication
app.use( middlewares.authMiddleware );

// Request logger
// app.use( functions.requestLogger() );

// API success middleware
app.use( middlewares.httpSuccess );

// Register available routes
app.use( router );

// Error Logger
app.use(functions.errorLoggerMiddleware());

// Error Handler
app.use( middlewares.errorHandler );

// Start the server
app.listen( process.env.PORT || config.server.port );
console.log(`Donart API server is listening on port: ${process.env.PORT || config.server.port}`);
