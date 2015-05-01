var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * MONGOOSE DRIVER CONNECTION
 */
mongoose.connect(config.values.mongodb_addr, function (err) {
    if (err) {
        throw err;
    }
    console.log("connected to mongoDB");
});

var EmployeeSchema = new Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    last_login: {type: Date, default: Date.now},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var PlanningSchema = new Schema({
    name: String,
    filename: String,
    uri: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

exports.ModelContainer = {
    EmployeeModel: mongoose.model('Employee', EmployeeSchema),
    PlanningModel: mongoose.model('Planning', PlanningSchema)
};