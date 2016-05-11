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

    // if (req.body.text === "start") {
    //     cron.start();
    // }
    //
    // if (req.body.text === "stop") {
    //     cron.stop();
    // }

    if (req.body.text === "help") {
        res.json({
            response_type: "ephemeral",
            text:"Esto es una línea\nY ésta es otra"
        });
    } else {
        res.json({
            response_type: "ephemeral",
            text:"Comando no identificado. Escribe /watch help para más información."
        });
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
