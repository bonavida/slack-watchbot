var Webpage  = require('../models/webpage');
var Botkit   = require('botkit');
var dotenv   = require('dotenv');

/** Carga variables de entorno desde un fichero .env al process.env */
dotenv.load();

/** Carga el bot asociado a nuestro canal de Slack a través de un token */
var controller = Botkit.slackbot({
    debug: false
});
var bot = controller.spawn({
    token: process.env.WATCHBOT_TOKEN
});

/** Inicia el bot */
bot.startRTM();


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
            controller.on('/watch',function(bot, message) {
                // reply to slash command
                bot.replyPublic(message,'Everyone can see this part of the slash command');
                bot.replyPrivate(message,'Only the person who used the slash command can see this.');

            });
            //res.json({token: process.env.WATCHBOT_TOKEN});
            //res.json({success: true, msg: 'Successful created new user.'});
        } else {
            res.send(500, err.message);
            //return res.json({success: false, msg: 'Username or e-mail already exists.'});
        }
    });
};

module.exports = {
    info: info,
    data: data
};
