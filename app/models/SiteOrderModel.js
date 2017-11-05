let db = require('../libs/database'),
    config = require('../../config'),
    functions = require('../libs/functions'),
    moment = require('moment'),
    Promise = require('promise');

let Private = {

    normalizeData: (data) => {
        let order = new Object;
        Object.assign(order, data);

        // changeOrderStatus (update)
        if (order.id) return {
            order: order
        };

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
     * Save product order data
     */
    saveOrderProducts: (orderProducts) => {
        return Promise.all(
            orderProducts.map(product => new Promise((resolve, reject) => {
                db.ready(function () {
                    db.table('site_order_products').save(product)
                        .then(product => resolve(product))
                        .catch((err) => {
                            functions.logError(err);
                            reject(new errors.DatabaseError(err.sqlMessage));
                        });
                });
            })
            )
        )
        .then(products)
        .catch((err) => { throw err });
    },

    /**
     * Get orders products
     */
    getOrdersProducts: (orders) => {
        return Promise.all(
                orders.map(order => new Promise((resolve, reject) => {
                    db.ready(function () {
                        let dbOrderProducts = db.table('site_order_products');
                        let criteria = dbOrderProducts.criteria
                            .where('order_id').eq(order.id);

                        dbOrderProducts.find(criteria)
                            .then(products => resolve(products))
                            .catch((err) => {
                                functions.logError(err);
                                reject(new errors.DatabaseError(err.sqlMessage));
                            });
                    });
                })
            )
        )
        .then((products) => {
            for (var i in orders) {
                if (products[i].length > 0) 
                    orders[i].products = products[i];
            }
            return orders;
        })
        .catch((err) => { throw err });
    },

    /**
     * Validate order products (order limit, total amount) and total order amount calculations
     */
    validateCalculations: (order) => {
        const ServiceModel = require('../models/ServiceModel');
        return new Promise((resolve, reject) => {
            orderCopy = new Object;
            Object.assign(orderCopy, order);

            //TODO: Store in database
            let cnf = config.api.siteOrder;

            let today = moment(),
                pickDate = moment(orderCopy.pickDate),
                timeFrom = moment(orderCopy.timeFrom),
                timeTo = moment(orderCopy.timeTo);

            // TimeFrom must be < than timeTo
            if (timeFrom.isAfter(timeTo))
                return reject(new errors.InvalidParameters('Invalid dates: timeFrom is after timeTo.'));

            // X hour diapason check between timeFrom and timeTo
            if (moment(timeFrom).add(cnf.diapason, 'hour').isSame(timeTo) === false)
                return reject(new errors.InvalidParameters('Invalid dates: invalid diapason between timeFrom and timeTo.'));

            // pickDate, timeFrom and timeTo dates are in the same day
            if ([pickDate.date(), timeFrom.date(), timeTo.date()].every( (val, i, arr) => val == arr[0] ) === false)
                return reject(new errors.InvalidParameters('Invalid dates: pickDate, timeFrom and timeTo must be in one day.'));
            
            // Min constraint for pickDate in days
            if (pickDate.date() < moment().add(1, 'day').date())
                return reject(new errors.InvalidParameters('Invalid dates: pickDate, timeFrom and timeTo must be in one day.'));
            
            // Max constraint for pickDate in days
            if (pickDate.isAfter(moment().add(cnf.maxPickDateDays, 'day')))
                return reject(new errors.InvalidParameters('Invalid dates: pickDate, timeFrom and timeTo must be in one day.'));


            let weekDays;
            if ([...Array(6).keys()].slice(1).indexOf(pickDate.weekday()) > -1) { // Work Days
                weekDays = 'workDays';
            } else if (pickDate.weekday() === 6) { // Saturday
                weekDays = 'saturday';
            } else { // Sunday (closed)
                return reject(new errors.InvalidParameters('Invalid dates: Sunday is not working day.'));
            }

            let open = cnf.workingTime[weekDays].open,
                closed = cnf.workingTime[weekDays].closed;

            // Check Open time
            if (timeFrom.hours() < open || timeTo.hours() < (open + cnf.diapason))
                return reject(new errors.InvalidParameters('Invalid dates: Issue with Open time.'));

            // Check Closed time
            if (timeTo.hours() > closed || ( (timeFrom.hours() + cnf.diapason) < (open + cnf.diapason) ))
                return reject(new errors.InvalidParameters('Invalid dates: Issue with Closed time.'));
        
            let _pickDate = functions.momentToMysqlDate(moment(pickDate).endOf('day')),
                _timeFrom = functions.momentToMysqlDate(moment(timeFrom));

            Private.availableBookingCheck(_pickDate, _timeFrom)
                .then(result => {
                    if (result !== null)
                        if (result.bookings >= cnf.ordersPerDiapason)
                            return reject(new errors.InvalidParameters('Invalid dates: This time diapason is full.'));

                    if (order.type === 'fast')
                        return resolve();

                    Promise.all(
                        order.products.map((product, index) => {
                            return new Promise((resolve, reject) => {
                                ServiceModel.getServiceById(product.serviceId)
                                    .then(service => {
                                        if (service.orderLimit < product.count)
                                            reject(new errors.InvalidParameters(['Invalid calculations (orderLimit) in order.products[', index, ']'].join('')));
        
                                        let totalAmount = product.count * service.price;
                                        
                                        if (totalAmount != product.totalAmount)
                                            reject(new errors.InvalidParameters(['Invalid calculations (totalAmount) in order.products[', index, ']'].join('')));
                                        
                                        resolve(totalAmount);
                                    })
                            })
                        })
                    )
                    .then(totalProductAmounts => {
                        if (order.totalAmount != totalProductAmounts.reduce((sum, value) => sum + value, 0))
                            return reject(new errors.InvalidParameters('Invalid calculations (totalAmount) in order'));
                    })
                    .then(() => resolve())
                    .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    },

    saveBooking: (data) => {
        data = functions.normalizeFields(data);
        return new Promise((resolve, reject) => {
            db.table('site_order_bookings').save(data)
                .then(booking => resolve(booking))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    },

    availableBookingCheck: (pickDate, timeFrom) => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                let sql = 'SELECT COUNT(time_from) as bookings ';
                sql += 'FROM site_order_bookings ';
                sql += [' WHERE pick_date = "', pickDate, '" AND '].join('');
                sql += [' time_from = "', timeFrom, '" '].join('');
                sql += 'GROUP BY time_from';

                db.query(sql, function (error, results) {
                    if (error) return reject(error);
                    if (results.length === 0) {
                        resolve(null);
                    }
                    resolve(results[0]);
                });
            });
        });
    },

    getBookingsByDate: (date) => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                let sql = 'SELECT time_from, COUNT(time_from) as bookings ';
                sql += 'FROM site_order_bookings ';
                sql += [' WHERE pick_date = "', date, '" '].join('');
                sql += 'GROUP BY time_from ';
                sql += ['HAVING bookings = ', config.api.siteOrder.ordersPerDiapason].join('');

                db.query(sql, function (error, results) {
                    if (error) return reject(error);
                    if (results.length === 0) {
                        resolve(null);
                    }
                    resolve(results);
                });
            });
        });
    }

}

let SiteOrderModel = {};

/**
 * Get user by userId
 * 
 */
SiteOrderModel.getOrderById = (orderId) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbOrders = db.table('site_orders');
            let criteria = dbOrders.criteria
                .where('id').eq(orderId)

            dbOrders.findSingle(criteria)
                .then(order => resolve(order))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}

/**
 * Save order - Order & Products
 */
SiteOrderModel.createOrder = (order) => {
    let returnOrderData,
        orderData = Private.normalizeData(order),
        configurationModel = require('../models/ConfigurationModel');
    
    return new Promise((resolve, reject) => {
        Private.validateCalculations(order)
            .then(() => configurationModel.getBySettngName('currency'))
            .then(currency => {
                orderData.order.currency = currency.value;
            })
            .then(() => SiteOrderModel.saveOrder(orderData.order))
            .then((order) => { return SiteOrderModel.getOrderById(order.id) })
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
            .catch((err) => {
                functions.logError(err);
                if (err.name && err.name === 'InvalidParameters')
                    return reject(err);
                reject(new errors.DatabaseError(err.sqlMessage));
            });
    });
}


/**
 * Get orders and products
 * 
 */
SiteOrderModel.getOrders = (pagination) => {
    return new Promise((resolve, reject) => {
        db.ready(function () {
            let dbOrders = db.table('site_orders');
            let criteria = dbOrders.criteria;

            if (pagination.all === false) {
                criteria.limit(pagination.offset, pagination.start);
            }

            dbOrders.find(criteria)
                .then((orders) => { return Private.getOrdersProducts(orders) })
                .then(orders => resolve(orders))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
}


/**
 * Save order data
 */
SiteOrderModel.saveOrder = (order) => {
    return new Promise((resolve, reject) => {
        let orderData,
            newOrder = (order.id === undefined) ? true: false;
        db.ready(function () {
            db.table('site_orders').save(order)
                .then(order => {
                    orderData = order;
                    if (newOrder) {
                        return Private.saveBooking({
                            pickDate: functions.momentToMysqlDate(moment(order.pickDate)),
                            timeFrom: functions.momentToMysqlDate(moment(order.timeFrom)),
                            timeTo: functions.momentToMysqlDate(moment(order.timeTo))
                        })
                    }
                })
                .then(() => resolve(orderData))
                .catch((err) => {
                    functions.logError(err);
                    reject(new errors.DatabaseError(err.sqlMessage));
                });
        });
    });
};


/**
 * Get available hours for booking
 */
SiteOrderModel.getAvailableHours = (date) => {
    return new Promise((resolve, reject) => {
        date = moment(date).endOf('day');
        let weekDays;
        if ([...Array(6).keys()].slice(1).indexOf(date.weekday()) > -1) { // Work Days
            weekDays = 'workDays';
        } else if (date.weekday() === 6) { // Saturday
            weekDays = 'saturday';
        } else { // Sunday (closed)
            return reject(new errors.InvalidParameters('Sunday: Closed.'));
        }

        let cnf = config.api.siteOrder;

        let hours = cnf.workingTime[weekDays],
            availableHours = [];

        for (let i = hours.open; i < hours.closed; i++) {
            availableHours.push(i);
        }

        Private.getBookingsByDate(date._i)
            .then(bookings => {
                if (bookings !== null) {
                    for (let i in bookings) {
                        let hour = moment(bookings[i].time_from).hours();
                        availableHours.splice(availableHours.indexOf(hour), 1);
                    }
                }

                return availableHours;
            })
            .then((availableHours) => {
                for (var i in availableHours) {
                    let hour = "0" + availableHours[i],
                        nextHour = "0" + (availableHours[i] + 1);

                    availableHours[i] = [hour.substr(hour.length - 2), ':00 - ', nextHour.substr(nextHour.length - 2), ':00'].join('');
                }

                resolve(availableHours);
            })
            .catch((err) => {
                functions.logError(err);
                reject(new errors.DatabaseError(err.sqlMessage));
            });
    })
    
}

module.exports = SiteOrderModel;