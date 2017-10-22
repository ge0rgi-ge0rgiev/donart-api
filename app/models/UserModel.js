let db = require('../libs/database'),
    Promise = require('promise');

/**
 * Get user by credentials
 * 
 */
exports.getUserByCredentials = function (userId, password) {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbUsers = db.table('users');
            let criteria = dbUsers.criteria
                .where('id').eq(userId)
                .where('password').eq(password);

            dbUsers.findSingle(criteria)
                .then(user => resolve(user))
                .catch(err => reject(err));
        });
    });
}


/**
 * Get user by userId
 * 
 */
exports.getUserById = function (userId) {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbUsers = db.table('users');
            let criteria = dbUsers.criteria
                .where('id').eq(userId)

            dbUsers.findSingle(criteria)
                .then(user => resolve(user))
                .catch(err => reject(err));
        });
    });
}