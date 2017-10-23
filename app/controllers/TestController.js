let functions = require('../libs/functions'),
    errors = require('../libs/response-errors');

exports.test = (req, res, next) => {

    res.sendSuccess(functions.getDomain(req));

    // return res.sendSuccess({foo: 123});
    // throw new errors.DatabaseError();
    // throw new SyntaxError("useful error message");
}
