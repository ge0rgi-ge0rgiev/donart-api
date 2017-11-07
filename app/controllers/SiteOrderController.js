const config = require('../../config'),
    functions = require('../libs/functions'),
    errors = require('../libs/response-errors'),
    SiteOrderModel = require('../models/SiteOrderModel');


exports.createOrder = (req, res, next) => {
    SiteOrderModel.createOrder(req.body)
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
    const Mailgun = require('mailgun-js'),
        fs = require('fs'),
        path = require('path'),
        mailgun = new Mailgun({
            apiKey: config.mailgun.apiKey,
            domain: config.mailgun.domain
        });

    let data = {
        from: [req.body.name, ' ', req.body.email].join(''),
        to: config.mailgun.inbox,
        subject: ['Donart Inquiry [ Phone: ', req.body.phone, ' ]'].join(''),
        html: req.body.text
    }

    let attachments = [];
    if (req.files) {
        for (var i in req.files) {
            let f = req.files[i];
            let movedFile = path.join(f.destination, f.originalname);
            fs.renameSync(f.path, movedFile);
            attachments.push({
                data: fs.readFileSync(movedFile),
                filename: f.originalname
            });
            fs.unlinkSync(movedFile);
        }
    }

    if (attachments.length > 0) {
        data.attachment = attachments.map(attachment => new mailgun.Attachment(attachment))
    }

    mailgun.messages().send(data, function (err, body) {
        if (err)
            return next(err);
        res.sendSuccess(body);
    });
}

