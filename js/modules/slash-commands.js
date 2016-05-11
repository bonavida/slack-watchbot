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
    // if (req.body.text === "start") {
    //     cron.start();
    // }
    //
    // if (req.body.text === "stop") {
    //     cron.stop();
    // }

    switch (text[0]) {

        case "help":
            res.json({
                response_type: "ephemeral",
                text:"Esto es una línea\nY ésta es otra"
            });
            break;

        case "add":
            var url = text[-1];
            text.pop();
            text.shift();
            var name = text.join(" ");
            var webpage = {
                url: url,
                name: name,
                user: req.body.user_name
            };
            var status = WebPageService.add(webpage);
            if (status.success) {
                res.json({
                    response_type: "ephemeral",
                    text:"Página web añadida con éxito"
                });
            } else {
                //TODO
            }
            break;

        default:
            res.json({
                response_type: "ephemeral",
                text:"Comando no identificado. Escribe /watch help para más información."
            });

    }

    if (text[0] === "help") {

    } else {

    }

    //TODO res.end();

    /**
    var webpage = new Webpage({
        name : req.body.name,
        url : req.body.url,
        user : req.body.user
    });
    webpage.save(function(err, webpage) {
        if (!err) {
            if (!webpage) {
                next();
            }
            res.json({token: process.env.WATCHBOT_TOKEN});
            //res.json({success: true, msg: 'Successful created new user.'});
        } else {
            res.send(500, err.message);
            //return res.json({success: false, msg: 'Username or e-mail already exists.'});
        }
    });
    */
};

module.exports = {
    data: data
};
