let db = require('../libs/database'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    Promise = require('promise');

let Private = {
    
    normalize: (data) => {
        data = functions.normalizeFields(data);
        return data; 
    }

}

let NfcModel = {};

/**
 * Get NFC tag by TagId
 * 
 */
NfcModel.getNfcTagByTagId = (tagId) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbTable = db.table('nfc_tags');
            let criteria = dbTable.criteria
                .where('tag_id').eq(tagId)

            dbTable.findSingle(criteria)
                .then(tag => resolve(tag))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}


/**
 * Create & Update NFC tag
 * 
 */
NfcModel.saveTag = (data) => {
    return new Promise((resolve, reject) => {
        NfcModel.getNfcTagByTagId(data.tagId)
            .then(nfcTag => {
                if (nfcTag !== undefined) {
                    return resolve(nfcTag);
                } else {
                    data = Private.normalize(data);
                    db.ready(function () {
                        db.table('nfc_tags').save(data)
                            .then(nfcTag => resolve(nfcTag))
                            .catch((err) => {
                                functions.logError(err);
                                reject(new errors.DatabaseError(err.sqlMessage));
                            });
                    })
                }
            })
            .catch(e => {
                console.log(e);
            })
    });
}

/**
 * Delete NFC tag
 * 
 */
NfcModel.deleteTag = (tagId) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            db.table('nfc_tags').remove(tagId)
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

module.exports = NfcModel;