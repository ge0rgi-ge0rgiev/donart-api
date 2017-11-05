let db = require('../libs/database'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    Promise = require('promise'),
    NfcModel = require('./NfcModel');

let Private = {

    normalizeOrder: (order) => {
        order.dueDate = new Date(order.dueDate);
        products = order.products;
        // products = order.products.map(product => functions.normalizeFields(product));
        delete order.products;
        order = functions.normalizeFields(order);
        
        return {
            order: order,
            products: products
        };
    },

    normalizeProducts: (products) => {
        return products.map(product => functions.normalizeFields(product));
    },

    handleProducts: (products, orderId) => {
        console.log(products);
        console.log(orderId);
    },

    saveOrder: (order) => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                db.table('orders').save(order)
                    .then(order => resolve(order))
                    .catch((err) => {
                        functions.logError(err);
                        reject(new errors.DatabaseError(err.sqlMessage));
                    });
            })
        });
    },

    //TODO: Един и същи таг, да не се създава повече от веднъж!!! Ташак с асинронията да го е ..
    setNfcData: (products) => {
        let tags = products.map()
        return Promise.all(
            products.map(product => new Promise((resolve, reject) => {
                    NfcModel.saveTag({tagId: product.tagId})
                        .then(nfcTag => {
                            product.nfcTagId = nfcTag.id;
                            delete product.tagId;
                            resolve(product);
                        })
                })
            )
        )
        .then(products)
        .catch((err) => { throw err });
    },

    saveProducts: (products, orderId) => {
        products = Private.normalizeProducts(products);
        return Promise.all(
            products.map(product => new Promise((resolve, reject) => {
                product.order_id = orderId;
                    db.ready(function () {
                        db.table('order_products').save(product)
                            .then(product => resolve(product))
                            .catch((err) => {
                                functions.logError(err);
                                reject(new errors.DatabaseError(err.sqlMessage));
                            });
                    })
                })
            )
        )
        .then(products)
        .catch((err) => { throw err });
    }


  

}

let OrderModel = {};


/**
 * Get user by userId
 * 
 */
OrderModel.createOrder = (order) => {
    data = Private.normalizeOrder(order);
    return new Promise((resolve, reject) => {
        let orderData;
        /**
         * Save order and get orderId
         * Create NFC tag
         * Loop order products
         *     - Update with orderId
         *     - Update with nfc tag ID
         * 
         */

        Private.saveOrder(data.order)
            .then(order => orderData = order)
            .then(() => Private.setNfcData(data.products))
            .then(products => Private.saveProducts(products, orderData.id))
            .then(products => {
                orderData.products = products;
                resolve(orderData);
            })
            .catch(e => {
                console.log(e);
            })
        

    });
}



module.exports = OrderModel;