const bcrypt = require('bcrypt'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    UserModel = require('../models/UserModel');


/**
 * API token authentication
 * 
 */
exports.login = (req, res, next) => {
    let returnData;
    let SessionModel = require('../models/SessionModel');

    // Get user object by User ID and hashed Password
    UserModel.getUserByCredentials(req.body.userId, req.body.password)
        .then((user) => {
            // Return error if there`s no user corresponding to supplied credentials
            if (user === undefined) throw new errors.InvalidParameters('Invalid user credentials.');
            return user;
        })
        .then((user) => {
            // Check for previously created user session
            return SessionModel.getSessionData({ userId: user.id })
                .then((session) => { return {user, session} });
        })
        .then((data) => {
            // If there is a created session, update the session expiration and return the session object
            if (data.session) {
                return SessionModel.updateExpirationTime(data.session)
            } else {
                // We have to create new session object, that`s why we need the user details
                const UIDGenerator = new require('uid-generator');
                let uidgen = new UIDGenerator(256, UIDGenerator.BASE36);

                // Create new session and return the session object
                return SessionModel.saveSession({
                    user_id: data.user.id,
                    auth_token: uidgen.generateSync(),
                    refresh_token: uidgen.generateSync(),
                    expiration: functions.getDateObject(config.api.sessionDuration)
                })
            }
        })
        .then(session => {
            returnData = session;
            return UserModel.getUserById(session.userId);
        })
        .then(user => {
            returnData.avatar = user.avatar;
            res.sendSuccess(returnData);
        })
        .catch(err => next(err));
}


/**
 * Update user session with refresh token
 * 
 */
exports.refreshSession = (req, res, next) => {
    let SessionModel = require('../models/SessionModel');

    // Get user session by refreshToken parameter
    SessionModel.getSessionData({ refreshToken: req.headers.refreshtoken })
        .then((session) => {
            // Check for available session
            if (session === undefined) throw new errors.InvalidParameters('Invalid refresh token.');
            return session;
        })
        .then(session => SessionModel.updateExpirationTime(session))
        .then(session => res.sendSuccess(session))
        .catch(err => next(err));
}


/**
 * Create or update existing user
 * 
 */
exports.save = (req, res, next) => {
    UserModel.save(req.body)
        .then((user) => {
            res.locals.user = user;
            // Check for uploaded file
            if (req.file) {
                res.locals.user = user;
                let filename = 'user_' + user.id + '.' + (req.file.mimetype.split('/')[1]);
                return functions.moveUploadedFiles(req.file.path, [config.api.uploadDir.avatars, filename]);
            }
        })
        .then((avatar) => {
            // Update the avatar if there`s is file upload
            if (avatar) {
                res.locals.user.domain = functions.getDomain(req);
                res.locals.user.avatar = avatar;
                return UserModel.save(res.locals.user);
            }
        })
        .then((user) => {
            let data = (user) ? user : res.locals.user;
            res.sendSuccess(data);
        })
        .catch(err => next(err));
}


/**
 * Get all users
 * 
 */
exports.getAll = (req, res, next) => {
    let pagination = functions.getPaginationOptions(req);
    UserModel.getUsers(pagination)
        .then(users => res.sendSuccess(users))
        .catch(err => next(err));
}

/**
 * Toggle the active user state
 */
exports.toggleActiveState = (req, res, next) => {
    UserModel.toggleActiveState(req.body.id)
        .then(user => res.sendSuccess(user))
        .catch(err => next(err));
}

