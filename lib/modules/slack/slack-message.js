var WebsiteService = require('../../services/website-service');
var UserService    = require('../../services/user-service');
var watchbot       = require('../watchbot/watchbot');
var utils          = require('../../utils/formatting');


/** Conecta con la base de datos para registrar un sitio web */
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
            return callback(err, message);
        } else {
            UserService.add(website.user, function(err) {});
            watchbot.add(website.url, function(err) {
                if (err) {
                    console.log("Error: " + err);
                }
            });
            message = {
                text: msg,
                attachments: [{
                    text: "*" + website.name + "*\n" + website.url,
                    color: "good",
                    mrkdwn_in: ["text"]
                }],
                channel: website.channel,
                link_names: "1"
            };
            callback(null, message);
        }
    });
};


/** Conecta con la base de datos para modificar el intervalo de vigilancia de un sitio web */
var setTimeout = function(website, callback) {
    WebsiteService.setTimeout(website, function(updated, msg) {
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
            watchbot.setTimeout(website.name, function(err) {
                if (err) {
                    console.log("Error: " + err);
                }
            });
            message = {
                response_type: "ephemeral",
                text: msg
            };
            callback(message);
        }
    });
};


/** Conecta con la base de datos para eliminar un sitio web */
var remove = function(website, callback) {
    WebsiteService.remove(website, function(removed, msg) {
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
            return callback(removed, message);
        } else {
            watchbot.remove(website.name, function(err) {
                if (err) {
                    console.log("Error: " + err);
                }
            });
            message = {
                text: msg,
                mrkdwn: true,
                channel: website.channel,
                link_names: "1"
            };
            callback(removed, message);
        }
    });
};


/** Conecta con la base de datos para obtener los sitios web registrados por un usuario */
var list = function(userName, callback) {
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
                    response_type: "ephemeral",
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


/** Conecta con la base de datos para obtener todos los sitios web registrados */
var show = function(channel, callback) {
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
            return callback(false, message);
        } else {
            if (websites.length === 0) {
                message = {
                    response_type: "ephemeral",
                    text: "No se ha registrado ningún sitio web."
                };
                return callback(false, message);
            } else {
                message = {
                    text: "Se han registrado los siguientes sitios web:",
                    attachments: [{
                        text: utils.list(websites, true),
                        color: "0080ff",
                        mrkdwn_in: ["text"]
                    }],
                    channel: channel,
                    link_names: "1"
                };
                callback(true, message);
            }
        }
    });
};


/** Conecta con la base de datos para modificar la hora de envío del informe diario de los sitios web de un usuario */
var setLogTime = function(username, logTime, callback) {
    UserService.setLogTime(username, logTime, function(updated, msg) {
        var message;
        if (!updated) {
            message = {
                response_type: "ephemeral",
                text: "Error al modificar la hora de envío del informe diario de los sitios web.",
                attachments: [{
                    text: msg,
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            //watchbot.restart();
            message = {
                response_type: "ephemeral",
                text: msg
            };
            callback(message);
        }
    });
};


module.exports = {
    add: add,
    setTimeout: setTimeout,
    remove: remove,
    list: list,
    show: show,
    setLogTime: setLogTime
};
