var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var webpageSchema = new Schema({
    name : String,
    url : { type: String, unique: true },
    dateAdded : Date,
    user : String,
    indicencies : [{
        incidencyDate : Date
    }]
});

/** Cada vez que se crea una nueva webpage
    automáticamente se añadirá la fecha actual */
webpageSchema.pre('save', function(next) {
    var currentDate = new Date();

    this.dateAdded = currentDate;

    if (!this.dateAdded) {
        this.dateAdded = currentDate;
    }

    next();
});

module.exports = mongoose.model('WebPage', webpageSchema);
