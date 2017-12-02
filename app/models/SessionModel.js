// "use strict"

const db = require('../libs/database'),
    functions = require('../libs/functions'),
    config = require('../../config');
    errors = require('../libs/response-errors'),
    Promise = require('promise');

let Private = {

    getCriteriaObject: (params) => {
        let whereFields = {
            authToken: "auth_token",
            refreshToken: "refresh_token",
            userId: "user_id"
        }
        let paramKey = Object.keys(params)[0];
        return db.table('session').criteria
            .where(whereFields[paramKey]).eq(params[paramKey]);
    },

    isValidSession: (session) => {
        return functions.isBeforeCurrentTime(session.expiration);
    }

};

let SessionModel = {};


/**
 * Get session data by authentication token
 * 
 */
SessionModel.getSessionData = (params) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let criteria = Private.getCriteriaObject(params);
            db.table('session').findSingle(criteria)
                .then(session => resolve(session))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}


/**
 * Save session. Used for both create and update session.
 * 
 */
SessionModel.saveSession = (session) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('session').save(session)
                .then(result => resolve(result))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}

/**
 * Get session by authentication token.
 * 
 */
SessionModel.getSessionByAuthToken = (req, res) => {
    return new Promise((resolve, reject) => {
        // Get authentication token from http headers
        let _authToken = req.headers.authtoken || undefined;

        // If there`s no token supplied
        if (!_authToken)
            return reject(new errors.Unauthorized('Authentication token is required.'));

        // Get session object
        SessionModel.getSessionData({ authToken: _authToken })
            .then(function (session) {
                // If there`s no session associated with the token
                if (!session)
                    return reject(new errors.Unauthorized('Invalid authentication token.'));

                // Check for session expiration date
                if (!Private.isValidSession(session))
                    return reject(new errors.InvalidParameters('Your session has expired.'));

                resolve(session);
            })
            .catch((err) => {
                functions.logError(err);
                reject(new errors.DatabaseError(err.sqlMessage));
            });
    });
}

/**
 * Update expiration session time
 * 
 */
SessionModel.updateExpirationTime = (session) => {
    return new Promise((resolve, reject) => {
        // Update the expiration time of the session
        session.expiration = functions.getDateObject(config.api.sessionDuration);
        SessionModel.saveSession(session)
            .then(resolve(session))
            .catch((err) => {
                functions.logError(err);
                reject(new errors.DatabaseError(err.sqlMessage));
            });
    });
}

module.exports = SessionModel;