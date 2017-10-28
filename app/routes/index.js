
const router = require('express').Router()
    config = require('../../config'),

    // File upload
    multer = require('multer'),
    upload = multer({ dest: config.api.uploadDir.main}),

    middlewares = require('../libs/middlewares'),
    { check, validationResult } = require('express-validator/check')

    ApiController = require('../controllers/ApiController'),
    UserController = require('../controllers/UserController'),
    ServiceController = require('../controllers/ServiceController'),
    SiteOrderController = require('../controllers/SiteOrderController'),
    ClientController = require('../controllers/ClientController'),
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
            router.post('/users/save',
                middlewares.adminOnlyCheck,
                upload.single('avatar'),
                middlewares.routes.users.save,
                UserController.save
            );
            
            /**
             * Save user - Create & Update
             * 
             */
            router.post('/users/deleteUser',
                middlewares.adminOnlyCheck,
                [
                    check('id').exists().withMessage('User ID is required.'),
                ],
                middlewares.validatorResult,
                middlewares.routes.users.deleteUser,
                UserController.save
            );

            /**
             * Get all users
             * 
             */
            router.post('/users/getAll', UserController.getAll);

    
    /**
     * Service ednpoints
     */

            /**
             * Save Service Category - Create & Update
             */
            router.post('/services/saveCategory',
                middlewares.adminOnlyCheck,
                middlewares.routes.services.saveCategory,
                ServiceController.saveCategory
            );

            /**
             * Delete Service Category
             */
            router.post('/services/deleteCategory',
                middlewares.adminOnlyCheck,
                [
                    check('id').exists().withMessage('ServiceCategory ID is required.'),
                ],
                middlewares.validatorResult,
                middlewares.routes.services.deleteCategory,
                ServiceController.saveCategory
            );

            /**
             * Save Service - Create & Update
             */
            router.post('/services/saveService',
                middlewares.adminOnlyCheck,
                middlewares.routes.services.saveService,
                ServiceController.saveService
            );

            /**
             * Delete Service Category
             */
            router.post('/services/deleteService',
                middlewares.adminOnlyCheck,
                [
                    check('id').exists().withMessage('Service ID is required.'),
                ],
                middlewares.validatorResult,
                middlewares.routes.services.deleteService,
                ServiceController.saveService
            );

            /**
             * Get all services
             */
            router.post('/services/getAll',ServiceController.getAll);


    /**
     * Site order endpoints
     */


            /**
             * Create site order
             */
            router.post('/site/createOrder',
                middlewares.routes.site.createOrder,
                SiteOrderController.createOrder
            );
        
            /**
             * Get all site orders
             */
            router.post('/site/getOrders', SiteOrderController.getOrders);

            /**
             * Change order status
             */
            router.post('/site/changeOrderStatus',
                middlewares.routes.site.changeOrderStatus,
                SiteOrderController.changeOrderStatus
            );

    /**
     * Clients ednpoints
     */

            /**
             * Save client for both Create and Update
             */
            router.post('/clients/save',
                upload.single('avatar'),
                middlewares.routes.clients.save,
                ClientController.save
            );

            /**
             * Save client for both Create and Update
             */
            router.post('/clients/addAddress',
                [
                    check('address').exists().withMessage('Address is required.'),
                    check('clientId').exists().withMessage('Client ID is required.'),
                ],
                middlewares.validatorResult,
                ClientController.addAddress
            );

            /**
             * Save client for both Create and Update
             */
            router.post('/clients/deleteAddress',
                [
                    check('id').exists().withMessage('ID is required.'),
                ],
                middlewares.validatorResult,
                ClientController.deleteAddress
            );
/**
 * For test purporses
 */
// router.post('/test', middlewares.AdminOnlyCheck, TestController.test);
router.post('/test', TestController.test);


/**
 *  404 Not Found route
 */
router.post('*', ApiController.notFound);

/**
 * Avatar request route
 */
router.get('/avatar/:image', middlewares.routes.avatar);

/**
 * List of available endpoints
 */
router.get('/api', (req, res) => res.json({data: 
    "Comming soon."
}));

/**
 * Restrict the rest get requests
 */
router.get('*', ApiController.notFound);

module.exports = router;