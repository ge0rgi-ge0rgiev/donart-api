const config = require('../../config'),
    functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    SiteOrderModel = require('../models/SiteOrderModel');


exports.createOrder = (req, res, next) => {
    SiteOrderModel.save(req.body)
        .then(order => res.sendSuccess(order))
        .catch(err => next(err));
}

exports.getOrders = (req, res, next) => {
    let pagination = functions.getPaginationOptions(req);
    SiteOrderModel.getOrders(pagination)
        .then(order => res.sendSuccess(order))
        .catch(err => next(err));
}

exports.changeOrderStatus = (req, res, next) => {
    SiteOrderModel.getOrderById(req.body.id)
        .then((order) => {
            if (order === undefined)
                throw errors.InvalidParameters('Invalid order id');
            order.status = req.body.status;
            return SiteOrderModel.save(req.body);     
        })
        .then(order => res.sendSuccess(order))
        .catch(err => next(err));
}
