var config = require('./config');

/**
 * MANDRILL MODULES API IMPORTS
 * @type {exports}
 */
var mandrill = require('mandrill-api/mandrill');
var SparkPost = require('sparkpost');

exports.sendMail = function (htmlContent, textContent, subject, from_email, from_name, to_email, attachments, callback) {

    var sp = new SparkPost(config.values.sparkpost_api_key);

    sp.transmissions.send({
        transmissionBody: {
            content: {
                from: from_email,
                subject: subject,
                html: htmlContent,
                text: textContent,
                attachments: attachments
            },
            recipients: [
                {address: to_email}
            ]
        }
    }, function(err, res) {
        if (err) {
            console.log('Sparkpost : Whoops! Something went wrong');
            console.log(err);
        } else {
            console.log('Sparkpost : Woohoo! You just sent your mail!');
            callback(res);
        }
    });

};
