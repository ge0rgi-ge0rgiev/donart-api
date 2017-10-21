const express = require('express'),
    timeout = require('connect-timeout'),
    config = require('./config'), // App configuration
    middlewares = require('./app/libs/middlewares'), // Middleware functions
    bodyParser = require('body-parser'),
    router = require('./app/routes'), // The endpoint router
    functions = require('./app/libs/functions'),
    app = express();

// Set response timeout to X seconds
app.use( timeout('10s') );

// Parse "x-www-form-urlencoded" and "application/json" header request bodies
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( bodyParser.json() );

// API Token Authentication
app.use( middlewares.authMiddleware );

// Request logger
// app.use( functions.requestLogger() );

// API success middleware
app.use( middlewares.httpSuccess );

// Register available routes
app.use( router );

// Error Logger
app.use(functions.errorLogger());

// Error Handler
app.use( middlewares.errorHandler );

// Start the server
app.listen( process.env.PORT || config.server.port );
console.log(`Donart API server is listening on port: ${process.env.PORT || config.server.port}`);
