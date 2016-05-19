var WebpageService = require('../../services/webpage-service');
var watchbot       = require('../ping/watchbot');

var add = function(webpage, callback) {
    WebpageService.add(webpage, function(err, msg) {
        var message;
        if (err) {
            message = {
                response_type: "ephemeral",
                text: "Error al añadir la página web.",
                attachments: [{
                    text: msg,
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            watchbot.restart();
            message = {
                response_type: "in_channel",
                text: msg,
                attachments: [{
                    text: webpage.name + "\n" + webpage.url,
                    color: "good"
                }]
            };
            callback(message);
        }
    });
};


var setTimeout = function(name, timeout, callback) {
    WebpageService.setTimeout(name, timeout, function(updated, msg) {
        var message;
        if (!updated) {
            message = {
                response_type: "ephemeral",
                text: "Error al modificar el intervalo de la página web.",
                attachments: [{
                    text: msg,
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            watchbot.restart();
            message = {
                response_type: "in_channel",
                text: msg
            };
            callback(message);
        }
    });
};


var remove = function(removeName, callback) {
    WebpageService.remove(removeName, function(removed, url, msg) {
        var message;
        if (!removed) {
            message = {
                response_type: "ephemeral",
                text: "Error al eliminar la página web.",
                attachments: [{
                    text: msg,
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            watchbot.restart();
            message = {
                response_type: "in_channel",
                text: msg
            };
            callback(message);
        }
    });
};


var getAllWebpages = function(callback) {
    WebpageService.getAllWebpages(function (err, webpages) {
        var message;
        if (err) {
            message = {
                response_type: "ephemeral",
                text: "Error al listar las páginas web.",
                attachments: [{
                    text: "Ha habido un error. Inténtelo de nuevo.",
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            if (webpages.length === 0) {
                message = {
                    response_type: "ephemeral",
                    text: "No se ha registrado ninguna página web."
                };
            } else {
                message = {
                    response_type: "in_channel",
                    text: "Se han registrado las siguientes páginas web:",
                    attachments: [{
                        text: listToString(webpages, true, false),
                        color: "0080ff",
                        mrkdwn_in: ["text"]
                    }]
                };
            }
            callback(message);
        }
    });
};

var getWebpages = function(userName, callback) {
    WebpageService.getWebpages(userName, function(err, webpages) {
        var message;
        if (err) {
            message = {
                response_type: "ephemeral",
                text: "Error al listar las páginas web.",
                attachments: [{
                    text: "Ha habido un error. Inténtelo de nuevo.",
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            if (webpages.length === 0) {
                message = {
                    response_type: "ephemeral",
                    text: "No has registrado ninguna página web."
                };
            } else {
                message = {
                    response_type: "in_channel",
                    text: "Has registrado las siguientes páginas web:",
                    attachments: [{
                        text: listToString(webpages, false, false),
                        color: "0080ff",
                        mrkdwn_in: ["text"]
                    }]
                };
            }
            callback(message);
        }
    });
};

/** Método privado que convierte una lista de páginas web en una cadena de texto
 *  - Si isAll es true, es que se han de mostrar todas las páginas web
 *  - Si isLog es true, es que se han de mostrar más detalles
 */
function listToString(webpages, isAll, isLog) {
    var msg = "";
    for (var i = 0; i < webpages.length; i++) {
        var date = new Date(webpages[i].dateAdded);
        msg += "*" + webpages[i].name + "*" +
               "  " + webpages[i].url + "\n" +
               "Añadido el " + getFormatedDate(date);
        if (isAll) {
            msg += " por el usuario @" + webpages[i].user + "\n";
        } else {
            msg += "\n";
        }
        msg += "Nº de veces caído: " + webpages[i].numIncidencies + "\n";
        if (isLog) {
            if (webpages[i].numIncidencies !== 0) {
                var lastIncidency = new Date(webpages[i].lastIncidency);
                msg += "Última vez caído el " + getFormatedDate(lastIncidency);
            }
            msg += "Tiempo de respuesta medio: " + webpages[i].averageResponseTime + "\n";
        }
        msg += "\n";
    }
    return msg;
}

/** Método privado que convierte una fecha en una cadena de texto */
function getFormatedDate(date) {
    var dayAdded = getFormatedNumber(date.getDate()),
        monthAdded = getFormatedNumber(date.getMonth() + 1),  // El mes va del 0 al 11
        yearAdded = date.getFullYear(),
        hourAdded = getFormatedNumber(date.getHours()) + ":" + getFormatedNumber(date.getMinutes());

    return(dayAdded + "/" + monthAdded + "/" + yearAdded + " a las " + hourAdded);
}

/** Método privado que rellena un número con ceros para que tenga dos dígitos */
function getFormatedNumber(number) {
    return ("0" + number).slice(-2);
}

module.exports = {
    add: add,
    setTimeout: setTimeout,
    remove: remove,
    getAllWebpages: getAllWebpages,
    getWebpages: getWebpages
};
