const bcrypt = require('bcrypt'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    ClientModel = require('../models/ClientModel');


/**
 * Create or update existing user
 * 
 */
exports.save = (req, res, next) => {
    ClientModel.save(req.body)
        .then(client => {
            res.locals.client = client;
            if (req.file) {
                let filename = 'client_' + client.id + '.' + (req.file.mimetype.split('/')[1]);
                return functions.moveUploadedFiles(req.file.path, [config.api.uploadDir.avatars, filename]);
            }
        })
        .then((avatar) => {
            if (avatar) {
                let avatarUrl = [
                    functions.getDomain(req),
                    config.api.avatarRoute,
                    avatar.split('/').pop()
                ].join('');

                return ClientModel.save({
                    client: {
                        id: res.locals.client.id,
                        avatar: avatarUrl
                    }
                });
            }
        })
        // Update user addressess
        .then((client) => {
            let data = (client) ? client : res.locals.client;
            res.sendSuccess(data);
        })
        .catch(err => next(err));
}


/**
 * Add client address
 * 
 */
exports.addAddress = (req, res, next) => {
    ClientModel.addAddress(req.body)
        .then(client => res.sendSuccess(client))
        .catch(err => next(err));
}

/**
 * Delete client address
 * 
 */
exports.deleteAddress = (req, res, next) => {
    ClientModel.deleteAddress(req.body.id)
        .then(status => res.sendSuccess(status))
        .catch(err => next(err));
}

/**
 * Get clients by filter
 * 
 */
exports.filter = (req, res, next) => {
    let pagination = functions.getPaginationOptions(req);
    ClientModel.getClients({
        filter: req.body,
        pagination: pagination
    })
    .then(clients => res.sendSuccess(clients))
    .catch(err => next(err));
}

