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
                    WebpageService.add(webpage, function(err) {
                        if (err) {
                            return res.json({
                                response_type: "ephemeral",
                                text: "Error al añadir la página web.",
                                attachments: [{
                                    text: "El nombre o la URL ya están registrados.",
                                    color: "danger"
                                }]
                            });
                        } else {
                            res.json({
                                response_type: "in_channel",
                                text:"Página web añadida con éxito.",
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

        default:
            res.json({
                response_type: "ephemeral",
                text:"Comando no identificado.\nEscribe /watch help para más información."
            });

    }

    //TODO res.end();

};

module.exports = {
    data: data
};
