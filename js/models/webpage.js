var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/** Modela el concepto de página web.
 *      name: Nombre de la página web
 *      url: URL de la página web
 *      dateAdded: Fecha en la que se añadió
 *      user: Usuario de Slack que la añadió
 *      incidencies: Nº de incidencias (veces que una página web se ha caído) con sus respectivas fechas
 */
var webpageSchema = new Schema({
    name : { type: String, unique: true },
    url : { type: String, unique: true },
    dateAdded : Date,
    user : String,
    channel: String,
    incidencies : [{
        incidencyDate : Date
    }]
});

/** Cada vez que se crea una nueva webpage automáticamente se añadirá la fecha actual */
webpageSchema.pre('save', function(next) {
    var currentDate = new Date();

    this.dateAdded = currentDate;

    if (!this.dateAdded) {
        this.dateAdded = currentDate;
    }

    next();
});

module.exports = mongoose.model('WebPage', webpageSchema);
