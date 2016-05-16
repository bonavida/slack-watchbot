var Webpage        = require('../models/webpage');
var WebpageService = require('../services/webpage-service');
var cron           = require('./cron-watch');


/**
 * Método para informar en el canal de Slack, ya sea para ofrecer ayuda
 * o listar todas las páginas web registradas en la aplicación
 */
var info = function(req, res, next) {
    Webpage.find(function(err, webpages) {
        if (!err) {
            if (!webpages) {
                next();
            } else {
                res.json(webpages);
            }
        } else {
            res.send(500, err.message);
        }
    });
};

/**
 * Método para crear o eliminar una página web en la aplicación desde Slack
 */
var data = function(req, res) {
    var text = req.body.text.split(" ");
    var option = text.shift(); // La opción es el primer parámetro

    // if (req.body.text === "start") {
    //     cron.start();
    // }
    //
    // if (req.body.text === "stop") {
    //     cron.stop();
    // }

    var message = {
        response_type: "ephemeral",
        text: "",
        attachments: []
    };

    switch (option) {

        case "help":
            res.json({
                response_type: "ephemeral",
                text:"Esto es una línea.\nY ésta es otra."
            });
            break;

        case "add":
            /** Comprueba si el número de parámetros es correcto */
            if (text.length < 2) {
                res.json({
                    response_type: "ephemeral",
                    text: "Error al añadir la página web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n/watch add <nombre> <url>",
                        color: "danger"
                    }]
                });
            } else {

                var url = text.pop(); // La URL es el último parámetro

                /** Comprueba si la URL de la página web es válida a través de una expresión regular */
                if (!url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)) {
                    res.json({
                        response_type: "ephemeral",
                        text: "Error al añadir la página web.",
                        attachments: [{
                            text: "La URL de la página web ha de tener un formato válido.\n" +
                                  "http://ejemplo.com\nhttp://wwww.ejemplo.com\n" +
                                  "http://ejemplo.com/ejemplo.html?q=ejemplo\nhttps://ejemplo.com",
                            color: "danger"
                        }]
                    });
                } else {

                    var name = text.join(" "); // Une las cadenas con un espacio en blanco para formar el nombre de la página web

                    /** Encapsula los datos que se quiere guardar */
                    var webpage = {
                        name: name,
                        url: url,
                        user: req.body.user_name,
                        channel: req.body.channel_name
                    };
                    /** Guarda los datos en la base de datos */
                    WebpageService.add(webpage, function(err, msg) {
                        if (err) {
                            return res.json({
                                response_type: "ephemeral",
                                text: "Error al añadir la página web.",
                                attachments: [{
                                    text: msg,
                                    color: "danger"
                                }]
                            });
                        } else {
                            res.json({
                                response_type: "in_channel",
                                text: msg,
                                attachments: [{
                                    text: webpage.name + "\n" + webpage.url,
                                    color: "good"
                                }]
                            });
                        }
                    });
                }
            }

            break;

        case "remove":
            /** Comprueba si el número de parámetros es correcto */
            if (text.length === 0) {
                res.json({
                    response_type: "ephemeral",
                    text: "Error al eliminar la página web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n/watch remove <nombre>",
                        color: "danger"
                    }]
                });
            } else {

                var removeName = text.join(" "); // Nombre de la página web a borrar

                /** Elimina la página web de la base de datos */
                WebpageService.remove(removeName, function(removed, msg) {
                    if (!removed) {
                        return res.json({
                            response_type: "ephemeral",
                            text: "Error al eliminar la página web.",
                            attachments: [{
                                text: msg,
                                color: "danger"
                            }]
                        });
                    } else {
                        res.json({
                            response_type: "in_channel",
                            text: msg
                        });
                    }
                });
            }

            break;

        case "list":

            if (text.length > 2) {  // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error al listar las páginas web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n/watch list\n/watch list all",
                        color: "danger"
                    }]
                });
            } else if (text.length === 1) {  // Lista todas las páginas web
                if (text[0] === "all") {  // Comando válido
                    WebpageService.getAllWebpages(function (err, webpages) {
                        if (err) {
                            return res.json({
                                response_type: "ephemeral",
                                text: "Error al listar las páginas web.",
                                attachments: [{
                                    text: "Ha habido un error. Inténtelo de nuevo.",
                                    color: "danger"
                                }]
                            });
                        } else {
                            if (webpages.length === 0) {
                                return res.json({
                                    response_type: "ephemeral",
                                    text: "No se ha registrado ninguna página web."
                                });
                            } else {
                                res.json({
                                    response_type: "in_channel",
                                    text: "Se han registrado las siguientes páginas web:",
                                    attachments: [{
                                        text: listToString(webpages, true, false),
                                        color: "0080ff",
                                        mrkdwn_in: ["text"]
                                    }]
                                });
                            }
                        }
                    });
                } else {  // Comando no válido
                    res.json({
                        response_type: "ephemeral",
                        text: "Error al listar las páginas web.",
                        attachments: [{
                            text: "Comando no identificado. Por favor, usa los siguientes comandos:\n" +
                                  "/watch list\n/watch list all",
                            color: "danger"
                        }]
                    });
                }

            } else {  // Lista las páginas web registradas por el usuario que escribe el comando

                var userName = req.body.user_name;

                WebpageService.getWebpages(userName, function(err, webpages) {
                    if (err) {
                        return res.json({
                            response_type: "ephemeral",
                            text: "Error al listar las páginas web.",
                            attachments: [{
                                text: "Ha habido un error. Inténtelo de nuevo.",
                                color: "danger"
                            }]
                        });
                    } else {
                        if (webpages.length === 0) {
                            return res.json({
                                response_type: "ephemeral",
                                text: "No has registrado ninguna página web."
                            });
                        } else {
                            res.json({
                                response_type: "in_channel",
                                text: "El usuario @" + userName + " ha registrado las siguientes páginas web:",
                                attachments: [{
                                    text: listToString(webpages, false, false),
                                    color: "0080ff",
                                    mrkdwn_in: ["text"]
                                }]
                            });
                        }
                    }
                });
            }

            break;

        default:
            res.json({
                response_type: "ephemeral",
                text:"Comando no identificado.\nEscribe /watch help para más información."
            });

    }

    //TODO res.end();

};


/** Método privado que convierte una lista de páginas web en una cadena de texto
 *  - Si isAll es true, es que se han de mostrar todas las páginas web
 *  - Si isLog es true, es que se han de mostrar más detalles
 */
function listToString(webpages, isAll, isLog) {
    var msg = "";
    for (var i = 0; i < webpages.length; i++) {
        var date = new Date(webpages[i].dateAdded);
        var strDate = formattedDate(date);
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
                var strLastIncidency = formattedDate(lastIncidency);
                msg += "Última vez caído el " + strLastIncidency;
            }
            msg += "Tiempo de respuesta medio: " + webpages[i].averageResponseTime + "\n";
        }
        msg += "\n";
    }
    return msg;
}

/** Método privado que convierte una fecha en una cadena de texto */
function formattedDate(date) {
    var dayAdded = date.getDate();
    var monthAdded = date.getMonth() + 1;  // El mes va del 0 al 11
    var yearAdded = date.getFullYear();
    var hourAdded = date.getHours() + ":" + date.getMinutes();

    var msg = dayAdded + "/" + monthAdded + "/" + yearAdded + " a las " + hourAdded;

    return msg;
}

module.exports = {
    data: data
};
