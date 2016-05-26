var slackMessage   = require('./slack-message');


/**
 * Método para tratar un comando proveniente de una llamada HTTP Post realizada desde Slack
 */
var post = function(req, res) {
    var text = req.body.text.split(" ");
    var option = text.shift(); // La opción es el primer parámetro

    /** Trata cada opción de una forma determinada */
    switch (option) {

        /***********************************************************************************************************************
           Se pide ayuda desde Slack
         ***********************************************************************************************************************/
        case "help":

            res.json({
                response_type: "ephemeral",
                text: "*Estos son los comandos que puedes usar:*\n" +
                      "`/watch add <nombre_sitio> <url_sitio>` Vigila un sitio web (por defecto, con intervalos de 15 minutos).\n" +
                      "`/watch timeout <nombre_sitio> <intervalo_en_minutos>` Modifica el intervalo de vigilancia de un sitio web.\n" +
                      "`/watch remove <nombre_sitio>` Deja de vigilar un sitio web.\n" +
                      "`/watch list` Lista los sitios web registrados por el usuario que introduce el comando.\n" +
                      "`/watch list all` Lista todos los sitios web registrados.\n" +
                      "`/watch log <hora_envío_informe>` Mofidica la hora del informe diario de los sitios web del usuario (por defecto 00:00).",
                mrkdwn: true
            });

            break;


        /***********************************************************************************************************************
           Se añade un sitio web desde Slack
         ***********************************************************************************************************************/
        case "add":

            if (text.length < 2) {   // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error al añadir el sitio web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n`/watch add <nombre_sitio> <url_sitio>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                var url = text.pop();  // La URL es el último parámetro

                /** Comprueba si la URL de la página web es válida a través de una expresión regular */
                if (!url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)) {
                    res.json({
                        response_type: "ephemeral",
                        text: "Error al añadir el sitio web.",
                        attachments: [{
                            text: "La URL del sitio web ha de tener un formato válido.\n" +
                                  "```http://ejemplo.com\nhttp://wwww.ejemplo.com\n" +
                                  "http://ejemplo.com/ejemplo.html?q=ejemplo\nhttps://ejemplo.com```",
                            color: "danger",
                            mrkdwn_in: ["text"]
                        }]
                    });
                } else {

                    var addName = text.join(" "); // Une las cadenas con un espacio en blanco para formar el nombre del sitio web

                    /** Encapsula los datos que se quiere guardar */
                    var website = {
                        name: addName,
                        url: url,
                        user: req.body.user_name,
                        channel: req.body.channel_name
                    };

                    /** Guarda los datos en la base de datos y envía el mensaje a Slack */
                    slackMessage.add(website, function(msg) {
                        res.json(msg);
                    });
                }
            }

            break;


        /***********************************************************************************************************************
           Se modifica el intervalo de vigilancia de un sitio web desde Slack
         ***********************************************************************************************************************/
        case "timeout":

            if (text.length < 2) {   // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error al modificar el intervalo de vigilancia de un sitio web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n`/watch timeout <nombre_sitio> <intervalo_en_minutos>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                var timeout = text.pop();  // El intervalo es el último parámetro

                /** Comprueba si el intervalo es un número mayor que 0 a través de una expresión regular */
                if (!timeout.match(/^[1-9]\d*/)) {
                    res.json({
                        response_type: "ephemeral",
                        text: "Error al modificar el intervalo de vigilancia de un sitio web.",
                        attachments: [{
                            text: "El intervalo (en minutos) ha de ser un número mayor que 0.\n",
                            color: "danger"
                        }]
                    });
                } else {

                    var name = text.join(" ");  // Une las cadenas con un espacio en blanco para formar el nombre del sitio web

                    /** Modifica el intervalo de vigilancia del sitio web en la base de datos y envía el mensaje a Slack */
                    slackMessage.setTimeout(name, timeout, function(msg) {
                        res.json(msg);
                    });
                }
            }

            break;


        /***********************************************************************************************************************
           Se elimina un sitio web desde Slack
         ***********************************************************************************************************************/
        case "remove":

            if (text.length === 0) {   // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error al eliminar el sitio web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n`/watch remove <nombre_sitio>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                var removeName = text.join(" ");  // Nombre del sitio web a borrar

                /** Elimina el sitio web de la base de datos y envía un mensaje a Slack */
                slackMessage.remove(removeName, function(msg) {
                    res.json(msg);
                });

            }

            break;


        /***********************************************************************************************************************
           Lista sitios web en Slack
         ***********************************************************************************************************************/
        case "list":

            if (text.length > 1) {   // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error al listar los sitios web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto. Por favor, usa los siguientes comandos:\n" +
                              "`/watch list`\n`/watch list all`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else if (text.length === 0) {   // Lista los sitios web registradas por el usuario que escribe el comando
                var userName = req.body.user_name;

                slackMessage.getWebsites(userName, function(msg) {
                    res.json(msg);
                });
            } else {   // Lista todos los sitios web
                if (text[0] === "all") {   // Comando válido
                    slackMessage.getAllWebsites(function(msg) {
                        res.json(msg);
                    });
                } else {   // Comando no válido
                    res.json({
                        response_type: "ephemeral",
                        text: "Error al listar los sitios web",
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


        /***********************************************************************************************************************
           Se modifica la hora de envío del informe diario de los sitios web de un usuario desde Slack
         ***********************************************************************************************************************/
        case "log":

            if (text.length !== 1) {   // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error al modificar la hora de envío del informe diario de los sitios web.",
                    attachments: [{
                        text: "Número de parámetros incorrecto.\n`/watch log <hora_envío_informe>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                var logTime = text.pop();  // La hora de envío del informe diario es el último parámetro

                /** Comprueba si la hora tiene formato HH:mm y que sea válido */
                if (!logTime.match(/^((?:[01]\d|2[0-3]):[0-5]\d$)/)) {
                    res.json({
                        response_type: "ephemeral",
                        text: "Error al modificar la hora de envío del informe diario de los sitios web.",
                        attachments: [{
                            text: "La hora ha de tener el formato HH:mm.\n" +
                                  "HH: 00-23\n" + "mm: 00-59\n",
                            color: "danger"
                        }]
                    });
                } else {

                    /** Modifica el intervalo de vigilancia del sitio web en la base de datos y envía el mensaje a Slack */
                    slackMessage.setLogTime(req.body.user_name, logTime, function(msg) {
                        res.json(msg);
                    });
                }
            }

            break;


        /***********************************************************************************************************************
           Se manda un comando desde Slack con una opción desconocida
         ***********************************************************************************************************************/
        default:

            res.json({
                response_type: "ephemeral",
                text:"Comando no identificado.\nEscribe `/watch help` para más información.",
                mrkdwn: true
            });


    }

};


module.exports = {
    post: post
};
