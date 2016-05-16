var Webpage        = require('../models/webpage');
var WebpageService = require('../services/webpage-service');
var slackMessage   = require('./slack-message');
var cron           = require('./cron-watch');


/**
 * Método para tratar un comando de Slack
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

                    /** Guarda los datos en la base de datos y envía el mensaje a Slack */
                    slackMessage.add(webpage, function(msg) {
                        res.json(msg);
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

                /** Elimina la página web de la base de datos y envía un mensaje a Slack */
                slackMessage.remove(removeName, function(msg) {
                    res.json(msg);
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
                    slackMessage.getAllWebpages(function(msg) {
                        res.json(msg);
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

                slackMessage.getWebpages(userName, function(msg) {
                    res.json(msg);
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
