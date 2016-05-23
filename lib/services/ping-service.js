var Website = require('../models/website');


/**
 * Método que registra un ping, además de añadir el tiempo de respuesta a la media
 */
var setPing = function(url, responseTime, callback) {
    Website.findOne({url: url}, function(err, website) {
        if (err) {
            return callback(err);
        }
        if (!website.status || website.status === "down") {
            website.status = "up";
        }
        var totalResponseTime, newAverageResponseTime;
        if (website.numPings > 0) {
            totalResponseTime = website.averageResponseTime * website.numPings;
            newAverageResponseTime = (totalResponseTime + responseTime) / (website.numPings + 1);
        } else {
            totalResponseTime = 0;
            newAverageResponseTime = responseTime;
        }
        website.numPings += 1;
        website.averageResponseTime = Math.round(newAverageResponseTime * 100) / 100;
        website.save(function(err) {  // Actualiza el objeto
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
};


/**
 * Método que registra una incidencia, además de actualizar la fecha a la actual
 */
var setIncidency = function(url, callback) {
    Website.findOne({url: url}, function(err, website) {
        if (err) {
            return callback(err);
        }
        if (!website.status || website.status === "up") {  // Mira si hay que registrar la incidencia
            website.status = "down";
            website.numIncidencies += 1;
        }
        website.lastCheckedDown = new Date();
        website.save(function(err) {  // Actualiza el objeto
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
};


module.exports = {
    setPing: setPing,
    setIncidency: setIncidency
};
