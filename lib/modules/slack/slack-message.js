var WebsiteService = require('../../services/website-service');
var UserService    = require('../../services/user-service');
var watchbot       = require('../watchbot/watchbot');
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
            return callback(err, message);
        } else {
            UserService.add(website.user, function(err) {});
            watchbot.restart();
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
            watchbot.restart();
            message = {
                response_type: "ephemeral",
                text: msg
            };
            callback(message);
        }
    });
};


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
            watchbot.restart();
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
    getAllWebsites: getAllWebsites,
    getWebsites: getWebsites,
    setLogTime: setLogTime
};
