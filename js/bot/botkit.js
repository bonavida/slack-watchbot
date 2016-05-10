var Botkit   = require('botkit');
var dotenv   = require('dotenv');

/** Carga variables de entorno desde un fichero .env al process.env */
dotenv.load();

/** Controlador */
var controller = Botkit.slackbot({
    debug: false
});

/** Bot */
var bot;

exports.controller = controller;

/**
 * Carga el bot asociado a nuestro canal de Slack a través de un token e inicia el bot
 */
exports.connect = function () {
    bot = controller.spawn({
        token: process.env.WATCHBOT_TOKEN
    });
    bot.startRTM();
};

controller.on('/watch',function(bot, message) {
    // reply to slash command
    bot.replyPublic(message,'Everyone can see this part of the slash command');
    bot.replyPrivate(message,'Only the person who used the slash command can see this.');

});
