
const router = require('express').Router()

    middlewares = require('../libs/middlewares'),
    { check, validationResult } = require('express-validator/check')

    ApiController = require('../controllers/ApiController'),
    AuthController = require('../controllers/AuthController'),
    TestController = require('../controllers/TestController');

/**
 * Authenticate user with userId and password
 * 
 */
router.post('/auth/authenticate',
    [
        check('userId')
            .exists().withMessage('User ID is required.'),
        check('password')
            .exists().withMessage('Password is required.')
            .isLength({ min: 3 }).withMessage('Passwords must be at least 3 chars long.'),
    ],
    middlewares.validatorResult,
    middlewares.routes.auth.authenticate,
    AuthController.authenticate
);

/**
 * Refresh user session by Refresh Token
 * 
 */
router.post('/auth/refreshSession',
    [
        check('refreshToken')
            .exists().withMessage('Refresh token header parameter is required for update the session.')
            .isLength({ min: 50, max: 50 }).withMessage('Invalid refreshToken.'),
    ],
    middlewares.validatorResult,
    AuthController.refreshSession
);

/**
 * For test purporses
 */
router.post('/test', TestController.test);

/**
 *  404 Not Found route
 */
router.post('*', ApiController.notFound);

/**
 * List of available endpoints
 */
router.get('/api', (req, res) => res.json({data: 
    "Comming soon."
}));

/**
 * Restrict the rest get requests
 */
router.get('*', (req, res) => res.json({data: 
    "Donart API recieves only POST requests."
}));

module.exports = router;