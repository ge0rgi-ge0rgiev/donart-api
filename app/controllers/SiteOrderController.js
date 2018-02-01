const config = require('../../config'),
    functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    SiteOrderModel = require('../models/SiteOrderModel'),
    ServiceModel = require('../models/ServiceModel'),
    mailgun = require('../libs/mailgun');

exports.createOrder = (req, res, next) => {
    SiteOrderModel.createOrder(req.body)
        .then(order => {
            if (order.products) {
                return Promise.all(
                    order.products.map((product, index) => {
                        return new Promise((resolve, reject) => {
                            ServiceModel.getServiceById(product.serviceId).then(service => {
                                order.products[index].name = service.translation.bg;
                                resolve();
                            });
                        });
                    })
                ).then((asd) => {
                     return order 
                });
            } else {
                return order;
            }
        })
        .then(order => {
            let html = 'Fast order.';

            if (order.products) {
                html = order.products.map(product => {
                    return [product.count, ' X ', product.name, ' - ', product.totalAmount, 'лв '].join('');                     
                });

                html.push([]);
                html.push(['Общо: ', order.totalAmount, 'лв'].join(''));

                html = html.join('\n');
            }

            mailgun.sendMail({
                to: order.email,
                from: ['Donart Corporation ', ' ', 'orders@donart.com'].join(''),
                subject: ['Donart - Details for Order #', order.id].join(''),
                html: html,
            })
            .then((data) => {
                res.sendSuccess(order)
            })
        })
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
            return SiteOrderModel.saveOrder(req.body);
        })
        .then(order => res.sendSuccess(order))
        .catch(err => next(err));
}

exports.getAvailableHours = (req, res, next) => {
    SiteOrderModel.getAvailableHours(req.body.date)
        .then(availableHours => res.sendSuccess(availableHours))
        .catch(err => next(err));
}

exports.inquiry = (req, res, next) => {
    mailgun.sendMail({
        to: config.mailgun.inbox,
        from: [req.body.name, ' ', req.body.email].join(''),
        subject: ['Donart Inquiry [ Phone: ', req.body.phone, ' ]'].join(''),
        html: req.body.text,
        files: req.files || undefined
    })
    .then(body => {
        res.sendSuccess(body);
    })
    .catch(err => {
        res.sendSuccess('zle');
    });
}

