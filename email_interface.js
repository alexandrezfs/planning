var config = require('./config');

/**
 * MANDRILL MODULES API IMPORTS
 * @type {exports}
 */
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.values.mandrill_api_key);

exports.sendMail = function (htmlContent, textContent, subject, from_email, from_name, to_email, attachments, callback) {

    var message = {
        "html": htmlContent,
        "text": textContent,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "attachments": attachments,
        "to": [{
            "email": to_email
        }]
    };

    var async = false;

    mandrill_client.messages.send({"message": message, "async": async}, function (result) {

        console.log(result);

        callback(result);

    }, function (e) {
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });

};
