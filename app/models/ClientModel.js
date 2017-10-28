let db = require('../libs/database'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    Promise = require('promise');

let Private = {

    normalizeClient: (client) => {
        return functions.normalizeFields(client);
    },

    saveClient: (client) => {
        client = Private.normalizeClient(client);
        return new Promise((resolve, reject) => {
            db.ready(function () {
                db.table('clients').save(client)
                    .then(client => resolve(client))
                    .catch((err) => {
                        functions.logError(err);
                        reject(new errors.DatabaseError(err.sqlMessage));
                    });
            });
        });
    },

    saveAddresses: (addresses, clientId) => {
        return Promise.all(
            addresses.map(address => 
                new Promise((resolve, reject) => {
                    db.ready(function () {
                        db.table('client_addresses').save({address: address, client_id: clientId})
                            .then(address => resolve(address))
                            .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
                    });
                })
            )
        )
        .then(addresses)
        .catch((err) => { throw err });
    },

    getClientAddresses: (clientId) => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                let dbUsers = db.table('client_addresses');
                let criteria = dbUsers.criteria
                    .where('client_id').eq(clientId)
    
                dbUsers.find(criteria)
                    .then(addresses => resolve(addresses))
                    .catch((err) => {
                        functions.logError(err);
                        reject(new errors.DatabaseError(err.sqlMessage));
                    });
            });
        });
    },

    getClientById: (clientId) => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                let clientData;
                let dbClients = db.table('clients');
                let criteria = dbClients.criteria
                    .where('id').eq(clientId)
    
                dbClients.findSingle(criteria)
                    .then(client => {
                        clientData = client;
                        return Private.getClientAddresses(client.id);
                    })
                    .then(addresses => {
                        clientData.addresses = (addresses !== undefined) ? addresses : [];
                        clientData = functions.intToBoolFieldValues([clientData], ['active', 'receiveSms']);
                        resolve(clientData.shift());
                    })
                    .catch((err) => {
                        functions.logError(err);
                        reject(new errors.DatabaseError(err.sqlMessage));
                    });
            });
        });
    }





}

let ClientModel = {};



/**
 * Save client. Both create and update.
 * 
 */
ClientModel.save = (clientData) => {
    return new Promise((resolve, reject) => {
        Private.saveClient(clientData.client)
            .then(client => {
                if (clientData.addresses !== undefined && clientData.addresses.length > 0) {
                    Private.saveAddresses(clientData.addresses, client.id);
                }
                return client;
            })
            .then(client => resolve(Private.getClientById(client.id)))
            .catch((err) => {
                functions.logError(err);
                reject(new errors.DatabaseError(err.sqlMessage));
            });
    });
}

/**
 * Save client. Both create and update.
 * 
 */
ClientModel.addAddress = (address) => {
    return new Promise((resolve, reject) => {
        Private.saveAddresses([address.address], address.clientId)
            .then(address => {
                address = address.pop();
                resolve(Private.getClientById(address.clientId))
            })
            .catch((err) => {
                functions.logError(err);
                reject(new errors.DatabaseError(err.sqlMessage));
            });
    });
}

module.exports = ClientModel;