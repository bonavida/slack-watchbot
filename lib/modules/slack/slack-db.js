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
                text: "Error when adding the website.",
                attachments: [{
                    text: msg,
                    color: "danger"
                }]
            };
            return callback(err, message);
        } else {
            watchbot.add(website);
            UserService.createOrUpdate(website.user, function(err, user) {
                if (err) {
                    console.log("Error: " + err);
                } else if (user.numWebsites === 1) {
                    cron.add(user);
                }
            });
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
                text: "Error when modifying the interval the website is checked.",
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
                text: "Error when removing a website.",
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
                text: "Error when showing the list of websites.",
                attachments: [{
                    text: "An error occurred. Try again.",
                    color: "danger"
                }]
            };
            return callback(message);
        } else {
            if (websites.length === 0) {
                message = {
                    response_type: "ephemeral",
                    text: "You haven't registered any website yet."
                };
            } else {
                message = {
                    response_type: "ephemeral",
                    text: "You have registered the following websites:",
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
var show = function(channelID, callback) {
    WebsiteService.getAllWebsites(function (err, websites) {
        var message;
        if (err) {
            message = {
                response_type: "ephemeral",
                text: "Error when showing the list of websites.",
                attachments: [{
                    text: "An error occurred. Try again.",
                    color: "danger"
                }]
            };
            return callback(false, message);
        } else {
            if (websites.length === 0) {
                message = {
                    response_type: "ephemeral",
                    text: "There isn't any website registered yet."
                };
                return callback(false, message);
            } else {
                message = {
                    text: "Has been registered the following websites:",
                    attachments: [{
                        text: utils.list(websites, true),
                        color: "0080ff",
                        mrkdwn_in: ["text"]
                    }],
                    channel: channelID,
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
                text: "Error when modifying the time of the daily log sent to the user.",
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
