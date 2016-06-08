var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/** Modela el concepto de sitio web.
 *  Se van a guardar todos los datos que nos interesa mantener sobre un sitio web.
 *      name: Nombre del sitio web
 *      url: URL del sitio web
 *      dateAdded: Fecha en la que se añadió a la base de datos
 *      user: Usuario de Slack que lo añadió
 *      channelName: Nombre del canal de Slack desde el que se añadió el sitio web
 *      channelID: ID del canal de Slack desde el que se añadió el sitio web
 *      timeout: Intervalo (en minutos) para hacer los pings
 *      status: Estado del sitio web ("up" o "down")
 *      averageResponseTime: Tiempo medio de respuesta del sitio web
 *      numPings: Nº de pings realizados al sitio web
 *      numIncidencies: Nº de veces que un sitio web se ha caído
 *      firstCheckedDown: Fecha desde la cual el sitio web lleva caído, si es que está caído
 *      lastCheckedDown: Fecha de la última vez que se ha comprobado que el sitio web está caído
 */
var websiteSchema = new Schema({
    name : { type: String, unique: true },
    url : { type: String, unique: true },
    dateAdded : Date,
    user : String,
    channelName : String,
    channelID : String,
    timeout : { type: Number, default: 15 },
    status: { type: String, default: 'up' },
    averageResponseTime : { type: Number, default: 0 },
    numPings : { type: Number, default: 0 },
    numIncidencies : { type: Number, default: 0 },
    firstCheckedDown: Date,
    lastCheckedDown : Date
});


/** Cada vez que se crea un nuevo sitio automáticamente se añadirá la fecha actual */
websiteSchema.pre('save', function(next) {

    // Si se guarda por primera vez, se añade la fecha
    if (!this.dateAdded) {
        var currentDate = new Date();
        this.dateAdded = currentDate;
    }

    next();
});


module.exports = mongoose.model('Website', websiteSchema);
