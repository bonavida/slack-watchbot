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
            return callback(message);
        } else {
            UserService.add(website.user, function(err) {});
            watchbot.restart();
            message = {
                response_type: "in_channel",
                text: msg,
                attachments: [{
                    text: "*" + website.name + "*\n" + website.url,
                    color: "good",
                    mrkdwn_in: ["text"]
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
                text: msg,
                mrkdwn: true
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


var setLogTime = function(username, logTime, callback) {
    UserService.setLogTime(username, logTime, function(updated, msg) {
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
    getWebsites: getWebsites
};
