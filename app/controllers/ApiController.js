let functions = require('../libs/functions'),
    errors = require('../libs/response-errors');

exports.notFound = (req, res, next) => {
    throw new errors.NotFound('404 Not Found. The requested resource - http://' + req.host + req.originalUrl + ' is not implemented.');
}
