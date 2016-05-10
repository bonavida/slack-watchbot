var Webpage  = require('../models/webpage');
var dotenv   = require('dotenv');
var slackAPI  = require('node-slack');

/** Carga variables de entorno desde un fichero .env al process.env */
dotenv.load();

var slack = new slackAPI('https://hooks.slack.com/services/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');

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
    slack.send({
        text: "Hello from the other side!"
    });
    res.end();
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
