var config = require('./config');
var model = require('./model');
var moment = require('moment');
var email_interface = require('./email_interface');

moment.locale('fr');

module.exports = {

    index: function (req, res) {
        res.render('index');
    },
    login: function (req, res) {

        var email = req.body.email;
        var password = req.body.password;

        if (email == config.values.super_admin_email && password == config.values.super_admin_password) {
            req.session.super_admin = true;
            req.session.email = email;
            res.redirect('/dashboard');
        }
        else {
            model.ModelContainer.EmployeeModel.findOne({email: email, password: password}, function (err, employee) {

                req.session.email = email;

                if (employee) {
                    res.redirect('/dashboard/employee');
                }
                else {
                    res.redirect('/');
                }
            });
        }
    },
    dashboard: function (req, res) {

        if (!req.session.super_admin) {
            res.redirect('/');
        }
        else {

            model.ModelContainer.EmployeeModel.find({}, function (err, employees) {

                model.ModelContainer.PlanningModel.find({}, function (err, plannings) {

                    res.render('dashboard', {
                        employees: employees,
                        plannings: plannings,
                        is_connected: true
                    });
                });
            });
        }
    },

    addEmployee: function (req, res) {

        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;

        //TODO: Auto generate password
        var password = 'bourse';

        var employee = model.ModelContainer.EmployeeModel({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password
        });

        employee.save(function (err, employee) {
            res.redirect('/dashboard');
        });
    },

    deleteEmployee: function (req, res) {

        model.ModelContainer.EmployeeModel.remove({_id: req.params.id}).exec();

        res.redirect('/dashboard');
    },

    uploadPlanning: function (req, res) {

        console.log(req.files);

        var host = req.get('host');
        var protocol = req.protocol;
        var filename = req.files.file.name;
        var domain = protocol + '://' + host;
        var uri = domain + '/upload/' + filename;

        var planning = new model.ModelContainer.PlanningModel({
            name: 'Planning téléchargé le ' + moment().format('LLL'),
            filename: filename,
            uri: uri
        });

        planning.save(function (err, planning) {

            res.redirect('/dashboard/planning/sent');

            //send emails
            model.ModelContainer.EmployeeModel.find(function (err, employees) {

                employees.forEach(function (employee) {

                    var message = 'Bonjour ' + employee.firstname + '.<br><br>Votre planning est arrivé. <a href="' + uri + '">Cliquez ici pour le télécharger</a> ou <a href="' + domain + '">connectez-vous ici</a> pour accéder en ligne à votre planning. (pour rappel, votre mot de passe est: ' + employee.password + ')<br><br>Cordialement,<br><br>La DSI - Librairie La Bourse.';

                    email_interface.sendMail(message, message, 'Librairie La Bourse - Votre planning est arrivé', 'info@librairielabourse.com', 'La Bourse', employee.email, function (response) {
                        console.log(response);
                    });
                });

            });
        });
    },

    planningSent: function(req, res) {

        res.render('planningSent');
    },

    dashboardEmployee: function (req, res) {

        if (req.session.super_admin || !req.session.email) {

            res.redirect('/');
        }
        else {

            model.ModelContainer.EmployeeModel.find({email: req.session.email}, function (err, employee) {
                model.ModelContainer.PlanningModel.find().sort([['created_at', 'descending']]).exec(function (err, plannings) {

                    res.render('dashboard_employee.handlebars', {employee: employee, plannings: plannings, is_connected: true});

                });
            });
        }
    },

    logout: function(req, res) {

        req.session.super_admin = null;
        req.session.email = null;

        res.redirect('/');
    }
};