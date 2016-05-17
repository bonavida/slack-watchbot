var WebpageService = require('../services/webpage-service');


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


var remove = function(removeName, callback) {
    WebpageService.remove(removeName, function(removed, msg) {
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
        var strDate = formatDate(date);
        msg += "*" + webpages[i].name + "*" +
               "  " + webpages[i].url + "\n" +
               "Añadido el " + strDate;
        if (isAll) {
            msg += " por el usuario @" + webpages[i].user + "\n";
        } else {
            msg += "\n";
        }
        msg += "Nº de veces caído: " + webpages[i].numIncidencies + "\n";
        if (isLog) {
            if (webpages[i].numIncidencies !== 0) {
                var lastIncidency = new Date(webpages[i].lastIncidency);
                var strLastIncidency = formatDate(lastIncidency);
                msg += "Última vez caído el " + strLastIncidency;
            }
            msg += "Tiempo de respuesta medio: " + webpages[i].averageResponseTime + "\n";
        }
        msg += "\n";
    }
    return msg;
}

/** Método privado que convierte una fecha en una cadena de texto */
function formatDate(date) {
    var dayAdded = formatNumber(date.getDate());
    var monthAdded = formatNumber(date.getMonth() + 1);  // El mes va del 0 al 11
    var yearAdded = date.getFullYear();
    var hourAdded = formatNumber(date.getHours()) + ":" + formatNumber(date.getMinutes());

    var msg = dayAdded + "/" + monthAdded + "/" + yearAdded + " a las " + hourAdded;

    return msg;
}

function formatNumber(number) {
    return ("0" + number).slice(-2);
}

module.exports = {
    add: add,
    remove: remove,
    getAllWebpages: getAllWebpages,
    getWebpages: getWebpages
};
