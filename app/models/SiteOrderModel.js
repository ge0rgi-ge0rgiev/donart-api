let db = require('../libs/database'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    Promise = require('promise');

let Private = {

    normalizeData: (order) => {
        order.pickDate = new Date(order.pickDate);
        order.timeFrom = new Date(order.timeFrom);
        order.timeTo = new Date(order.timeTo);

        if (order.type == 'fast') {
            return {
                order: functions.normalizeFields(order)
            };
        }

        products = order.products.map(product => functions.normalizeFields(product));
        delete order.products;
        order = functions.normalizeFields(order);

        return {
            order: order,
            products: products
        };
    },

    /**
     * Save order data
     */
    saveOrder: (order) => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                db.table('site_orders').save(order)
                    .then(order => resolve(order))
                    .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
            });
        });
    },

    /**
     * Save product order data
     */
    saveOrderProducts: (orderProducts) => {
        return Promise.all(
            orderProducts.map(product => new Promise((resolve, reject) => {
                db.ready(function () {
                    db.table('site_order_products').save(product)
                        .then(product => resolve(product))
                        .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
                });
            })
            )
        )
        .then(products)
        .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
    }

}

let SiteOrderModel = {};

/**
 * Save order - Order & Products
 */
SiteOrderModel.save = (order) => {
    let orderData = Private.normalizeData(order);
    return new Promise((resolve, reject) => {
        let returnOrderData;
        Private.saveOrder(orderData.order)
            .then((order) => {
                returnOrderData = order;
                if (orderData.products !== undefined) {
                    for (var i in orderData.products) {
                        orderData.products[i].order_id = order.id;
                    }
                    return Private.saveOrderProducts(orderData.products);
                }
                return null;
            })
            .then((products) => {
                if (products !== null) returnOrderData.products = products;
                resolve(returnOrderData);
            })
            // .catch(err => reject(new errors.DatabaseError(err.sqlMessage)));
            .catch((err) => {
                console.log(err);
            });
            
    });
}



module.exports = SiteOrderModel;