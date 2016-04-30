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

var WorkingDaySheet = new Schema({
    month: Date,
    employee: {type: Schema.Types.ObjectId, ref: 'Employee'},
    workingDays: [{type: Schema.Types.ObjectId, ref: 'WorkingDay'}],
    totalWorkingHour: Number,
    validatedByUser: {type: Boolean, default: false},
    validatedByBusiness: {type: Boolean, default: false},
    signatureBase64: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var WorkingDay = new Schema({
    date: Date,
    startingHourMorning: Date,
    endingHourMorning: Date,
    startingHourAfternoon: Date,
    endingHourAfternoon: Date,
    workingDaySheet: {type: Schema.Types.ObjectId, ref: 'WorkingDaySheet'},
    totalWorkingHour: Number
});

exports.ModelContainer = {
    EmployeeModel: mongoose.model('Employee', EmployeeSchema),
    PlanningModel: mongoose.model('Planning', PlanningSchema),
    WorkingDaySheetModel: mongoose.model('WorkingDaySheet', WorkingDaySheet),
    WorkingDayModel: mongoose.model('WorkingDay', WorkingDay)
};