var Webpage  = require('../models/webpage');
var slack    = require('../bot/botkit');
var dotenv   = require('dotenv');

slack.connect();

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
var data = function(req, res, next) {
    res.json(req);
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
    info: info,
    data: data
};
