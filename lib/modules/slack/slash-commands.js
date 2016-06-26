var slackMessage   = require('./slack-db');
var slack          = require('./slack-sender');


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
            text: "*These are the commands you can use:*\n" +
            "`/watch add <website_name> <website_url>` Start monitoring a website (every 15 minutes by default).\n" +
            "`/watch timeout <website_name> <interval_in_minutes>` Modify the interval a website is checked.\n" +
            "`/watch remove <website_name>` Stop monitoring a website.\n" +
            "`/watch list` Show a list of the websites registered by an user in a private message.\n" +
            "`/watch show` Show a list of the websites registered by all the users.\n" +
            "`/watch log <time_of_the_day>` Modify the time of the daily log sent to the user.",
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
                    text: "Error when adding the website.",
                    attachments: [{
                        text: "Incorrect number of parameters.\n`/watch add <website_name> <website_url>`",
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
                        text: "Error when adding the website.",
                        attachments: [{
                            text: "The website URL format has to be valid.\n" +
                            "```http://example.com\nhttp://wwww.example.com\n" +
                            "http://example.com/example.html?q=example\nhttps://example.com```",
                            color: "danger",
                            mrkdwn_in: ["text"]
                        }]
                    });
                } else {

                    /** Encapsula los datos que se quiere guardar */
                    var website = {
                        name: text.join(" "),  // Une las cadenas con un espacio en blanco para formar el nombre del sitio web
                        url: url,
                        user: req.body.user_name,
                        channelName: req.body.channel_name,
                        channelID: req.body.channel_id
                    };

                    /** Guarda los datos en la base de datos y envía el mensaje a Slack */
                    slackMessage.add(website, function(err, msg) {
                        if (err) {
                            res.json(msg);
                        } else {
                            // Responde en privado
                            res.json({
                                response_type: "ephemeral",
                                text: "The website has been successfully added."
                            });
                            // Responde públicamente
                            slack.send(msg);
                        }
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
                    text: "Error when modifying the interval the website is checked.",
                    attachments: [{
                        text: "Incorrect number of parameters.\n`/watch timeout <website_name> <interval_in_minutes>`",
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
                        text: "Error when modifying the interval the website is checked.",
                        attachments: [{
                            text: "The interval (in minutes) has to be greater than zero.\n",
                            color: "danger"
                        }]
                    });
                } else {

                    var timeoutWebsite = {
                        name: text.join(" "),  // Une las cadenas con un espacio en blanco para formar el nombre del sitio web
                        timeout: timeout,
                        user: req.body.user_name
                    };

                    /** Modifica el intervalo de vigilancia del sitio web en la base de datos y envía el mensaje a Slack */
                    slackMessage.setTimeout(timeoutWebsite, function(msg) {
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
                    text: "Error when removing a website.",
                    attachments: [{
                        text: "Incorrect number of parameters.\n`/watch remove <website_name>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                var removeWebsite = {
                    name: text.join(" "),  // Nombre del sitio web a borrar
                    user: req.body.user_name,
                    channelName: req.body.channel_name,
                    channelID: req.body.channel_id
                };

                /** Elimina el sitio web de la base de datos y envía un mensaje a Slack */
                slackMessage.remove(removeWebsite, function(removed, msg) {
                    if (!removed) {
                        res.json(msg);
                    } else {
                        // Responde en privado
                        res.json({
                            response_type: "ephemeral",
                            text: "The website has been succesfully removed."
                        });
                        // Responde públicamente
                        slack.send(msg);
                    }
                });
            }

            break;


        /***********************************************************************************************************************
           Lista, de forma privada en Slack, sólo los sitios web registrados por el usuario que escribe el comando
         ***********************************************************************************************************************/
        case "list":

            if (text.length !== 0) {   // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error when showing the list of websites.",
                    attachments: [{
                        text: "Incorrect number of parameters. Please, use the next command:\n" +
                        "`/watch list`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                var userName = req.body.user_name;

                /** Obtiene los sitios web registrados por un usuario y los muestra en privado en Slack */
                slackMessage.list(userName, function(msg) {
                    res.json(msg);
                });
            }

            break;


        /***********************************************************************************************************************
           Lista, de forma pública en Slack, todos los sitios web registrados
         ***********************************************************************************************************************/
        case "show":

            if (text.length !== 0) {   // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error when showing the list of websites.",
                    attachments: [{
                        text: "Incorrect number of parameters. Please, use the next command:\n" +
                        "`/watch show`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                /** Obtiene todos los sitios web registrados y los muestra públicamente en Slack */
                slackMessage.show(req.body.channel_id, function(hasList, msg) {
                    if (!hasList) {
                        res.json(msg);
                    } else {
                        slack.send(msg);
                        res.end();
                    }
                });
            }

            break;



        /***********************************************************************************************************************
           Se modifica la hora de envío del informe diario de los sitios web de un usuario desde Slack
         ***********************************************************************************************************************/
        case "log":

            if (text.length !== 1) {   // Comprueba si el número de parámetros es correcto
                res.json({
                    response_type: "ephemeral",
                    text: "Error when modifying the time of the daily log sent to the user.",
                    attachments: [{
                        text: "Incorrect number of parameters.\n`/watch log <time_of_the_day>`",
                        color: "danger",
                        mrkdwn_in: ["text"]
                    }]
                });
            } else {

                var logTime = text.pop();  // La hora de envío del informe diario es el último (y único) parámetro

                /** Comprueba que la hora tenga formato HH:mm y que sea válida */
                if (!logTime.match(/^((?:[01]\d|2[0-3]):[0-5]\d$)/)) {
                    res.json({
                        response_type: "ephemeral",
                        text: "Error when modifying the time of the daily log sent to the user.",
                        attachments: [{
                            text: "The time format has to be HH:mm.\n" +
                            "HH: 00-23\n" + "mm: 00-59\n",
                            color: "danger"
                        }]
                    });
                } else {

                    /** Modifica la hora de envío del informe diario de un usuario */
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
                text:"Command not found.\nTry `/watch help` for more information.",
                mrkdwn: true
            });


    }

};


module.exports = {
    post: post
};
