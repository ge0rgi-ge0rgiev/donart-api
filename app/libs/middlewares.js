const config = require('../../config'),
    functions = require('./functions'),
    errors = require('./response-errors');

module.exports = {

    /**
     * Check the auth session for protected resources
     * 
     */
    authMiddleware: (req, res, next) => {
        // The requested endpoint is unprotected?
        if (config.protectedEndpoints.indexOf(req.originalUrl) === -1) return next();

        let SessionModel = require('../models/SessionModel');

        // Get session data by authToken, update the expiration and proceed
        SessionModel.getSessionByAuthToken(req, res)
            .then(session => SessionModel.updateExpirationTime(session))
            .then((session) => {
                // Save session for further usage
                res.locals.session = session;
                next();
            })
            .catch(err => next(err));
    },

    /**
     * Admin only check
     */
    adminOnlyCheck: (req, res, next) => {
        let UserModel = require('../models/UserModel');

        UserModel.getUserById(res.locals.session.userId)
            .then((user) => {
                if (user.isAdmin === 0) {
                    return next(new errors.Unauthorized('Admin access only.'));
                }
                next();
            });
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
        user: {
            login: function (req, res, next) {
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