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

        if (data.is_admin) {
            user.is_admin = (data.is_admin == "true") ? 1 : 0;
        }

        if (data.active) {
            user.active = (data.active == "true") ? 1 : 0;
        }

        if (data.avatar) {
            user.avatar = data.avatar.split('/').pop();;
        }

        return user;
    }
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
                .catch(err => reject(err));
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
                .catch(err => reject(err));
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
                .then(user => resolve(user))
                .catch(err => reject(err));
        });
    });
}

module.exports = UserModel;