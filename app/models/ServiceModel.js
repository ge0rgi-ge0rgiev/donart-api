const db = require('../libs/database'),
    functions = require('../libs/functions'),
    config = require('../../config');
errors = require('../libs/response-errors'),
    Promise = require('promise');

let Private = {

    normalizeData: {

        serviceCategory: (data) => {
            data = functions.normalizeFields(data);
            data = functions.intToBoolFieldValues(data, ['active']);

            if (data.translation) {
                data.translation = JSON.stringify(data.translation);
            }

            return data;
        },

        service: (data) => {
            data = functions.normalizeFields(data);
            data = functions.intToBoolFieldValues(data, ['active', 'discountable']);

            return data;
        },

    },

    getCategories: (onlyParent) => {
        onlyParent = (onlyParent === undefined) ? 'NOT' : '';
        return new Promise((resolve, reject) => {
            db.ready(function () {
                let sql = 'SELECT * FROM `service_categories` WHERE ';
                sql += '`active` = 1 AND ';
                sql += '`parent_id` is ' + onlyParent + ' NULL';

                db.query(sql, function (error, results) {
                    if (error) return reject(error);
                    resolve(results);
                });
            });
        });
    },

    getServices: () => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                let dbServices = db.table('services');
                let criteria = dbServices.criteria
                    .where('active').eq(1);

                dbServices.find(criteria)
                    .then(service => resolve(service))
                    .catch(err => reject(err));
            });
        });
    },

    constructServiceData: (data) => {
        // Main categories and Ids
        let serviceData = data.parentCategories;
        let mainCatsIds = serviceData.map((category) => category.id);

        // Sub category Ids and Pids
        let subCategories = data.subCategories;
        let subCatIds = data.subCategories.map((category) => category.id);
        let subCatPids = data.subCategories.map((category) => category.parent_id);

        // Category Ids of services
        let serviceCatIds = data.services.map((category) => category.serviceCategoryId);

        // Add services to categories
        for (var i in serviceCatIds) {
            let mainCatIndex = mainCatsIds.indexOf(serviceCatIds[i]);
            // Add service to main category
            if (mainCatIndex >= 0) {
                serviceData[mainCatIndex].services = serviceData[mainCatIndex].services || [];
                serviceData[mainCatIndex].services.push(data.services[i]);
            } else {
                // Add service to sub category
                let subCatIndex = subCatIds.indexOf(serviceCatIds[i]);
                if (subCatIndex === -1) continue;
                subCategories[subCatIndex].services = subCategories[subCatIndex].services || [];
                subCategories[subCatIndex].services.push(data.services[i]);
            }
        }

        // Add sub categories to main categories
        for (var i in subCatPids) {
            let serviceIndex = mainCatsIds.indexOf(subCatPids[i]);
            serviceData[serviceIndex].subCategories = serviceData[serviceIndex].subCategories || [];
            serviceData[serviceIndex].subCategories.push(subCategories[i]);
        }

        serviceData = functions.intToBoolFieldValues(serviceData, ['active', 'discountable']);
        serviceData = functions.applyCbToField(serviceData, 'translation', (data) => {
            return JSON.parse(data);
        });

        return serviceData;
    },

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
                .then(serviceCategory => {
                    serviceCategory.translation = JSON.parse(serviceCategory.translation);
                    serviceCategory = functions.intToBoolFieldValues([serviceCategory], ['active']);
                    resolve(serviceCategory.shift());
                })
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
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
                .then(service => {
                    service.translation = JSON.parse(service.translation);
                    service = functions.intToBoolFieldValues([service], ['active']);
                    resolve(service.shift());
                })
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
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
                .then(serviceCategory => resolve(ServiceModel.getCategoryById(serviceCategory.id)))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
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
                .then(service => resolve(ServiceModel.getServiceById(service.id)))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}




/**
* Get service categories and services
* 
*/
ServiceModel.getServices = () => {
    let data = {};
    return new Promise((resolve, reject) => {
        db.ready(function () {
            Private.getCategories(true)
                .then((parentCategories) => {
                    data.parentCategories = parentCategories;
                    return Private.getCategories();
                })
                .then((subCategories) => {
                    data.subCategories = subCategories;
                    return Private.getServices();
                })
                .then((services) => {
                    data.services = services;
                    return Private.constructServiceData(data);
                })
                .then(services => resolve(services))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}


module.exports = ServiceModel;