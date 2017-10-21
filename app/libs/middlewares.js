const config = require('../../config'),
    functions = require('./functions'),
    errors = require('./response-errors');

module.exports = {

    /**
     * Check the auth session for protected resources
     * 
     * TODO: Define different error handlers ( error responses )
     * 
     */
    authMiddleware: function (req, res, next) {
        // The requested endpoint is unprotected?
        if (config.protectedEndpoints.indexOf(req.originalUrl.substr(1)) === -1) {
            next();
            return;
        }

        // Get authentication token from http headers
        let _authToken = req.headers.authtoken || undefined;

        // If there`s no token supplied
        if (!_authToken) throw new errors.Unauthorized();


        let SessionModel = require('../models/SessionModel');

        // Get session object
        SessionModel.getSessionData({ authToken: _authToken })
            .then(function (session) {
                // If there`s no session associated with the token
                if (!session) throw new errors.Unauthorized('Invalid authentication token.');
                return session;
            })
            .then(function (session) {
                // Check for session expiration date
                if (functions.isBeforeCurrentTime(session.expiration)) throw new errors.InvalidParameters('Your session has expired.');

                // Update the expiration time of the session
                session.expiration = functions.getDateObject(config.api.sessionDuration);
                SessionModel.saveSession(session);
                next();
                return;
            })
            .catch(err => next(err));
    },

    // Validates result for express generator checks
    validatorResult: (req, res, next) => {
        const { validationResult } = require('express-validator/check');
        let _errors = validationResult(req);
        if (!_errors.isEmpty()) {
            let errMessage = 'Express validator: ';
            let mapped = _errors.mapped();
            for (var prop in mapped) {
                errMessage += mapped[prop].param + ': ' + mapped[prop].msg + '; ';
            }
            throw new errors.InvalidParameters(errMessage);
        }
        next();
    },

    // Attach sendSuccess method to response object
    httpSuccess: (req, res, next) => {
        res.sendSuccess = function (data) {
            return this.status(200).json({
                code: 0,
                message: "success",
                data: data
            });
        }
        next();
    },

    // HTTP error response handler
    errorHandler: (err, req, res, next) => {
        let genericErrors = ['EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError'];
        if (genericErrors.indexOf(err.name) > -1) {
            let errors = require('./response-errors');
            err = new errors.ServerError(err.message);
        }
        res.status(err.status);
        res.json({
            code: err.code,
            message: err.message,
            data: null
        });
    },


    // Specific route middlewares
    routes: {
        auth: {
            authenticate: function (req, res, next) {
                const bcrypt = require('bcrypt');
                bcrypt.hash(req.body.password, config.api.salt)
                    .then((hashedPassword) => {
                        req.body.password = hashedPassword;
                        next();
                    });
            }
        }
    }


}