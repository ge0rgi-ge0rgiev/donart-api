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
        .then(service => {
            res.locals.service = service;
            if (req.file) {
                let filename = 'service_' + service.id + '.' + (req.file.mimetype.split('/')[1]);
                return functions.moveUploadedFiles(req.file.path, [config.api.uploadDir.avatars, filename]);
            }
        })
        .then(avatar => {
            if (avatar) {
                let avatarUrl = [
                    functions.getDomain(req),
                    config.api.avatarRoute,
                    avatar.split('/').pop()
                ].join('');

                return ServiceModel.saveService({
                    id: res.locals.service.id,
                    avatar: avatarUrl
                });
            }
        })
        .then(service => {
            let responseData = (service) ? service : res.locals.service; 
            return res.sendSuccess(responseData); 
        })
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

/**
 * Toggle active state of service
 * 
 */
exports.toggleActiveServiceState = (req, res, next) => {
    ServiceModel.toggleActiveServiceState(req.body.id)
        .then(service => res.sendSuccess(service))
        .catch(err => next(err));
}

/**
 * Toggle active state of service category
 * 
 */
exports.toggleActiveServiceCategoryState = (req, res, next) => {
    ServiceModel.toggleActiveServiceCategoryState(req.body.id)
        .then(category => res.sendSuccess(category))
        .catch(err => next(err));
}