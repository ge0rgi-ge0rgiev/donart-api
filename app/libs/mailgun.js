config = require('../../config');

exports.sendMail = (params) => {
    const Mailgun = require('mailgun-js'),
    fs = require('fs'),
    path = require('path'),
    mailgun = new Mailgun({
        apiKey: config.mailgun.apiKey,
        domain: config.mailgun.domain
    });

    let data = {
        // from: ['Donart - Order details ', ' ', 'orders@donart.com'].join(''),
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.html
    }

    if (params.cc) data.cc = params.cc;

    let attachments = [];
    if (params.files) {
        for (var i in params.files) {
            let f = params.files[i];
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
        data.attachment = attachments.map(attachment => new Mailgun.Attachment(attachment))
    }
    
    return new Promise((resolve, reject) => {
        mailgun.messages().send(data, function (err, body) {
            if (err) return reject(err);
            return resolve(body);
        });
    });
}