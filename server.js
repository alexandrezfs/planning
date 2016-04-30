// Require our dependencies
var express = require('express'),
    exphbs = require('express-handlebars'),
    http = require('http'),
    session = require('express-session'),
    routes = require('./routes'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    multer  = require('multer'),
    cookieParser = require('cookie-parser');



var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        foo: function () { return 'FOO!'; },
        bar: function () { return 'BAR!'; }
    }
});



// Create an express instance and set a port variable
var app = express();
var port = config.values.port;

app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(session({secret: 'token'}));
app.use(bodyParser());
app.use(cookieParser());
app.use(multer({ dest: __dirname + '/public/upload/'}));

// Set handlebars as the templating engine
app.use("/", express.static(__dirname + "/public/"));
app.set('views', __dirname + '/views');
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', routes.index);
app.post('/login', routes.login);
app.get('/dashboard', routes.dashboard);
app.get('/dashboard/employee', routes.dashboardEmployee);
app.get('/dashboard/planning/sent', routes.planningSent);
app.post('/employee/add', routes.addEmployee);
app.get('/employee/delete/:id', routes.deleteEmployee);
app.post('/planning/upload', routes.uploadPlanning);
app.get('/logout', routes.logout);
app.get('/planning/download/:id', routes.downloadPlanning);
app.get('/planning/delete/:id', routes.deletePlanning);
app.get('/planning/404', routes.planningNotFound);
app.get('/workingday/sheet/:id', routes.workingDaySheet);
app.post('/workingday/sheet/add', routes.addWorkingDaySheet);
app.post('/workingday/add', routes.addWorkingDay);


// Fire it up (start our server)
var server = http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});