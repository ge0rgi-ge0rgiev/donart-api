const EmailTemplates = require('email-templates'),
    config = require('../../config');

exports.getTemplate = (template, data) => {
    return new EmailTemplates().render(template, data);
}