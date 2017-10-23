const db = require('../libs/database'),
    functions = require('../libs/functions'),
    config = require('../../config');
    errors = require('../libs/response-errors'),
    Promise = require('promise');

let Private = {

    normalizeData: (data) => {
        data = functions.normalizeFields(data);

        if (data.active) {
            data.active = (data.active == "true") ? 1 : 0;
        }
    }

};

let ServiceModel = {};

/**
 * Get user by userId
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
* Save service category. Used for both create and update.
* 
*/
ServiceModel.saveCategory = (serviceCategory) => {
    serviceCategory = Private.normalizeData(serviceCategory);
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('service_categories').save(serviceCategory)
                .then(serviceCategory => ServiceModel.getCategoryById(serviceCategory.id))
                .then(serviceCategory => resolve(serviceCategory))
                .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
        });
    });
}

module.exports = ServiceModel;