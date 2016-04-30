var config = require('./config');
var model = require('./model');
var moment = require('moment');
var email_interface = require('./email_interface');
var fs = require('fs');

moment.locale('fr');

module.exports = {

    index: function (req, res) {

        if (req.cookies.email == config.values.super_admin_email) {
            req.session.super_admin = true;
            req.session.email = req.cookies.email;
            res.redirect('/dashboard');
        }
        else if (req.cookies.email) {
            req.session.email = req.cookies.email;
            res.redirect('/dashboard/employee');
        }
        else {
            res.render('index');
        }
    },
    login: function (req, res) {

        var email = req.body.email;
        var password = req.body.password;

        if (email == config.values.super_admin_email && password == config.values.super_admin_password) {
            req.session.super_admin = true;
            req.session.email = email;
            res.cookie('email', email, {httpOnly: true});
            res.redirect('/dashboard');
        }
        else {
            model.ModelContainer.EmployeeModel.findOne({email: email, password: password}, function (err, employee) {

                if (employee) {

                    req.session.email = email;
                    res.cookie('email', email, {httpOnly: true});

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
        var filepath = req.files.file.path;
        var planningFileObject = fs.readFileSync(filepath);
        var domain = protocol + '://' + host;
        var uri = domain + '/upload/' + filename;

        var planning = new model.ModelContainer.PlanningModel({
            name: 'Planning téléchargé le ' + moment().format('LLL'),
            filename: filename,
            uri: uri
        });

        planning.save(function (err, planning) {

            res.redirect('/dashboard/planning/sent');

            var downloadLink = domain + '/planning/download/' + planning._id;

            var attachments = [{
                "type": "application/pdf",
                "name": "planning.pdf",
                "content": new Buffer(planningFileObject).toString('base64')
            }];

            //send emails
            model.ModelContainer.EmployeeModel.find(function (err, employees) {

                employees.forEach(function (employee) {

                    var message = 'Bonjour ' + employee.firstname + '.<br><br>Votre planning est arrivé. <a href="' + downloadLink + '">Cliquez ici pour le télécharger</a> ou <a href="' + domain + '">connectez-vous ici</a> pour accéder en ligne à votre planning. (pour rappel, votre mot de passe est: ' + employee.password + ')<br><br>Cordialement,<br><br>La DSI - Librairie La Bourse.<br><br><em>Ce message a été envoyé automatiquement.</em>';

                    email_interface.sendMail(message, message, 'Librairie La Bourse - Votre planning est arrivé', 'info@librairielabourse.com', 'La Bourse', employee.email, attachments, function (response) {
                        console.log(response);
                    });
                });

            });
        });
    },

    planningSent: function (req, res) {

        res.render('planningSent');
    },

    dashboardEmployee: function (req, res) {

        if (req.session.super_admin || !req.session.email) {

            res.redirect('/');
        }
        else {

            model.ModelContainer.EmployeeModel.findOne({email: req.session.email}, function (err, employee) {
                model.ModelContainer.PlanningModel.find().sort([['created_at', 'descending']]).exec(function (err, plannings) {

                    res.render('dashboard_employee.handlebars', {
                        employee: employee,
                        plannings: plannings,
                        is_connected: true
                    });

                });
            });
        }
    },

    logout: function (req, res) {

        req.session.super_admin = null;
        req.session.email = null;

        res.clearCookie('super_admin');
        res.clearCookie('email');

        res.redirect('/');
    },

    downloadPlanning: function (req, res) {

        model.ModelContainer.PlanningModel.findOne({_id: req.params.id}, function (err, planning) {

            var is_connected = false;

            if (req.session.email || req.cookies.email) {
                is_connected = true;
            }

            if (planning) {
                res.render('download', {planning: planning, is_connected: is_connected});
            }
            else {
                res.redirect('/planning/404');
            }

        });

    },

    deletePlanning: function (req, res) {

        model.ModelContainer.PlanningModel.remove({_id: req.params.id}).exec();

        res.redirect('/dashboard');
    },

    planningNotFound: function (req, res) {

        res.render('planning404');
    },

    workingDaySheet: function (req, res) {

        if (req.session.email) {

            model.ModelContainer.EmployeeModel.findOne({email: req.session.email})
                .exec(function (err, employee) {

                    model.ModelContainer.WorkingDaySheetModel.findOne({
                            _id: req.params.id,
                            employee: employee._id
                        })
                        .populate('workingDays')
                        .exec(function (err, workingDaySheet) {

                            console.log(workingDaySheet.workingDays);

                            if (!workingDaySheet) {
                                res.redirect('/dashboard');
                            }
                            else {
                                res.render('workingday_sheet', {
                                    currentSheet: workingDaySheet,
                                    user: employee
                                });
                            }

                        });

                });
        }
        else {
            res.redirect('/');
        }

    },

    addWorkingDaySheet: function (req, res) {

        var month = moment(req.body.month, 'YYYY-MM').toDate();

        model.ModelContainer.EmployeeModel.findOne({email: req.session.email}, function (err, employee) {

            model.ModelContainer.WorkingDaySheetModel.findOne({
                month: month,
                employee: employee._id
            }, function (err, workingDaySheet) {

                if (!workingDaySheet) {

                    var workingDaySheet = model.ModelContainer.WorkingDaySheetModel({
                        month: month,
                        employee: employee._id
                    });

                    workingDaySheet.save(function (err, workingDaySheet) {
                        res.redirect('/workingday/sheet/' + workingDaySheet._id);
                    });
                }
                else {
                    res.redirect('/workingday/sheet/' + workingDaySheet._id);
                }

            });
        });

    },

    addWorkingDay: function (req, res) {

        var startingHourMorning = moment(req.body.startingHourMorning, "hh:mm").toDate(),
            endingHourMorning = moment(req.body.endingHourMorning, "hh:mm").toDate(),
            startingHourAfternoon = moment(req.body.startingHourAfternoon, "hh:mm").toDate(),
            endingHourAfternoon = moment(req.body.endingHourAfternoon, "hh:mm").toDate();

        var totalWorkingHourMorning = moment.duration(moment(endingHourMorning).diff(startingHourMorning)).asHours();
        var totalWorkingHourAfternoon = moment.duration(moment(endingHourAfternoon).diff(startingHourAfternoon)).asHours();

        var totalWorkingHour = totalWorkingHourMorning + totalWorkingHourAfternoon;

        var workingDay = model.ModelContainer.WorkingDayModel({
            date: moment(req.body.day, "YYYY-MM-DD").toDate(),
            startingHourMorning: startingHourMorning,
            endingHourMorning: endingHourMorning,
            startingHourAfternoon: startingHourAfternoon,
            endingHourAfternoon: endingHourAfternoon,
            workingDaySheet: req.body.workingsheet_id,
            totalWorkingHourMorning: totalWorkingHourMorning,
            totalWorkingHourAfternoon: totalWorkingHourAfternoon,
            totalWorkingHour: totalWorkingHour
        });

        workingDay.save(function (err, workingDay) {

            model.ModelContainer.WorkingDaySheetModel.findOne({_id: workingDay.workingDaySheet}, function(err, workingDaySheet) {

                workingDaySheet.workingDays.push(workingDay._id);
                workingDaySheet.save(function() {
                    res.redirect('/workingday/sheet/' + req.body.workingsheet_id);
                });

            });

        });
    }
};