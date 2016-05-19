var Webpage = require('../models/webpage');


/**
 * Método que registra un ping, además de añadir el tiempo de respuesta a la media
 */
var setPing = function(url, responseTime, callback) {
    Webpage.findOne({url: url}, function(err, webpage) {
        if (!webpage) {  // Si no lo ha encontrado
            return callback(false, "La página web con url " + url + " no está registrada.");
        }
        var totalResponseTime;
        var newAverageResponseTime;
        if (webpage.numPings > 0) {
            totalResponseTime = webpage.averageResponseTime * webpage.numPings;
            newAverageResponseTime = (totalResponseTime + responseTime) / (webpage.numPings + 1);
        } else {
            totalResponseTime = 0;
            newAverageResponseTime = responseTime;
        }
        webpage.numPings += 1;
        webpage.averageResponseTime = Math.round(newAverageResponseTime * 100) / 100;
        webpage.save(function(err) {  // Si lo ha encontrado, actualiza el objeto
            if (err) {
                return callback(false, "Ha habido un error. Inténtelo de nuevo.");
            }
            callback(true, "Ping guardado con éxito.");
        });
    });
};


/**
 * Método que registra una incidencia, además de actualizar la fecha a la actual
 */
var setIncidency = function(url, callback) {
    Webpage.findOne({url: url}, function(err, webpage) {
        if (!webpage) {  // Si no lo ha encontrado
            return callback(false, "La página web con url " + url + " no está registrada.");
        }
        webpage.numIncidencies += 1;
        webpage.lastIncidency = new Date();
        webpage.save(function(err) {  // Si lo ha encontrado, actualiza el objeto
            if (err) {
                return callback(false, "Ha habido un error. Inténtelo de nuevo.");
            }
            callback(true, "Incidencia guardada con éxito.");
        });
    });
};


module.exports = {
    setPing: setPing,
    setIncidency: setIncidency
};
