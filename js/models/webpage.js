var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/** Modela el concepto de página web.
 *      name: Nombre de la página web
 *      url: URL de la página web
 *      dateAdded: Fecha en la que se añadió
 *      user: Usuario de Slack que la añadió
 *      channel: Canal de Slack desde el que se añadió
 *      timeout: Intervalo (en minutos) para hacer los pings
 *      averageResponseTime: Tiempo medio de respuesta de la página web
 *      numPings: Nº de pings realizados a la página web
 *      numIncidencies: Nº de veces que una página web se ha caído
 *      lastIncidency: Fecha de la última vez que el server se ha caído
 */
var webpageSchema = new Schema({
    name : { type: String, unique: true },
    url : { type: String, unique: true },
    dateAdded : Date,
    user : String,
    channel : String,
    timeout : { type: Number, default: 15 },
    averageResponseTime : { type: Number, default: 0 },
    numPings : { type: Number, default: 0 },
    numIncidencies : { type: Number, default: 0 },
    lastIncidency : Date
});


/** Cada vez que se crea una nueva webpage automáticamente se añadirá la fecha actual */
webpageSchema.pre('save', function(next) {
    var currentDate = new Date();

    this.dateAdded = currentDate;

    if (!this.dateAdded) {
        this.dateAdded = currentDate;
    }

    this.incidencies = [];

    next();
});


module.exports = mongoose.model('WebPage', webpageSchema);
