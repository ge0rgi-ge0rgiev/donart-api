
const router = require('express').Router()
    config = require('../../config'),

    // File upload
    multer = require('multer'),
    upload = multer({ dest: config.api.uploadDir.main}),

    middlewares = require('../libs/middlewares'),
    { check, validationResult } = require('express-validator/check')

    ApiController = require('../controllers/ApiController'),
    UserController = require('../controllers/UserController'),
    TestController = require('../controllers/TestController');

    /**
     * User ednpoints
     */

            /**
             * Authenticate user with userId and password
             * 
             */
            router.post('/users/login',
                [
                    check('userId')
                        .exists().withMessage('User ID is required.'),
                    check('password')
                        .exists().withMessage('Password is required.')
                        .isLength({ min: 3 }).withMessage('Passwords must be at least 3 chars long.'),
                ],
                middlewares.validatorResult,
                middlewares.routes.users.login,
                UserController.login
            );

            /**
             * Refresh user session by Refresh Token
             * 
             */
            router.post('/users/refreshSession',
                [
                    check('refreshToken')
                        .exists().withMessage('Refresh token header parameter is required for update the session.')
                        .isLength({ min: 50, max: 50 }).withMessage('Invalid refreshToken.'),
                ],
                middlewares.validatorResult,
                UserController.refreshSession
            );

            /**
             * Save user - Create & Update
             * 
             */
            router.post('/users/save', upload.single('avatar'), UserController.save);

/**
 * For test purporses
 */
// router.post('/test', middlewares.AdminOnlyCheck, TestController.test);
router.post('/test', middlewares.adminOnlyCheck, TestController.test);


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