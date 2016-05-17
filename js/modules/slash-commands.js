var slackMessage   = require('./slack-message');
var cron           = require('./watchbot');


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
                text: "*Estos son los comandos que puedes usar:*\n" +
                      "`/watch add <nombre_sitio> <url_sitio>` Vigila una página web.\n" +
                      "`/watch timeout <nombre_sitio> <intervalo_en_minutos>` Modifica el intervalo de vigilancia de una página web.\n" +
                      "`/watch remove <nombre_sitio>` Deja de vigilar una página web.\n" +
                      "`/watch list` Lista las páginas web registradas por el usuario que introduce el comando.\n" +
                      "`/watch list all` Lista todas las páginas web registradas.",
                mrkdwn: true
            });
            break;

        case "add":
            /** Comprueba si el número de parámetros es correcto */
            if (text.length < 2) {
                res.json({
                    response_type: "ephemeral",
                    text: "Error al añadir la página web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n`/watch add <nombre_sitio> <url_sitio>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
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
                                  "```http://ejemplo.com\nhttp://wwww.ejemplo.com\n" +
                                  "http://ejemplo.com/ejemplo.html?q=ejemplo\nhttps://ejemplo.com```",
                            color: "danger",
                            mrkdwn_in: ["text"]
                        }]
                    });
                } else {

                    var addName = text.join(" "); // Une las cadenas con un espacio en blanco para formar el nombre de la página web

                    /** Encapsula los datos que se quiere guardar */
                    var webpage = {
                        name: addName,
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


        case "timeout":
            if (text.length < 2) {
                res.json({
                    response_type: "ephemeral",
                    text: "Error al modificar el intervalo de vigilancia de una página web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n`/watch timeout <nombre_sitio> <intervalo_en_minutos>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                var timeout = text.pop(); // El intervalo es el último parámetro

                /** Comprueba si el intervalo es un número mayor que 0 a través de una expresión regular */
                if (!timeout.match(/^[1-9]\d*/)) {
                    res.json({
                        response_type: "ephemeral",
                        text: "Error al modificar el intervalo de vigilancia de una página web.",
                        attachments: [{
                            text: "El intervalo (en minutos) ha de ser un número mayor que 0.\n",
                            color: "danger"
                        }]
                    });
                } else {

                    var name = text.join(" "); // Une las cadenas con un espacio en blanco para formar el nombre de la página web

                    /** Modifica el intervalo de la página web en la base de datos y envía el mensaje a Slack */
                    slackMessage.setTimeout(name, timeout, function(msg) {
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
                        text: "Número de parámetros incorrecto.\n`/watch remove <nombre_sitio>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
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

            if (text.length > 1) {  // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error al listar las páginas web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto. Por favor, usa los siguientes comandos:\n" +
                              "`/watch list`\n`/watch list all`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else if (text.length === 0) {  // Lista las páginas web registradas por el usuario que escribe el comando
                var userName = req.body.user_name;

                slackMessage.getWebpages(userName, function(msg) {
                    res.json(msg);
                });
            } else {  // Lista todas las páginas web
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
                                  "`/watch list`\n`/watch list all`",
                            color: "danger",
                            mrkdwn_in: ["text"]
                        }]
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
