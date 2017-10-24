let functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    ServiceModel = require('../models/ServiceModel');


/**
 * Save Service Category - both Create & Update
 */
exports.saveCategory = (req, res, next) => {
    ServiceModel.saveCategory(req.body)
        .then(data => res.sendSuccess(data))
        .catch(err => next(err));
}

/**
 * Save Service - both Create & Update
 */
exports.saveService = (req, res, next) => {
    ServiceModel.saveService(req.body)
        .then(data => res.sendSuccess(data))
        .catch(err => next(err));
}

/**
 * Get all services
 * 
 */
exports.getAll = (req, res, next) => {
    ServiceModel.getServices()
        .then(services => res.sendSuccess(services))
        .catch(err => next(err));
}