var WebsiteService = require('../../services/website-service');
var UserService    = require('../../services/user-service');
var watchbot       = require('../watchbot/watchbot');
var cron           = require('../watchbot/cron');
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
            UserService.createOrUpdate(website.user, function(err, user) {
                if (err) {
                    console.log("Error: " + err);
                } else if (user.numWebsites === 1) {
                    cron.add(user);
                }
            });
            watchbot.add(website);
            message = {
                text: msg,
                attachments: [{
                    text: "*" + website.name + "*\n" + website.url,
                    color: "good",
                    mrkdwn_in: ["text"]
                }],
                channel: website.channelID,
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
    WebsiteService.remove(website, function(resp) {
        var message;
        if (!resp.removed) {
            message = {
                response_type: "ephemeral",
                text: "Error al eliminar el sitio web.",
                attachments: [{
                    text: resp.msg,
                    color: "danger"
                }]
            };
            return callback(resp.removed, message);
        } else {
            watchbot.remove(website.name, true);
            UserService.removeWebsite(website.user, function(err, removeCron) {
                if (err) {
                    console.log("Error: " + err);
                } else if (removeCron) {
                    cron.remove(website.user);
                }
            });
            message = {
                text: resp.msg,
                mrkdwn: true,
                channel: website.channelID,
                link_names: "1"
            };
            callback(resp.removed, message);
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
            watchbot.print();
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
            cron.setLogTime(username, function(err) {
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


module.exports = {
    add: add,
    setTimeout: setTimeout,
    remove: remove,
    list: list,
    show: show,
    setLogTime: setLogTime
};
