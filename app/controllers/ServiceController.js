let functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    ServiceModel = require('../models/ServiceModel');


exports.saveCategory = (req, res, next) => {
    ServiceModel.saveCategory(req.body)
        .then(data => res.sendSuccess(data))
        .catch(err => next(err));
}

exports.saveService = (req, res, next) => {
    ServiceModel.saveService(req.body)
        .then(data => res.sendSuccess(data))
        .catch(err => next(err));
}
