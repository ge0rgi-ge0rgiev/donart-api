let db = require('../libs/database'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    Promise = require('promise');

let ConfigurationModel = {};

/**
 * Get all configuration settings
 * 
 */
ConfigurationModel.getAll = () => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('configuration').find()
                .then(data => resolve(data))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}

/**
 * Get configuration setting by setting name
 * 
 */
ConfigurationModel.getBySettngName = (setting) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbTable = db.table('configuration');
            let criteria = dbTable.criteria;
            criteria
                .where('currency').eq(setting);

            dbTable.findSingle(criteria)
                .then(data => resolve(data))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}


/**
 * Save setting - Both Create & Update
 * 
 */
ConfigurationModel.save = (data) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('configuration').save(data)
                .then(data => resolve(data))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}

/**
 * Delete setting
 */
ConfigurationModel.delete = (settingId) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('configuration').remove(settingId)
                .then(result => {
                    if (result.affectedRows === 1) {
                        return resolve(true);
                    }
                    resolve(false);
                })
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}


module.exports = ConfigurationModel;