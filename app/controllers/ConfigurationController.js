let functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    ConfigurationModel = require('../models/ConfigurationModel');

/**
 * Get all configuration settings
 */
exports.getAll = (req, res, next) => {
    ConfigurationModel.getAll()
        .then(configuration => res.sendSuccess(configuration))
        .catch(err => next(err));
}

/**
 * Save setting - Both Create & Update
 */
exports.save = (req, res, next) => {
    ConfigurationModel.save(req.body)
        .then(configuration => res.sendSuccess(configuration))
        .catch(err => next(err));
}

/**
 * Delete configuration
 */
exports.delete = (req, res, next) => {
    ConfigurationModel.delete(req.body.id)
        .then(result => res.sendSuccess(result))
        .catch(err => next(err));
}
