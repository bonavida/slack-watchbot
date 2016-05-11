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
    var option = text.shift();
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
            var url = text.pop();
            var name = text.join(" ");
            var webpage = {
                name: name,
                url: url,
                user: req.body.user_name
            };

            WebpageService.add(webpage, function(err) {
                if (err) {
                    return res.json({
                        response_type: "in_channel",
                        text:"Error al añadir la página web. El nombre o la URL ya están registrados."
                    });
                } else {
                    res.json({
                        response_type: "in_channel",
                        text:"Página web añadida con éxito."
                    });
                }
            });
            break;

        default:
            res.json({
                response_type: "ephemeral",
                text:"Comando no identificado. Escribe /watch help para más información."
            });

    }

    //TODO res.end();

};

module.exports = {
    data: data
};
