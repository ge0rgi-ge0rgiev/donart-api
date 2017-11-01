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
                data: data || []
            });
        }
        next();
    },

    // HTTP error response handler
    errorHandler: (err, req, res, next) => {
        if (errors.JS_ERRORS[err.name]) {
            functions.logError(err);
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
        users: {

            /**
             * Hash user password
             */
            login: (req, res, next) => {
                const bcrypt = require('bcrypt');
                bcrypt.hash(req.body.password, config.api.salt)
                    .then((hashedPassword) => {
                        req.body.password = hashedPassword;
                        next();
                    });
            },
            
            /**
             * Validations before user save
             */
            save: (req, res, next) => {
                /**
                 * Update user
                 */
                if (req.body.id) {
                    req.check("name").optional().
                        isLength({min: 3}).withMessage('Invalid name.');
                    req.check("password").optional()
                        .isLength({min: 3}).withMessage('Invalid name.');
                } else {
                    /**
                     * Create user
                     */

                    req.check("name").exists().withMessage('Required field.')
                        .isLength({min: 3}).withMessage('Invalid name length.');
                    req.check("password").exists().withMessage('Required field.')
                        .isLength({min: 3}).withMessage('Invalid password length.');
                }

                req.check("isAdmin").optional().isBoolean().withMessage('Must be boolean.');
                req.check("active").optional().isBoolean().withMessage('Must be boolean.');

                var validationErrors = req.validationErrors();

                // Return validation errors
                if (validationErrors) return next(functions.formatExpValErrors(validationErrors));
                
                next();
            }
            
        },

        avatar: (req, res, next) => {
            const fs = require('fs'),
                path = require('path');

            let avatar = path.join(config.api.uploadDir.avatars, req.params.image);
            fs.realpath(avatar, (err, path) => {
                if (err) return next(new errors.NotFound());
                res.sendFile(path);
            });
        },

        services: {
            
            saveCategory: (req, res, next) => {
                // Create action
                if (req.body.id === undefined) {
                    req.check("translation").exists().withMessage('Required field.');
                }

                var validationErrors = req.validationErrors();
                if (validationErrors) return next(functions.formatExpValErrors(validationErrors));
                
                next();
            },

            deleteCategory: (req, res, next) => {
                // Make active state - 0
                req.body.active = 0;
                next();
            },

            saveService: (req, res, next) => {
                if (req.body.id === undefined) {
                    req.check("serviceCategoryId").exists().withMessage('Required field.');
                    req.check("translation").exists().withMessage('Required field.');
                    req.check("price").exists().withMessage('Required field.');
                    req.check("orderLimit").exists().withMessage('Required field.');
                }

                req.check("discountable").optional().isBoolean().withMessage('Must be boolean.');
                req.check("active").optional().isBoolean().withMessage('Must be boolean.');

                var validationErrors = req.validationErrors();

                // Return validation errors
                if (validationErrors) return next(functions.formatExpValErrors(validationErrors));
                
                next();
            },

            deleteService: (req, res, next) => {
                // Make active state - 0
                req.body.active = 0;
                next();
            },

        },

        site: {
            
            createOrder: (req, res, next) => {
                // Required fields for fast type order
                req.check("firstName").exists().withMessage('Required field.');
                req.check("lastName").exists().withMessage('Required field.');
                req.check("email").exists().withMessage('Required field.');
                req.check("phone").exists().withMessage('Required field.');
                req.check("pickDate").exists().withMessage('Required field.');
                req.check("timeFrom").exists().withMessage('Required field.');
                req.check("timeTo").exists().withMessage('Required field.');
                req.check("type").exists().withMessage('Required field.');

                // Check for order type 
                if (['fast', 'normal'].indexOf(req.body.type) === -1)
                    throw new errors.InvalidParameters('Order type can be only fast or normal.');

                // Validations for normal type order
                if (req.body.type !== undefined && req.body.type == 'normal') {
                    req.check("totalAmount").exists().withMessage('Required field.');

                    // Check for order products
                    if (req.body.products === undefined)
                        throw new errors.InvalidParameters('Missing order products.');

                    // Check for valid order product fields
                    let err = false;
                    for (var i in req.body.products) {
                        if (req.body.products[i]['serviceId'] === undefined) err = true; break;
                        if (req.body.products[i]['count'] === undefined) err = true; break;
                        if (req.body.products[i]['totalAmount'] === undefined) err = true; break;
                    }

                    if (err === true)
                        throw new errors.InvalidParameters('Invalid order products fields.');
                }

                var validationErrors = req.validationErrors();
                
                // Return validation errors
                if (validationErrors) return next(functions.formatExpValErrors(validationErrors));
                
                next();
            },

            changeOrderStatus: (req, res, next) => {
                req.check("id").exists().withMessage('Required field.');
                req.check("status").exists().withMessage('Required field.');

                var validationErrors = req.validationErrors();
                
                // Return validation errors
                if (validationErrors) return next(functions.formatExpValErrors(validationErrors));

                if (['pending', 'finished'].indexOf(req.body.status) < 0) {
                    throw new errors.InvalidParameters("Order status can be only 'pending' or 'finished'.");
                }

                next();
            }
        },

        clients: {

            /**
             * Validations before client save
             */
            save: (req, res, next) => {
                if (req.body.id === undefined) {
                    req.check("firstName").exists().withMessage('Required field.');
                    req.check("lastName").exists().withMessage('Required field.');
                    req.check("phone").exists().withMessage('Required field.');
                    req.check("userId").exists().withMessage('Required field.');
                }

                var validationErrors = req.validationErrors();

                // Return validation errors
                if (validationErrors) return next(functions.formatExpValErrors(validationErrors));

                let addresses = req.body.addresses || [];
                delete req.body.addresses;

                req.body = {
                    client: req.body,
                    addresses: addresses
                }

                next();
            },
        },

        orders: {

            createOrder: (req, res, next) => {
                req.check("userId").exists().withMessage('Required field.');
                req.check("clientId").exists().withMessage('Required field.');
                req.check("paymentStatus").exists().withMessage('Required field.');

                var validationErrors = req.validationErrors();
                
                // Return validation errors
                if (validationErrors) return next(functions.formatExpValErrors(validationErrors));

                next();
            }
        }
    }


}