const db = require('../libs/database'),
    functions = require('../libs/functions'),
    config = require('../../config');
    errors = require('../libs/response-errors'),
    Promise = require('promise');

let Private = {

    normalizeData: {

        serviceCategory: (data) => {
            data = functions.normalizeFields(data);
            
            if (data.active !== undefined) {
                data.active = (data.active == "true") ? 1 : 0;
            }
    
            return data;
        },

        service: (data) => {
            data = functions.normalizeFields(data);
            
            if (data.active !== undefined) {
                data.active = (data.active == "true") ? 1 : 0;
            }

            if (data.discountable !== undefined) {
                data.discountable = (data.discountable == "true") ? 1 : 0;
            }
    
            return data;
        },


        
    }

};

let ServiceModel = {};

/**
 * Get service category by ID
 * 
 */
ServiceModel.getCategoryById = (categoryId) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbCategories = db.table('service_categories');
            let criteria = dbCategories.criteria
                .where('id').eq(categoryId)

            dbCategories.findSingle(criteria)
                .then(serviceCategory => resolve(serviceCategory))
                .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
        });
    });
}

/**
 * Get service by ID
 * 
 */
ServiceModel.getServiceById = (serviceId) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbServices = db.table('services');
            let criteria = dbServices.criteria
                .where('id').eq(serviceId)

            dbServices.findSingle(criteria)
                .then(service => resolve(service))
                .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
        });
    });
}

/**
* Save service category. Used for both create and update.
* 
*/
ServiceModel.saveCategory = (serviceCategory) => {
    serviceCategory = Private.normalizeData.serviceCategory(serviceCategory);
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('service_categories').save(serviceCategory)
                .then(serviceCategory => ServiceModel.getCategoryById(serviceCategory.id))
                .then(serviceCategory => resolve(serviceCategory))
                .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
        });
    });
}

/**
* Save service. Used for both create and update.
* 
*/
ServiceModel.saveService = (service) => {
    service = Private.normalizeData.service(service);
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('services').save(service)
                .then(service => ServiceModel.getServiceById(service.id))
                .then(service => resolve(service))
                .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
        });
    });
}

module.exports = ServiceModel;