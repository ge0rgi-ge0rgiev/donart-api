let db = require('../libs/database'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    Promise = require('promise');

let Private = {
    normalizeData: (data) => {
        data = functions.normalizeFields(data);
        let user = {};

        if (data.id) {
            user.id = data.id;
        }

        if (data.name) {
            user.name = data.name;
        }

        if (data.password) {
            let bcrypt = require('bcrypt');
            user.password = bcrypt.hashSync(data.password, config.api.salt);
        }

        if (data.is_admin !== undefined) {
            user.is_admin = (data.is_admin == "true") ? 1 : 0;
        }

        if (data.active !== undefined) {
            user.active = (data.active == "true") ? 1 : 0;
        }

        if (data.avatar) {
            user.avatar = [data.domain, config.api.avatarRoute, data.avatar.split('/').pop()].join('');
        }

        return user;
    },

}

let UserModel = {};

/**
 * Get user by credentials
 * 
 */
UserModel.getUserByCredentials = (userId, password) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbUsers = db.table('users');
            let criteria = dbUsers.criteria
                .where('id').eq(userId)
                .where('password').eq(password);

            dbUsers.findSingle(criteria)
                .then(user => resolve(user))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}


/**
 * Get user by userId
 * 
 */
UserModel.getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbUsers = db.table('users');
            let criteria = dbUsers.criteria
                .where('id').eq(userId)

            dbUsers.findSingle(criteria)
                .then(user => resolve(user))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}

/**
 * Get user by userId
 * 
 */
UserModel.getUsers = (pagination) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbUsers = db.table('users');
            let criteria = dbUsers.criteria
                .where('active').eq(1);

            if (pagination.all === false) {
                criteria.limit(pagination.offset, pagination.start);
            }

            dbUsers.find(criteria)
                .then(user => resolve(user))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}



/**
 * Save user. Used for both create and update user.
 * 
 */
UserModel.save = (user) => {
    user = Private.normalizeData(user);
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('users').save(user)
                .then(user => UserModel.getUserById(user.id))
                .then(user => resolve(user))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}

module.exports = UserModel;