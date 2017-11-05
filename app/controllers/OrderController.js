const config = require('../../config'),
    functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    OrderModel = require('../models/OrderModel');


exports.createOrder = (req, res, next) => {
    OrderModel.createOrder(req.body)
        .then(result => res.sendSuccess(result))
        .catch(err => next(err));
}
