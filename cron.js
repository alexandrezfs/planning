var CronJob = require('cron').CronJob,
    email_interface = require('./email_interface'),
    model = require('./model'),
    fs = require('fs'),
    config = require('./config');

exports.startJobs = function () {

    var job = new CronJob({
        cronTime: '* * * 25 * *',
        onTick: function () {

            var fileObject = fs.readFileSync(__dirname + '/public/ressources/grille-heures.pdf');

            var attachments = [{
                "type": "application/pdf",
                "name": "planning.pdf",
                "data": new Buffer(fileObject).toString('base64')
            }];

            model.ModelContainer.EmployeeModel.find(function (err, employees) {

                employees.forEach(function (employee) {

                    var message = 'Bonjour ' + employee.firstname + '.<br><br>La fin du mois approche et vous devez remplir votre grille d\'heures que vous trouverez en pièce jointe.<br><br>Si vous avez besoin de vos heures du mois, <a href="' + config.values.main_url + '">connectez-vous ici</a> pour accéder en ligne à vos plannings. (pour rappel, votre mot de passe est: ' + employee.password + ')<br><br>Cordialement,<br><br>La DSI - Librairie La Bourse.<br><br><em>Ce message a été envoyé automatiquement.</em>';

                    email_interface.sendMail(message, message, 'Librairie La Bourse - Votre grille d\'heures est à remplir', 'info@librairielabourse.com', 'La Bourse', employee.email, attachments, function (response) {
                        console.log(response);
                    });
                });
            });
        },
        start: false,
        timeZone: 'Europe/Paris'
    });

    job.start();

};