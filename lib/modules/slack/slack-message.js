var WebsiteService = require('../../services/website-service');
var watchbot       = require('../ping/watchbot');
var utils          = require('../../utils/formatting');

var add = function(website, callback) {
    WebsiteService.add(website, function(err, msg) {
        var message;
        if (err) {
            message = {
                response_type: "ephemeral",
                text: "Error al añadir el sitio web.",
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
                    text: website.name + "\n" + website.url,
                    color: "good"
                }]
            };
            callback(message);
        }
    });
};


var setTimeout = function(name, timeout, callback) {
    WebsiteService.setTimeout(name, timeout, function(updated, msg) {
        var message;
        if (!updated) {
            message = {
                response_type: "ephemeral",
                text: "Error al modificar el intervalo de vigilancia del sitio web.",
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
    WebsiteService.remove(removeName, function(removed, msg) {
        var message;
        if (!removed) {
            message = {
                response_type: "ephemeral",
                text: "Error al eliminar el sitio web.",
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


var getAllWebsites = function(callback) {
    WebsiteService.getAllWebsites(function (err, websites) {
        var message;
        if (err) {
            message = {
                response_type: "ephemeral",
                text: "Error al listar los sitios web.",
                attachments: [{
                    text: "Ha habido un error. Inténtelo de nuevo.",
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            if (websites.length === 0) {
                message = {
                    response_type: "ephemeral",
                    text: "No se ha registrado ningún sitio web."
                };
            } else {
                message = {
                    response_type: "in_channel",
                    text: "Se han registrado los siguientes sitios web:",
                    attachments: [{
                        text: utils.list(websites, true),
                        color: "0080ff",
                        mrkdwn_in: ["text"]
                    }]
                };
            }
            callback(message);
        }
    });
};

var getWebsites = function(userName, callback) {
    WebsiteService.getWebsites(userName, function(err, websites) {
        var message;
        if (err) {
            message = {
                response_type: "ephemeral",
                text: "Error al listar los sitios web.",
                attachments: [{
                    text: "Ha habido un error. Inténtelo de nuevo.",
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            if (websites.length === 0) {
                message = {
                    response_type: "ephemeral",
                    text: "No has registrado ningún sitio web."
                };
            } else {
                message = {
                    response_type: "in_channel",
                    text: "Has registrado los siguientes sitios web:",
                    attachments: [{
                        text: utils.list(websites, false),
                        color: "0080ff",
                        mrkdwn_in: ["text"]
                    }]
                };
            }
            callback(message);
        }
    });
};

/** Método privado que convierte una lista de sitios web en una cadena de texto
 *  - Si isAll es true, es que se han de mostrar todos los sitios web
 *  - Si isLog es true, es que se han de mostrar más detalles
 */
function listToString(websites, isAll, isLog) {
    var msg = "";
    for (var i = 0; i < websites.length; i++) {
        var date = new Date(websites[i].dateAdded);
        msg += "*" + websites[i].name + "*" +
               "  " + websites[i].url + "\n" +
               "Añadido el " + getFormatedDate(date);
        if (isAll) {
            msg += " por el usuario @" + websites[i].user + "\n";
        } else {
            msg += "\n";
        }
        msg += "Nº de veces caído: " + websites[i].numIncidencies + "\n";
        if (isLog) {
            if (websites[i].numIncidencies !== 0) {
                var lastCheckedDown = new Date(websites[i].lastCheckedDown);
                msg += "Última vez caído el " + getFormatedDate(lastCheckedDown);
            }
            msg += "Tiempo de respuesta medio: " + websites[i].averageResponseTime + "\n";
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
    getAllWebsites: getAllWebsites,
    getWebsites: getWebsites
};
