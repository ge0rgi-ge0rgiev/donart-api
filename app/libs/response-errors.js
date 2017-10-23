let errors = require('errors');


/**
 * 
 * Predefined error codes
 * 
 * 1: Ok
 * 2: InvalidParameters,
 * 3: MissingParameters,
 * 4: Unauthorized,
 * 5: NotFound,
 * 6: ServerError,
 * 7: DatabaseError
 * 
 */

 /**
 *  200 OK
 */
errors.create({
    name: 'Ok',
    defaultMessage: 'Ok.',
    code: 1,
    status: 200
});

/**
 *  400 Invalid parameters
 */
errors.create({
    name: 'InvalidParameters',
    defaultMessage: 'Invalid parameters.',
    code: 2,
    status: 400
});

/**
 *  400 Missing parameters
 */
errors.create({
    name: 'MissingParameters',
    defaultMessage: 'Missing parameters.',
    code: 3,
    status: 400
});

/**
 *  401 Unauthorized
 */
errors.create({
    name: 'Unauthorized',
    defaultMessage: 'Authnetication is required.',
    code: 4,
    status: 401
});

/**
 *  404 Not Found
 */
errors.create({
    name: 'NotFound',
    defaultMessage: 'Not found.',
    code: 5,
    status: 404
});

/**
 *  500 Server Error
 */
errors.create({
    name: 'ServerError',
    defaultMessage: 'Server error.',
    code: 6,
    status: 500
});

/**
 *  503 Server Error
 */
errors.create({
    name: 'DatabaseError',
    defaultMessage: 'Database error.',
    code: 7,
    status: 503
});

module.exports = errors;